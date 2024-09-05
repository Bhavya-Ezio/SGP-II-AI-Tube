import { Types } from "mongoose"

export type loginReturn = {
    message: string,
    success: boolean,
    data?: Types.ObjectId
}