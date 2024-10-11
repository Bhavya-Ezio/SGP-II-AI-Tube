import { Types } from "mongoose";
import { User } from "../models/user.js";
import user from "../schemas/user.schema.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import userVerification from "../schemas/userVerification.schema.js";
import nm from "nodemailer";
import { resBody } from "../models/req&res.js";
import { Request, Response } from "express";
import { loginReturn } from "../models/returns.js";
import { StatusCodes } from "http-status-codes";

const transport = nm.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
})

const sendVerificationEmail = async (_id: Types.ObjectId, email: string): Promise<resBody> => {
    const currentURL = "http:localhost:4000/";
    const uniqueString = uuidv4() + _id;
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup and login into your account .< /p><p>This link <b>expires in 6 hours</b> .
        < /p><p>Press <a href=${currentURL + "verify/" + _id + "/" + uniqueString}>here</a> to proceed .< /p>`,
    };
    try {
        const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
        const newUserVerification = new userVerification({
            uid: _id,
            uString: hashedUniqueString,
            createdAt: Date.now(),
        });
        await newUserVerification.save();
        await transport.sendMail(mailOptions);
        return {
            message: "mail sent!!",
            success: true,
        };
    } catch (error) {
        return {
            message: "Error at sending the email.",
            success: false,
        }
    }
}

const createUser = async (body: User): Promise<resBody> => {
    const { name, email, username, password } = body;
    const hash = await bcrypt.hash(password, 10);
    const u = new user({
        name: name,
        email: email,
        username: username,
        password: hash,
    });
    const verificationRes = await sendVerificationEmail(u._id, u.email);
    if (verificationRes.success) {
        await u.save();
        return verificationRes;
    } else {
        return verificationRes;
    }
}

const addDetails = async (data: User): Promise<resBody> => {
    const { username, DOB, gender, Description, About } = data;
    const user1 = await user.findOne({ username: username });
    if (user1) {
        user1.DOB = DOB;
        user1.Description = Description;
        user1.About = About;
        user1.gender = gender;
        await user1.save();
        return {
            message:"Details added",
            success:true,
        };
    } else {
        return {
            message: "Username not found",
            success: false,
        }
    }

}

const loginUser = async (body: User): Promise<loginReturn> => {
    try {
        const { username, password } = body;
        const u = await user.findOne({ username: username });
        if (u) {
            if (bcrypt.compareSync(password, u.password)) {
                return {
                    message: "User Logged In",
                    success: true,
                    data: u._id,
                }
            } else {
                return {
                    message: "Invalid Credentials",
                    success: false
                }
            }
        } else {
            return {
                message: "User does not exists",
                success: false
            }
        }
    } catch (error) {
        console.log(error);
        return {
            message: "Internal server error",
            success: false
        }
    }
}

const getProfile = async (req: Request, res: Response<resBody>) => {
    if (!req.user || !("id" in req.user)) {
        return res.json({
            message: "Unauthorized",
            success: false
        }).status(StatusCodes.UNAUTHORIZED);
    }
    const details = await user.findById(req.user.id).select("name email username DOB gender Description About");

    return res.json({
        message: "data sent",
        success: true,
        data: details!,
    })
}

const addShare = async (req: Request, res: Response<resBody>) => {
    try {
        if (!req.user || !("id" in req.user)) {
            return res.json({
                message: "Unauthorized",
                success: false
            }).status(StatusCodes.UNAUTHORIZED);
        }
        const user1 = await user.findById(req.user.id);
        if (!user1) {
            return res.json({
                message: "User not found",
                success: false
            }).status(StatusCodes.NOT_FOUND);
        }
        user1.shares++;
        await user1.save();
        return res.json({
            message: "Share added",
            success: true
        }).status(StatusCodes.OK);
    } catch (error) {
        return res.json({
            message: "Internal server error",
            success: false
        }).status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const updateUser = async (body: User, id: Types.ObjectId): Promise<resBody> => {
    const { name, email, username, password, DOB, gender, Description, About } = body;
    try {
        const u = await user.findById(id);
        if (!u) {
            return {
                message: "User not found",
                success: false
            }
        }
        u.name = name;
        u.email = email;
        u.username = username;
        u.password = password;
        u.DOB = DOB;
        u.gender = gender;
        u.Description = Description;
        u.About = About;
        await u.save();
        return {
            message: "User updated",
            success: true
        }
    } catch (error) {
        return {
            message: "Internal server error",
            success: false
        }
    }
}

const addImg = async (id: Types.ObjectId, file: Express.Multer.File): Promise<resBody> => {
    try {
        const u = await user.findById(id);
        if (!u) {
            return {
                message: "User not found",
                success: false
            }
        }
        console.log(file);
        if (file && "key" in file) {
            u.ProfilePic = file.key as string;
        }
        await u.save();
        return {
            message: "Image added",
            success: true
        }
    } catch (error) {
        return {
            message: "Internal server error",
            success: false
        }
    }
}
export { getProfile, loginUser, createUser, addShare, updateUser, addImg,addDetails }