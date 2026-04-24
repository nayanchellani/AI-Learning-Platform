import Roadmap from "../models/Roadmap.js";
import { createRoadmap, fetchVideoForNode } from "../services/roadmapService.js";

export const deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        if (roadmap.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this roadmap" });
        }

        await Roadmap.findByIdAndDelete(req.params.id);
        res.json({ message: "Roadmap deleted successfully" });
    } catch (err) {
        console.error("Delete Roadmap Error:", err);
        res.status(500).json({ message: "Failed to delete roadmap" });
    }
};

export const generateRoadmap = async (req, res) => {
    try {
        const { title, category, level, timeCommitment, learningGoals } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }
        if (!category || !category.trim()) {
            return res.status(400).json({ message: "Category is required" });
        }

        const roadmap = await createRoadmap(req.user._id, {
            title: title.trim(),
            category: category.trim(),
            level: level || "beginner",
            timeCommitment: timeCommitment || "moderate",
            learningGoals: learningGoals || []
        });

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
            .populate("createdBy", "username")
            .lean();

        const result = roadmaps.map(r => ({
            ...r,
            nodeCount: r.nodes?.length || 0,
            nodes: undefined
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
        const roadmap = await Roadmap.findById(req.params.id)
            .populate("createdBy", "username")
            .lean();

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        res.json(roadmap);
    } catch (err) {
        console.error("Get Roadmap Error:", err);
        res.status(500).json({ message: "Failed to fetch roadmap" });
    }
};


export const toggleVisibility = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        if (roadmap.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        roadmap.isPublic = !roadmap.isPublic;
        await roadmap.save();

        res.json({ isPublic: roadmap.isPublic });
    } catch (err) {
        console.error("Toggle Visibility Error:", err);
        res.status(500).json({ message: "Failed to update visibility" });
    }
};

export const toggleNodeComplete = async (req, res) => {
    try {
        const { nodeId } = req.body;
        const roadmap = await Roadmap.findById(req.params.id);

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        if (roadmap.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!roadmap.completedNodes) {
            roadmap.completedNodes = [];
        }

        const idx = roadmap.completedNodes.indexOf(nodeId);
        if (idx === -1) {
            roadmap.completedNodes.push(nodeId);
        } else {
            roadmap.completedNodes.splice(idx, 1);
        }

        await roadmap.save();

        res.json({
            completedNodes: roadmap.completedNodes,
            progress: roadmap.nodes.length > 0
                ? Math.round((roadmap.completedNodes.length / roadmap.nodes.length) * 100)
                : 0
        });
    } catch (err) {
        console.error("Toggle Node Complete Error:", err);
        res.status(500).json({ message: "Failed to update node" });
    }
};

export const cloneRoadmap = async (req, res) => {
    try {
        const original = await Roadmap.findById(req.params.id).lean();

        if (!original) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        if (!original.isPublic) {
            return res.status(403).json({ message: "Roadmap is not public" });
        }

        // Check if user already cloned this roadmap
        const existing = await Roadmap.findOne({
            createdBy: req.user._id,
            clonedFrom: original._id
        });

        if (existing) {
            return res.status(400).json({ message: "Already in your roadmaps", roadmapId: existing._id });
        }

        const cloned = await Roadmap.create({
            title: original.title,
            description: original.description,
            category: original.category,
            level: original.level,
            timeCommitment: original.timeCommitment,
            learningGoals: original.learningGoals || [],
            createdBy: req.user._id,
            isPublic: false,
            nodes: original.nodes,
            completedNodes: [],
            clonedFrom: original._id
        });

        res.status(201).json(cloned);
    } catch (err) {
        console.error("Clone Roadmap Error:", err);
        res.status(500).json({ message: "Failed to add roadmap" });
    }
};

export const getNodeVideo = async (req, res) => {
    try {
        const { id, nodeId } = req.params;
        const video = await fetchVideoForNode(id, nodeId);
        res.json({ video: video || null });
    } catch (err) {
        console.error("Get Node Video Error:", err);
        res.status(500).json({ message: "Failed to fetch video" });
    }
};
