import { Comments, Tools, toolAnalytics, downloadHistory } from "../models/tools";
import { model, Schema, Types } from "mongoose";
import { Category } from "./categories";

const commentSchema = new Schema<Comments>({
    text: String,
    timestamp: Date,
    likes: Number,
});
const Comment = model('comments', commentSchema);

const toolsSchema = new Schema<Tools>({
    uploaderID: { type: Schema.Types.ObjectId, ref: 'users' },
    name: { type: String, required: true },
    category: { type: [Schema.Types.ObjectId], ref: 'categories',/*  required: true  */},
    likes: Number,
    dislikes: Number,
    shares: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'comments' }],
    views: Number,
    description: String,
    image: [String],
    videos: [String],
    price: Number,
    files: [String],
});

const Tool = model('tools', toolsSchema);

const downloadHistorySchema = new Schema<downloadHistory>({
    month: String,
    downlaod: Number,
});

const toolAnalyticsSchema = new Schema<toolAnalytics>({
    tool: { type: Schema.Types.ObjectId, ref: 'tools' },
    downloads: Number,
    downloadHistory: [downloadHistorySchema],
});

const ToolAnalytics = model('ToolAnalytics', toolAnalyticsSchema);

export { Comment, Tool, ToolAnalytics };