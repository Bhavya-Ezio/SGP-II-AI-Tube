import { Types } from "mongoose";

export type Comments = {
    "_id": Types.ObjectId,
    "text": String,
    "timestamp": Date,
    "likes": Number,
}
export type Tools = {
    "_id": Types.ObjectId,
    "uploaderID": Types.ObjectId,
    "name": String,
    "likes": Number,
    "dislike": Number,
    "shares": Number,
    "comments": Array<Comments>,
    "views": Number,
    "description": String,
    "image": Array<String>,
    "videos": Array<String>,
    "price": Number,
    "files": Array<String>
}