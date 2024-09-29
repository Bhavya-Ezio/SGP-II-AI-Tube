import { Comments, Tools } from '../models/tools.js';
import { resBody } from '../models/req&res.js';
import { Request, Response } from "express";
//Schemas
import { Comment, Tool } from '../schemas/tool.schema.js';
import { LikeDislikes, Views } from '../schemas/analytics.schema.js';
import { History } from '../schemas/history.schema.js';

import { StatusCodes } from 'http-status-codes';

const addTool = async (req: Request<{}, resBody, Tools>, res: Response<resBody>) => {
    try {
        const { uploaderID, name, description, category } = req.body;
        if (!req.user || !('id' in req.user)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Unauthorized",
                success: false
            })
        }

        const tool = new Tool({
            uploaderID: req.user.id,
            name: name,
            description,
            category,
            likes: 0,
            dislikes: 0,
            comments: [],
            shares: 0,
            views: 0,
        });
        await tool.save();
        res.json({
            message: 'Tool created successfully',
            success: true,
            data: { toolID: tool._id }
        }).status(StatusCodes.OK);
    } catch (error: any) {
        res.json({
            message: 'Error adding tool',
            success: false,
        }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const addFiles = async (req: Request<{ id: string }, resBody, Tools>, res: Response<resBody>) => {
    try {
        const toolId = req.params.id;
        const tools = await Tool.findById(toolId);
        if (!tools) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }
        const fileKeys = req.files as Array<any>;

        let images = []
        if (fileKeys && "images" in fileKeys) {
            const x = fileKeys.images as Array<any>;
            for (const file of x) {
                if (file && file.key) {
                    images.push(file.key);
                }
            }
        }
        tools.image = images;

        let videos = []
        if (fileKeys && "videos" in fileKeys) {
            const x = fileKeys.videos as Array<any>;
            for (const file of x) {
                if (file && file.key) {
                    videos.push(file.key);
                }
            }
        }
        tools.videos = videos;

        let files = []
        if (fileKeys && "files" in fileKeys) {
            const x = fileKeys.files as Array<any>;
            for (const file of x) {
                if (file && file.key) {
                    files.push(file.key);
                }
            }
        }

        tools.files = files;
        await tools.save();

        res.status(200).json({
            success: true,
            message: 'Media uploaded successfully'
        });
    } catch (error) {
        return res.json({
            success: false,
            message: 'Internal server error'
        }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const searchTools = async (req: Request<{ id: string }, resBody>, res: Response<resBody>) => {
    try {
        const query = req.params.id;
        const regExp = new RegExp(query, 'i');
        const tools = await Tool.find({
            $or: [
                { name: regExp },
                { description: regExp }
            ]
        }, { _id: 1, name: 1, uploaderID: 1 }).populate("uploaderID", { username: 1 })
        return res.json({
            message: "data sent",
            success: true,
            data: tools,
        }).status(StatusCodes.OK);
    } catch (error: any) {
        return res.json({
            message: error.message,
            success: false,
        }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const getToolDetails = async (req: Request<{ id: string }, resBody>, res: Response<resBody>) => {
    try {
        const toolId = req.params.id;
        const tool = await Tool.findById(toolId).select("-_id -__v")
            .populate("comments", { _id: 0, __v: 0 });
        console.log(tool);
        return res.json({
            message: "data sent",
            success: true,
            data: tool!,
        })
    } catch (e: any) {
        console.log(e.message);
        res.json({ message: "Error getting details", success: false })
    }
}

const addComment = async (req: Request<{ id: string }, resBody, Comments>, res: Response<resBody>) => {
    const toolId = req.params.id;
    const { text } = req.body;
    const userId = ("id" in req.user!) ? req.user.id : "";
    try {
        const comment = new Comment({
            text: text,
            userId: userId,
            timestamp: Date.now(),
        })
        await comment.save();

        const response = await Tool.updateOne(
            { _id: toolId },
            {
                $push: { comments: comment._id }
            }
        );

        if (response.modifiedCount == 1) {
            res.json({ message: "done", success: true }).status(StatusCodes.UNAUTHORIZED);
        } else {
            res.json({ message: "Error adding comment", success: false }).status(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    } catch (e: any) {
        console.log(e.message);
        return res.json({ message: "error", success: false })
    }
}

const addLike = async (req: Request<{ id: string }, resBody>, res: Response<resBody>) => {
    try {
        const toolId = req.params.id;
        const userId = ("id" in req.user!) ? req.user.id : "";
        const likeDislike = await LikeDislikes.findOne({ toolId, userId });
        if (likeDislike) {
            if (likeDislike.like) {
                res.json({ message: "Already liked", success: false }).status(StatusCodes.OK);
            } else {
                const response = await Tool.updateOne({ _id: toolId }, { $inc: { likes: 1, dislikes: -1 } });
                if (response.modifiedCount == 1) {
                    await LikeDislikes.updateOne({ toolId, userId }, { like: true });
                    res.json({ message: "Done", success: true }).status(StatusCodes.OK);
                } else {
                    res.json({ message: "Error occured", success: false }).status(StatusCodes.INTERNAL_SERVER_ERROR);
                }
            }
        } else {
            const likeDislike = new LikeDislikes({ toolId, userId, like: true });
            await likeDislike.save();
            const response = await Tool.updateOne({ _id: toolId }, { $inc: { likes: 1 } });
            if (response.modifiedCount == 1) {
                res.json({ message: "Done", success: true }).status(StatusCodes.OK);
            } else {
                res.json({ message: "Error occured", success: false }).status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        }
    } catch (error) {
        res.json({ message: "Error occured", success: false }).status(StatusCodes.OK);
    }
}

const addDislike = async (req: Request<{ id: string }, resBody>, res: Response<resBody>) => {
    try {
        const toolId = req.params.id;
        const userId = ("id" in req.user!) ? req.user.id : "";
        const likeDislike = await LikeDislikes.findOne({ toolId, userId });
        if (likeDislike) {
            if (!likeDislike.like) {
                res.json({ message: "Already disliked", success: false }).status(StatusCodes.OK);
            } else {
                const response = await Tool.updateOne({ _id: toolId }, { $inc: { dislikes: 1, likes: -1 } });
                if (response.modifiedCount == 1) {
                    await LikeDislikes.updateOne({ toolId, userId }, { like: false });
                    res.json({ message: "Done", success: true }).status(StatusCodes.OK);
                } else {
                    res.json({ message: "Error occured", success: false }).status(StatusCodes.INTERNAL_SERVER_ERROR);
                }
            }
        } else {
            const likeDislike = new LikeDislikes({ toolId, userId, like: false });
            await likeDislike.save();
            const response = await Tool.updateOne({ _id: toolId }, { $inc: { dislikes: 1 } });
            if (response.modifiedCount == 1) {
                res.json({ message: "Done", success: true }).status(StatusCodes.OK);
            } else {
                res.json({ message: "Error occured", success: false }).status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        }
    } catch (error) {
        res.json({ message: "Error occured", success: false }).status(StatusCodes.OK);
    }
}


const addView = async (req: Request<{ id: string }, resBody>, res: Response<resBody>) => {
    try {
        const toolId = req.params.id;
        const userId = ("id" in req.user!) ? req.user.id : "";
        const view = await Views.findOne({ toolId, userId });
        if (view) {
            res.json({ message: "Already viewed", success: false }).status(StatusCodes.OK);
        } else {
            const view = new Views({ toolId, userId });
            await view.save();
            const response = await Tool.updateOne({ _id: toolId }, { $inc: { views: 1 } });
            if (response.modifiedCount == 1) {
                res.json({ message: "View added", success: true }).status(StatusCodes.OK);
            } else {
                res.json({ message: "Error occurred", success: false }).status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        }
    } catch (error) {
        res.json({ message: "Error occurred", success: false }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const addHistory = async (req: Request<{ id: string }, resBody>, res: Response<resBody>) => {
    try {
        const toolId = req.params.id;
        const userId = ("id" in req.user!) ? req.user.id : "";
        const history = await History.findOne({ toolId, userId });
        if (history) {
            history.viewedAt = new Date();
            await history.save();
            res.json({ message: "History updated", success: false }).status(StatusCodes.OK);
        } else {
            const history = new History({ toolId, userId });
            await history.save();
            res.json({ message: "History added", success: true }).status(StatusCodes.OK);
        }
    } catch (error) {
        res.json({ message: "Error occurred", success: false }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

export { addTool, addFiles, searchTools, getToolDetails, addComment, addDislike, addLike, addView, addHistory }