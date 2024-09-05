import { Comments, Tools } from '../models/tools.js';
import { resBody } from '../models/req&res.js';
import { Request, Response } from "express";
//Schemas
import { Comment, Tool } from '../schemas/tool.schema.js';

import { StatusCodes } from 'http-status-codes';

const addTool = async (req: Request<{}, resBody, Tools>, res: Response<resBody>) => {
    try {
        const { uploaderID, name, description } = req.body;
        if (!req.user || !('id' in req.user)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Unauthorized",
                success: false
            })
        }

        const tool = new Tool({
            uploaderID: req.user.id,
            name: name,
            description: description,
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
export { addTool, addFiles, searchTools }