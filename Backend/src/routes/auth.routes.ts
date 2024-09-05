import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import "../config/passport.config.js";
import { resBody } from '../models/req&res.js';
import { User } from '../models/user.js';

const router = Router();
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}))

router.get('/google/redirect', passport.authenticate('google'), (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    console.log("redirected");
    console.log((req.user as User)._id);
    const token = jwt.sign({ id: (req.user as User)._id }, process.env.ACCESS_TOKEN_SECRET!)
    res.cookie("accessToken", token).redirect("to frontend home page")//change it later
})

export default router;