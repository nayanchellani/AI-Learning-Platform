import mongoose from "mongoose";

const SearchCacheSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    results: {
        videos: Array,
        docs: Array
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Cache expires automatically after 24 hours (86400 seconds)
    }
});

export default mongoose.model("SearchCache", SearchCacheSchema);
