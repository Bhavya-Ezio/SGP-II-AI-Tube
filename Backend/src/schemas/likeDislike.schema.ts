import { LikeDislike } from "../models/likeDislike";
import { model, Schema, Types } from "mongoose";

const likeDislikeSchema: Schema<LikeDislike> = new Schema({
    toolId: {
        type: Schema.Types.ObjectId,
        ref: 'tools',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    like: {
        type: Boolean,
        required: true
    }
})

export default model('likeDislikes', likeDislikeSchema);
