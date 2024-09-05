import { Comments, Tools } from "../models/tools";
import { model, Schema, Types } from "mongoose";

const commentSchema = new Schema<Comments>({
    _id: Types.ObjectId,
    text: String,
    timestamp: Date,
    likes: Number,
});
const Comment = model('comments', commentSchema);

const toolsSchema = new Schema<Tools>({
    uploaderID: { type: Schema.Types.ObjectId, ref: 'users' },
    name: { type: String, required: true },
    likes: Number,
    dislike: Number,
    shares: Number,
    comments: [{ type: Schema.Types.ObjectId, ref: 'comments' }],
    views: Number,
    description: String,
    image: [String],
    videos: [String],
    price: Number,
    files: [String],
});

const Tool = model('Tool', toolsSchema);

export { Comment, Tool };