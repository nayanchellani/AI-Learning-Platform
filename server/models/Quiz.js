import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },

    options: {
        type: [String],
        required: true
    },

    correctAnswer: {
        type: Number,
        required: true
    },

    explanation: {
        type: String
    }
});

const quizSchema = new mongoose.Schema({

    videoId: {
        type: String,
        required: true
    },

    title: {
        type: String
    },

    questions: [questionSchema],

    createdAt: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model("Quiz", quizSchema);
