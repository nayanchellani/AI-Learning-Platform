import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema({
    id: String,
    title: String,
    description: String,
    type: {
        type: String,
        enum: ["video", "article"]
    },
    order: Number,
    searchQuery: String,
    video: {
        videoId: String,
        title: String,
        thumbnail: String,
        channelTitle: String,
        duration: String,
        views: String
    }
});

const roadmapSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },
    timeCommitment: {
        type: String,
        enum: ["light", "moderate", "intensive"],
        default: "moderate"
    },
    learningGoals: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    nodes: [nodeSchema],
    completedNodes: [String],
    clonedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap"
    }
}, { timestamps: true });

export default mongoose.model("Roadmap", roadmapSchema);
