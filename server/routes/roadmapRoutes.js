import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    generateRoadmap,
    getPublicRoadmaps,
    getUserRoadmaps,
    getRoadmapById
} from "../controllers/roadmapController.js";

const router = express.Router();

router.post("/generate", protect, generateRoadmap);
router.get("/public", getPublicRoadmaps);
router.get("/my", protect, getUserRoadmaps);
router.get("/:id", getRoadmapById);

export default router;
