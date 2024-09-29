import { Request, Response } from "express";
import { resBody } from "../models/req&res.js";
import { User } from "../models/user.js";

import user from "../schemas/user.schema.js";

const addSubscriber = async (req: Request<{ channelId: string }, resBody, User>, res: Response<resBody>) => {
    try {
        const { channelId } = req.params;
        const userId = ("id" in req.user!) ? req.user.id : "";

        const user1 = await user.findById(userId);
        const channel1 = await user.findById(channelId);

        if (!user1 || !channel1) {
            return res.status(404).json({
                message: 'User or channel not found',
                success: false
            });
        } else {
            user1.SubTo.push(channel1._id);
            await user1.save();
            channel1.subscribers++;
            await channel1.save();
            return res.status(200).json({
                message: 'User subscribed to channel',
                success: true
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
}

export { addSubscriber };
