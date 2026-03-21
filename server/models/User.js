import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ""
    },
    skillLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },
    progress: {
        videosWatched: [{
            videoId: String,
            title: String,
            watchedAt: { type: Date, default: Date.now },
            duration: Number,
            completed: { type: Boolean, default: false }
        }],
        quizzesCompleted: [{
            quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
            topic: String,
            score: Number,
            totalQuestions: Number,
            completedAt: { type: Date, default: Date.now }
        }],
        streak: {
            current: { type: Number, default: 0 },
            longest: { type: Number, default: 0 },
            lastActivity: { type: Date, default: null }
        },
        codingTime: {
            total: { type: Number, default: 0 },
            sessions: [{
                date: { type: Date, default: Date.now },
                duration: Number
            }]
        },
        codeReviews: [{
            score: Number,
            language: String,
            reviewedAt: { type: Date, default: Date.now }
        }]
    },
    preferences: {
        theme: { type: String, default: "dark" },
        notifications: { type: Boolean, default: true },
        preferredLanguages: [{ type: String }]
    }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
