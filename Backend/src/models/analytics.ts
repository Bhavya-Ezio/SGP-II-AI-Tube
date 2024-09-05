import { Types } from "mongoose"

export type toolAnalytics = {
    "tool": Types.ObjectId,
    "downloads": Number,
    "downloadHistory": Array<downloadHistory>,
}

export type downloadHistory = {
    "month": String,
    "downlaod": Number
}