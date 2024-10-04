import { category } from "../models/categories";
import { Schema, model } from "mongoose";

const categorySchema = new Schema<category>({
    name: { type: String, required: true },
    description: { type: String, required: true },
});

const Category = model('categories', categorySchema);

export { Category };

