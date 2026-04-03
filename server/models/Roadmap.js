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
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    nodes: [nodeSchema],
    saves: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model("Roadmap", roadmapSchema);
