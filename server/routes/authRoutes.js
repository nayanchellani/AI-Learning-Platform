import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { passport } from "../config/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
}));

router.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`
}), (req, res) => {
    const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`);
});

export default router;