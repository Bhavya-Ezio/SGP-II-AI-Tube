import { History } from "../models/history";
import { model, Schema, Types } from "mongoose";

const historySchema: Schema<History> = new Schema({
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
}, {
    timestamps: true
});

historySchema.index({ toolId: 1, userId: 1 }, { unique: true });

const History = model('historys', historySchema);

export { History };