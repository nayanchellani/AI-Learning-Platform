import User from "../models/User.js";

export const updateStreak = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActivity = user.progress.streak.lastActivity;

    if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return;
        } else if (diffDays === 1) {
            user.progress.streak.current += 1;
        } else {
            user.progress.streak.current = 1;
        }
    } else {
        user.progress.streak.current = 1;
    }

    if (user.progress.streak.current > user.progress.streak.longest) {
        user.progress.streak.longest = user.progress.streak.current;
    }

    user.progress.streak.lastActivity = now;
    await user.save();
};
