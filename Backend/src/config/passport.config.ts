import passport from 'passport';
import { Strategy as GoogleSigninStrategy } from 'passport-google-oauth20';
import User from '../schemas/user.schema.js';


passport.use(
    new GoogleSigninStrategy({
        callbackURL: '/auth/google/redirect',
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        passReqToCallback: true
    },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                console.log(profile._json);
                const user1 = await User.findOne({ googleID: profile.id });
                if (user1) {
                    return done(null, user1);
                } else {
                    const newUser = new User({
                        googleID: profile.id,
                        username: profile.displayName,
                        name: profile._json.name
                    });
                    await newUser.save();
                    return done(null, newUser);
                }
            } catch (error) {
                console.error("error in callback", error);
            }
        })
);

passport.serializeUser((user, done) => {
    done(null, (user as Express.User & { id: string }).id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    })
});