import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { resBody } from '../models/req&res.js';
import { User } from '../models/user.js';
import { authenticateToken } from '../middleware/authenticate.js';
import { addSubscriber,getDetails,getTools} from '../controllers/channel.controller.js';

const router = Router();

router.route('/subscribe/:channelId').all(authenticateToken).post(addSubscriber);

router.route("/getDetails/:channelName").get(getDetails);

router.route("/getTools/:channelName").get(getTools)

export default router;