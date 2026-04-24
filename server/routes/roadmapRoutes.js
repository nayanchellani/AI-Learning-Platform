import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    generateRoadmap,
    getPublicRoadmaps,
    getUserRoadmaps,
    getRoadmapById,
    toggleVisibility,
    toggleNodeComplete,
    cloneRoadmap,
    getNodeVideo,
    deleteRoadmap
} from "../controllers/roadmapController.js";

const router = express.Router();

router.post("/generate", protect, generateRoadmap);
router.get("/public", getPublicRoadmaps);
router.get("/my", protect, getUserRoadmaps);
router.get("/:id", getRoadmapById);
router.patch("/:id/visibility", protect, toggleVisibility);
router.post("/:id/complete-node", protect, toggleNodeComplete);
router.post("/:id/clone", protect, cloneRoadmap);
router.delete("/:id", protect, deleteRoadmap);
router.get("/:id/node/:nodeId/video", getNodeVideo);

export default router;
