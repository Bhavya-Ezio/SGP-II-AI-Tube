import { Router, json, Request, Response } from "express";
const router = Router();
router.use(json());
import { authenticateToken } from "../middleware/authenticate.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { resBody } from "../models/req&res.js";
import { User } from "../models/user.js";
import { createUser, getProfile, loginUser, updateUser, addImg } from "../controllers/user.controller.js";
import { Types } from "mongoose";
import { upload } from "../middleware/multer.js";


router.post("/signup", async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    try {
        const body = req.body;
        if (!body.name || !body.email || !body.username || !body.password || !body.DOB || !body.gender || !body.Description || !body.About) {
            return res.json({
                message: "Please fill all the fields",
                success: false,
            }).status(StatusCodes.BAD_REQUEST)
        }
        const resposne = await createUser(body);
        if (resposne.success) {
            return res.json({
                message: "User created",
                success: true,
            }).status(StatusCodes.OK)
        } else {
            return res.json({
                message: "Error adding user",
                success: false,
            }).status(StatusCodes.INTERNAL_SERVER_ERROR)
        }
    } catch (error: any) {
        console.log(error);
        return res.json({
            message: "Error adding user",
            success: false,
        }).status(StatusCodes.INTERNAL_SERVER_ERROR)
    }
})

router.post("/addImg", authenticateToken, upload.single("image"), async (req: Request, res: Response) => {
    if (req.file) {
        const id = ((req.user && "id" in req.user) ? req.user.id : new Types.ObjectId()) as Types.ObjectId;
        const response = await addImg(id, req.file);
        if (response.success) {
            return res.json({
                message: response.message,
                success: true,
            }).status(StatusCodes.OK)
        } else {
            return res.json({
                message: response.message,
                success: false,
            }).status(StatusCodes.INTERNAL_SERVER_ERROR)
        }
    } else {
        return res.json({
            message: "No image uploaded",
            success: false,
        }).status(StatusCodes.BAD_REQUEST)
    }
})

router.post("/login", async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    const body = req.body;
    if (!body.username || !body.password) {
        return res.json({
            message: "Please fill all the fields",
            success: false
        }).status(StatusCodes.BAD_REQUEST);
    }
    const response = await loginUser(body);
    if (response.success) {
        const id = response.data;
        const token = jwt.sign({ id: response.data }, process.env.ACCESS_TOKEN_SECRET!);
        return res.cookie("accessToken", token).json({
            message: response.message,
            success: true,
        }).status(StatusCodes.OK);
    } else {
        return res.json({
            message: response.message,
            success: false,
        }).status(StatusCodes.UNAUTHORIZED);
    }
})

router.get("/logout", authenticateToken, (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.json({
        message: "Logged out",
        success: true
    }).status(StatusCodes.OK)
})

router.get("/verify", authenticateToken, (req: Request, res: Response) => {
    res.json({
        message: "done",
        success: true
    })
})

router.put("/update", authenticateToken, async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    const body = req.body;
    const id = ((req.user && "id" in req.user) ? req.user.id : new Types.ObjectId()) as Types.ObjectId;
    const response = await updateUser(body, id);
    if (response.success) {
        return res.json({
            message: response.message,
            success: true,
        }).status(StatusCodes.OK)
    } else {
        return res.json({
            message: response.message,
            success: false,
        }).status(StatusCodes.INTERNAL_SERVER_ERROR)
    }
})

router.get("/profile", authenticateToken, getProfile)
export default router;