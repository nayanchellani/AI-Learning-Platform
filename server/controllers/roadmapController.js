import Roadmap from "../models/Roadmap.js";
import { createRoadmap } from "../services/roadmapService.js";

export const generateRoadmap = async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic || !topic.trim()) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const roadmap = await createRoadmap(req.user._id, topic.trim());
        res.status(201).json(roadmap);
    } catch (err) {
        console.error("Generate Roadmap Error:", err);
        res.status(500).json({ message: "Failed to generate roadmap" });
    }
};

export const getPublicRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ isPublic: true })
            .sort({ createdAt: -1 })
            .select("title description level nodes saves createdAt")
            .lean();

        // Add node count for each roadmap
        const result = roadmaps.map(r => ({
            ...r,
            nodeCount: r.nodes?.length || 0,
            nodes: undefined // Don't send full nodes in list view
        }));

        res.json(result);
    } catch (err) {
        console.error("Get Public Roadmaps Error:", err);
        res.status(500).json({ message: "Failed to fetch roadmaps" });
    }
};

export const getUserRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        const result = roadmaps.map(r => ({
            ...r,
            nodeCount: r.nodes?.length || 0
        }));

        res.json(result);
    } catch (err) {
        console.error("Get User Roadmaps Error:", err);
        res.status(500).json({ message: "Failed to fetch your roadmaps" });
    }
};

export const getRoadmapById = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id).lean();

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        res.json(roadmap);
    } catch (err) {
        console.error("Get Roadmap Error:", err);
        res.status(500).json({ message: "Failed to fetch roadmap" });
    }
};
