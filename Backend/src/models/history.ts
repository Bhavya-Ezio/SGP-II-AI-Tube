import { Types } from "mongoose"

export type History = {
    toolId: Types.ObjectId,
    userId: Types.ObjectId,
    viewedAt: Date
}

