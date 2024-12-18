import { LikeDislike, View } from "../models/analytics";
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

const viewSchema: Schema<View> = new Schema({
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
    viewedAt: {
        type: Date,
        required: true
    }
},{
    timestamps: true,
})

viewSchema.index({ toolId: 1, userId: 1 }, { unique: true });
export const LikeDislikes = model('likeDislikes', likeDislikeSchema);
export const Views = model('views', viewSchema);
