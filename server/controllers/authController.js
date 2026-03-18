import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters" });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedpassword
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        })
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};


export const loginUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        })
        res.status(200).json({ message: "User logged in successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }

};


export const logoutUser = async (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { username, bio, skillLevel } = req.body;
        
        // Find user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if username is being changed and if it's already taken
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                return res.status(400).json({ message: "Username is already taken" });
            }
            user.username = username;
        }

        // Update fields if provided
        if (bio !== undefined) user.bio = bio;
        if (skillLevel) {
            if (["beginner", "intermediate", "advanced"].includes(skillLevel)) {
                user.skillLevel = skillLevel;
            } else {
                return res.status(400).json({ message: "Invalid skill level" });
            }
        }

        const updatedUser = await user.save();
        
        // Return user without password
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        
        res.json(userResponse);
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error while updating profile" });
    }
};