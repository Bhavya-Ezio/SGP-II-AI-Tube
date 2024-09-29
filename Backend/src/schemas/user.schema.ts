import { User } from "../models/user.js";
import { model, Schema, Types } from "mongoose";

const userSchema: Schema<User> = new Schema({
    "name": {
        type: String,
        default: "",
    },
    "email": {
        type: String,
        unique: true,
    },
    "username": {
        type: String,
        unique: true,
        minlength: 3,
        maxlength: 20,
    },
    "password": {
        type: String,
    },
    "DOB": {
        type: Date,
    },
    "gender": {
        type: String,
        enum: ["male", "female"]
    },
    "SubTo": {
        type: [Types.ObjectId],
        default: [],
    },
    "subscribers": {
        type: Number,
        default: 0,
    },
    "Description": {
        type: String,
    },
    "About": {
        type: [String],
    },
    "ProfilePic": {
        type: String,
    },
    "verified": {
        type: Boolean,
        default: false,
    },
    "views": {
        type: Number,
        default: 0,
    },
    "noOfTools": {
        type: Number,
        default: 0,
    },
    "googleID": {
        type: String,
    }
})

export default model("users", userSchema);