import express from "express";
import { generateQuizController, getQuizByVideoId, submitQuiz } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateQuizController);
router.get("/:videoId", protect, getQuizByVideoId);
router.post("/submit", protect, submitQuiz);

export default router;
