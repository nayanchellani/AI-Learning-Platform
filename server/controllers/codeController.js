import { reviewCode } from "../services/geminiService.js";
import User from "../models/User.js";

export const reviewCodeController = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ message: "Code is required" });
        }

        if (code.length > 5000) {
            return res.status(400).json({ message: "Code too large. Maximum 5000 characters." });
        }

        const validLanguages = ["javascript", "python", "java", "cpp", "typescript", "c", "go", "rust"];
        const lang = validLanguages.includes(language) ? language : "javascript";

        const feedback = await reviewCode(code, lang);

        const scoreNum = parseInt(feedback.score) || 0;
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                "progress.codeReviews": {
                    score: scoreNum,
                    language: lang,
                    reviewedAt: new Date()
                }
            }
        });

        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
