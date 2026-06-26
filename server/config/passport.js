import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const initializePassport = () => {
    console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";
    console.log("GOOGLE_CALLBACK_URL:", callbackURL);

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: callbackURL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        return done(null, user);
                    }

                    user = await User.create({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        password: "google-oauth",
                        avatar: profile.photos[0]?.value || "",
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
};

export { passport, initializePassport };
