import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { passport, initializePassport } from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();
dotenv.config({ path: "../.env" });

initializePassport();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/search', searchRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
