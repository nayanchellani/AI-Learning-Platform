import express from "express";
import { reviewCodeController } from "../controllers/codeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/review", protect, reviewCodeController);

export default router;
