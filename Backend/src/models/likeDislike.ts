import { Types } from "mongoose"

export type LikeDislike = {
    toolId: Types.ObjectId,
    userId: Types.ObjectId,
    like: boolean
}