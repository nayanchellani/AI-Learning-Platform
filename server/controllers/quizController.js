import { generateQuiz } from "../services/geminiService.js";
import Quiz from "../models/Quiz.js";

export const generateQuizController = async (req, res) => {
    try {
        const { videoId, title, topic, difficulty } = req.body;
        
        const existingQuiz = await Quiz.findOne({ videoId });
        if (existingQuiz) {
            return res.json(existingQuiz);
        }

        const quizQuestions = await generateQuiz(topic || title, difficulty || "medium");

        const quiz = await Quiz.create({ 
            videoId, 
            title: title || topic, 
            questions: quizQuestions 
        });
        
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuizByVideoId = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ videoId: req.params.videoId });
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const submitQuiz = async (req, res) => {
    try {
        const { videoId, answers } = req.body;
        
        const quiz = await Quiz.findOne({ videoId });
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        let score = 0;
        const results = quiz.questions.map((q, index) => {
            const correctOptionIndex = q.correctAnswer;
            const correctOptionText = q.options[correctOptionIndex];
            const userAnswer = answers[index];
            const isCorrect = userAnswer === correctOptionText;
            if (isCorrect) score++;
            return {
                question: q.question,
                isCorrect,
                correctAnswer: correctOptionText,
                userAnswer,
                explanation: q.explanation
            };
        });

        res.json({
            score,
            totalQuestion: quiz.questions.length,
            results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
