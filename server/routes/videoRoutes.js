import express from "express";
import { getVideos, getTrending, trackVideoProgress } from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", getVideos);
router.get("/trending", getTrending);
router.post("/watch", protect, trackVideoProgress);

export default router;
