import express from "express";
import session from 'express-session';
import * as mongoose from "mongoose"
import cors from "cors";
import userRoute from "./routes/user.routes.js";
import verifyRoute from "./routes/verify.routes.js";
import authRoute from "./routes/auth.routes.js";
import toolsRoute from "./routes/tools.routes.js";
import channelRouter from "./routes/channel.routes.js"
import passport from "passport";
import cookieParser from 'cookie-parser';

let app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET!,
    resave: false,
    saveUninitialized: false
}));
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());
app.use("/user", userRoute)
app.use("/verify", verifyRoute)
app.use("/auth", authRoute)
app.use("/tools",toolsRoute)
app.use("/channel",channelRouter)

mongoose.connect(process.env.MONGODB_URI!).then(() => {
    app.listen(process.env.PORT!, () => {
        console.log("Server is running on port " + process.env.PORT);
    })
}).catch((err) => {
    console.log(err);
})