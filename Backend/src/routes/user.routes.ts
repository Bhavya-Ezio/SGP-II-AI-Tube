import { Router, json, Request, Response } from "express";
const router = Router();
router.use(json());
import { authenticateToken } from "../middleware/authenticate.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { resBody } from "../models/req&res.js";
import { User } from "../models/user.js";
import { getLibrary, createUser, getProfile, loginUser, updateUser, addImg, addDetails, getHistory, addToLibrary, removeFromLibrary } from "../controllers/user.controller.js";
import { Types } from "mongoose";
import { upload } from "../middleware/multer.js";


router.post("/signup", async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    try {
        const body = req.body;
        if (!body.name || !body.email || !body.username || !body.password) {
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

router.post("/addDetails", async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    try {
        const body = req.body;
        if (!body.username || !body.DOB || !body.gender || !body.Description || !body.About) {
            return res.json({
                message: "Please fill all the fields",
                success: false,
            }).status(StatusCodes.BAD_REQUEST)
        }
        const resposne = await addDetails(body);
        if (resposne.success) {
            return res.json({
                message: "User details added",
                success: true,
            }).status(StatusCodes.OK)
        } else {
            return res.json({
                message: "Error adding details",
                success: false,
            }).status(StatusCodes.INTERNAL_SERVER_ERROR)
        }
    } catch (error: any) {
        console.log(error);
        return res.json({
            message: "Error adding details",
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
                data: response.data,
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
        return res.cookie("accessToken", token, { maxAge: 7 * 24 * 60 * 60 * 1000 }).json({
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

router.get("/getHistory", authenticateToken, async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    try {
        if (req.user && "id" in req.user) {
            const id = req.user.id as Types.ObjectId;
            const response = await getHistory(id);
            if (response.success) {
                return res.json(response).status(StatusCodes.OK);
            } else {
                return res.json(response).status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        }
    } catch (error: any) {
        console.log(error.message);
        return res.json({
            message: "Error fetching data",
            success: false,
        }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
})

router.get("/library", authenticateToken, async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    try {
        if (req.user && "id" in req.user) {
            const id = req.user.id as Types.ObjectId; // Ensure id is of type ObjectId
            const response = await getLibrary(id);
            return res.json(response).status(StatusCodes.OK); // Return the response
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "User not authorized",
                success: false,
            });
        }
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching library",
            success: false,
        });
    }
})

router.post("/addToLibrary", authenticateToken, async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    try {
        const { _id } = req.body;
        if (req.user && "id" in req.user) {
            const id = req.user.id as Types.ObjectId;
            const response = await addToLibrary(id, _id);
            if (response.success) {
                return res.json(response).status(StatusCodes.OK);
            } else {
                return res.json(response).status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        }
    } catch (error: any) {
        console.log(error.message);
        return res.json({
            message: "Error adding to library",
            success: false,
        }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }

})

router.post("/remove", authenticateToken, async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    try {
        const { _id } = req.body;
        if (req.user && "id" in req.user) {
            console.log("tool id: ",_id);
            const id = req.user.id as Types.ObjectId;
            const response = await removeFromLibrary(id, _id);
            if (response.success) { return res.json(response).status(StatusCodes.OK); }
            else { return res.json(response).status(StatusCodes.INTERNAL_SERVER_ERROR); }
        }
    } catch (error: any) {
        console.log(error.message);
        return res.json({ message: "Error removing tool from library", success: false }).status(StatusCodes.OK);
    }
})

router.delete("/remove", authenticateToken, async (req: Request<{}, resBody, User>, res: Response<resBody>) => {
    try {
        const { _id } = req.body;
        if (req.user && "id" in req.user) {
            const id = req.user.id as Types.ObjectId;
            const response = await removeFromLibrary(id, _id);
            if (response.success) {
                return res.json(response).status(StatusCodes.OK);
            } else {
                return res.json(response).status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        }
    } catch (error: any) {
        console.log(error.message);
        return res.json({
            message: "Error adding to library",
            success: false,
        }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }

})
export default router;