import { Comments, Tools } from '../models/tools.js';
import { resBody } from '../models/req&res.js';
import { Request, Response } from "express";
//Schemas
import { Comment, Tool } from '../schemas/tool.schema.js';
import { LikeDislikes, Views } from '../schemas/analytics.schema.js';
import { Category } from '../schemas/categories.js';

import { StatusCodes } from 'http-status-codes';

const addTool = async (req: Request<{}, resBody, Tools>, res: Response<resBody>) => {
    try {
        const { name, description, /* category, */ price } = req.body;
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
            price,
            /* category, */
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

const searchTools = async (
    req: Request<{ search: string }, {}, {}, { page?: string }>,
    res: Response<resBody>
) => {
    try {
        const query = req.params.search;

        // Pagination settings
        const page = parseInt(req.query.page || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        // Fetch tools with pagination
        const tools = await Tool.find({
            $text: { $search: query }
        })
            .populate("uploaderID", { username: 1 })
            .sort({ score: { $meta: "textScore" } }) // Sort by relevance score
            .skip(skip)
            .limit(limit)
            .select({ score: { $meta: "textScore" } }); // Include score in results

        return res.status(StatusCodes.OK).json({
            message: "Data sent",
            success: true,
            data: tools,
        });
    } catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            success: false,
        });
    }
};


const getToolDetails = async (req: Request<{ id: string }, resBody>, res: Response<resBody>) => {
    try {
        const toolId = req.params.id;
        const tool = await Tool.findById(toolId)
            .select("-_id -__v")
            .populate({
                path: 'comments',
                select: '-_id -__v',
                populate: {
                    path: 'userId',
                    select: 'username'
                }
            });
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
            view.viewedAt = new Date();
            await view.save();
            res.json({ message: "Updated", success: true }).status(StatusCodes.OK);
        } else {
            const view = new Views({ toolId, userId, viewedAt: new Date() });
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

const addShare = async (req: Request<{ id: string }, resBody>, res: Response<resBody>) => {
    const toolId = req.params.id;
    const tool = await Tool.updateOne({ _id: toolId }, { $inc: { shares: 1 } });
    if (tool.modifiedCount == 1) {
        return res.json({
            message: "Share added",
            success: true
        }).status(StatusCodes.OK);
    } else {
        return res.json({
            message: "Error occurred",
            success: false
        }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find();
        return res.json({
            message: "Categories fetched successfully",
            success: true,
            data: categories
        }).status(StatusCodes.OK);
    } catch (error) {
        return res.json({
            message: "Error fetching categories",
            success: false
        }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const deleteTool = async (req: Request<{ id: string }, resBody>, res: Response<resBody>) => {
    try {
        const toolId = req.params.id;
        const response = await Tool.deleteOne({ _id: toolId });
        if (response.deletedCount === 1) {
            return res.json({
                message: "Deleted Successfully",
                success: true,
            })
        } else {
            return res.json({
                message: "Error Occured while deleting",
                success: false,
            })
        }
    } catch (e) {
        return res.json({
            message: "Error Occured while deleting",
            success: false,
        })
    }
}

const getTools = async (req: Request<{}, resBody, {}, { page?: string }>, res: Response<resBody>) => {
    try {
        // Pagination settings
        const page = parseInt(req.query.page || '1');
        const limit = 20;
        const skip = (page - 1) * limit;
        const tools = await Tool.find().limit(30).skip(skip).limit(limit);
        tools.sort((a, b) => {
            const scoreA = Number(a.views) + Number(a.likes) - Number(a.dislikes);
            const scoreB = Number(b.views) + Number(b.likes) - Number(b.dislikes);
            return scoreB - scoreA; // Sort in descending order
        });
        return res.json({
            message: "Data sent",
            success: true,
            data: tools
        })
    } catch (error) {
        return res.json({
            message: "Error fetching data",
            success: false,
        })
    }
}

export { addTool, addFiles, searchTools, getToolDetails, addComment, addDislike, addLike, addView, addShare, getCategories, deleteTool, getTools }
