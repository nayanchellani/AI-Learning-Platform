import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";

dotenv.config({ path: "../.env" });
const app = express();
const PORT = process.env.PORT || 5000;


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet());


app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/roadmaps', roadmapRoutes);


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => console.log(error));
