import * as youtubeService from "../services/youtubeService.js";
import User from "../models/User.js";

export const getVideos = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: "Search query is required" });

        const videos = await youtubeService.searchVideos(q);
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTrending = async (req, res) => {
    try {
        const videos = await youtubeService.getTrendingVideos();
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const trackVideoProgress = async (req, res) => {
    try {
        const { videoId, title, duration, completed } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const videoIndex = user.progress.videosWatched.findIndex(v => v.videoId === videoId);

        if (videoIndex > -1) {
            user.progress.videosWatched[videoIndex].watchedAt = Date.now();
            user.progress.videosWatched[videoIndex].completed = completed;
        } else {
            user.progress.videosWatched.push({ videoId, title, duration, completed });
        }

        await user.save();
        res.status(200).json({ message: "Progress updated", progress: user.progress });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
