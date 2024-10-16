import { Request, Response } from "express";
import { resBody } from "../models/req&res.js";
import { User } from "../models/user.js";

import user from "../schemas/user.schema.js";
import { Tool } from "../schemas/tool.schema.js";
import { StatusCodes } from "http-status-codes";

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

const getDetails = async (req: Request<{ channelName: string }, resBody, User>, res: Response<resBody>) => {
    try {
        const { channelName } = req.params;
        const channel1 = await user.findOne({ username: channelName }).select("username subscribers noOfTools views");

        if (channel1) {
            return res.json({
                message: "Details sent.",
                success: true,
                data: channel1
            })
        } else {
            return res.json({
                message: "Error fetching data",
                success: false
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
}

const getTools = async (req: Request<{ channelName: string }, resBody, User>, res: Response<resBody>) => {
    try {
        const { channelName } = req.params;
        const u = await user.findOne({ username: channelName })
        const channel1 = await Tool.find({ uploaderID: u?._id }).select("-__v -uploaderID -videos -files");
        return res.json({
            message: "Data sent",
            success: true,
            data: channel1
        }).status(StatusCodes.OK)
    } catch (e) {
        console.log(e)  
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching data",
            success: false
        })
    }
}

export { addSubscriber, getDetails, getTools };
