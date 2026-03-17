import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const initializePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/auth/google/callback",
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
