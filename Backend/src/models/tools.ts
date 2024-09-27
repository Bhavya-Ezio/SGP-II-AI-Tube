import { Types } from "mongoose";

export type Comments = {
    "_id": Types.ObjectId,
    "userId": Types.ObjectId,
    "text": String,
    "timestamp": Date,
    "likes": Number,
}

export type Tools = {
    "_id": Types.ObjectId,
    "uploaderID": Types.ObjectId,
    "name": String,
    "category": String, // Added category field
    "likes": Number,
    "dislikes": Number,
    "shares": Number,
    "comments": Array<Comments>,
    "views": Number,
    "description": String,
    "image": Array<String>,
    "videos": Array<String>,
    "price": Number,
    "files": Array<String>
}

export type toolAnalytics = {
    "tool": Types.ObjectId,
    "downloads": Number,
    "downloadHistory": Array<downloadHistory>,
}

export type downloadHistory = {
    "month": String,
    "downlaod": Number
}