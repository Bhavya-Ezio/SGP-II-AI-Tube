import { Comments } from "../models/tools";
import { model, Schema, Types } from "mongoose";

const commentsSchema: Schema<Comments> = new Schema({
    "text": {
        type: String,
        required: true
    },
    "userId":{
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    "timestamp": {
        type: Date,
        required: true
    },
    "likes": {
        type: Number,
        default: 0,
    },
})

export default model("comments", commentsSchema);