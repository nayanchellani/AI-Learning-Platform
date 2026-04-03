import Roadmap from "../models/Roadmap.js";
import { generateRoadmapAI } from "./geminiService.js";
import { searchVideos } from "./youtubeService.js";

/**
 * Generate a roadmap via AI (no YouTube videos on creation — lazy loaded).
 */
export const createRoadmap = async (userId, { title, category, level, timeCommitment, learningGoals }) => {
    const aiData = await generateRoadmapAI({ title, category, level, timeCommitment, learningGoals });

    const roadmap = await Roadmap.create({
        title: aiData.title || title,
        description: aiData.description,
        category,
        level: level || aiData.level || "beginner",
        timeCommitment: timeCommitment || "moderate",
        learningGoals: learningGoals || [],
        createdBy: userId,
        isPublic: false,
        nodes: aiData.nodes || [],
        completedNodes: []
    });

    return roadmap;
};

/**
 * Fetch a curated YouTube video for a specific node (lazy loading).
 */
export const fetchVideoForNode = async (roadmapId, nodeId) => {
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) throw new Error("Roadmap not found");

    const node = roadmap.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error("Node not found");

    // If video already cached, return it
    if (node.video && node.video.videoId) {
        return node.video;
    }

    // Search YouTube for this node's topic
    try {
        const query = `${node.title} ${roadmap.title} tutorial`;
        const videos = await searchVideos(query, 1);

        if (videos && videos.length > 0) {
            const v = videos[0];
            const videoData = {
                videoId: v.videoId,
                title: v.title,
                thumbnail: v.thumbnail,
                channelTitle: v.channelTitle,
                duration: v.duration,
                views: v.views
            };

            // Cache the video on the node
            node.video = videoData;
            await roadmap.save();

            return videoData;
        }
    } catch (err) {
        console.error(`YouTube search failed for node "${node.title}":`, err.message);
    }

    return null;
};
