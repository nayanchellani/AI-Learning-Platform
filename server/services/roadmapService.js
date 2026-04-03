import Roadmap from "../models/Roadmap.js";
import { generateRoadmapAI } from "./geminiService.js";
import { searchVideos } from "./youtubeService.js";

/**
 * Search YouTube for a single best video for a roadmap node topic.
 * Returns the top result or null.
 */
const findVideoForNode = async (nodeTitle, roadmapTopic) => {
    try {
        const query = `${nodeTitle} ${roadmapTopic} tutorial`;
        const videos = await searchVideos(query, 1);
        if (videos && videos.length > 0) {
            const v = videos[0];
            return {
                videoId: v.videoId,
                title: v.title,
                thumbnail: v.thumbnail,
                channelTitle: v.channelTitle,
                duration: v.duration,
                views: v.views
            };
        }
        return null;
    } catch (err) {
        console.error(`YouTube search failed for node "${nodeTitle}":`, err.message);
        return null;
    }
};

/**
 * Generate a roadmap via AI, then enrich each node with a curated YouTube video.
 */
export const createRoadmap = async (userId, topic) => {
    // Step 1: AI generates the roadmap structure
    const aiData = await generateRoadmapAI(topic);

    // Step 2: For each node, find a curated YouTube video (parallel, max 3 concurrent)
    const nodes = aiData.nodes || [];
    const enrichedNodes = [];

    // Process in batches of 3 to avoid hitting API rate limits
    for (let i = 0; i < nodes.length; i += 3) {
        const batch = nodes.slice(i, i + 3);
        const results = await Promise.all(
            batch.map(async (node) => {
                const video = await findVideoForNode(node.title, aiData.title);
                return {
                    ...node,
                    video: video || undefined
                };
            })
        );
        enrichedNodes.push(...results);
    }

    // Step 3: Save to DB
    const roadmap = await Roadmap.create({
        title: aiData.title,
        description: aiData.description,
        level: aiData.level || "beginner",
        createdBy: userId,
        isPublic: true,
        nodes: enrichedNodes
    });

    return roadmap;
};
