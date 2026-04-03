import axios from "axios";

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

const MIN_DURATION_SECONDS = 300; // 5 minutes

/**
 * Parse ISO 8601 duration (e.g. "PT12M30S") to total seconds.
 */
const parseDuration = (ptString) => {
    if (!ptString || ptString === "PT0S") return 0;
    const match = ptString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const h = parseInt(match[1]) || 0;
    const m = parseInt(match[2]) || 0;
    const s = parseInt(match[3]) || 0;
    return h * 3600 + m * 60 + s;
};

export const searchVideos = async (query, maxResults = 12) => {
    try {
        const API_KEY = process.env.YOUTUBE_API_KEY;

        const preferredChannels = "CodeWithHarry OR Apna College OR Sheryians Coding School OR Programming with Mosh OR Coding with Sagar OR Chai aur Code OR BroCode";

        // Over-fetch to compensate for duration filtering
        const fetchCount = maxResults * 3;
        
        const searchRes = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
            params: {
                part: "snippet",
                q: `${query} tutorial (${preferredChannels}) -movie -trailer -shorts -short`,
                type: "video",
                videoDuration: "medium",   // 4-20 min — eliminates Shorts at API level
                order: "relevance",
                maxResults: fetchCount,
                key: API_KEY
            }
        });

        const items = searchRes.data.items;
        if (!items || items.length === 0) return [];

        const videoIds = items.map(item => item.id.videoId).join(",");

        const detailsRes = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
            params: {
                part: "contentDetails,statistics",
                id: videoIds,
                key: API_KEY
            }
        });

        const allVideos = items.map(item => {
            const details = detailsRes.data.items.find(d => d.id === item.id.videoId);
            return {
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                duration: details?.contentDetails?.duration || "PT0S",
                views: details?.statistics?.viewCount || "0"
            };
        });

        // Filter: only keep videos >= 5 minutes
        return allVideos
            .filter(v => parseDuration(v.duration) >= MIN_DURATION_SECONDS)
            .slice(0, maxResults);

    } catch (error) {
        console.error("YouTube Service Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch videos from YouTube");
    }
};

export const getTrendingVideos = async (maxResults = 10) => {
    try {
        const API_KEY = process.env.YOUTUBE_API_KEY;

        const response = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
            params: {
                part: "snippet,statistics,contentDetails",
                chart: "mostPopular",
                maxResults,
                key: API_KEY
            }
        });

        return response.data.items.map(video => ({
            videoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            views: video.statistics?.viewCount || "0",
            duration: video.contentDetails?.duration || "PT0S"
        }));
    } catch (error) {
        console.error("YouTube Trending Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch trending videos");
    }
};