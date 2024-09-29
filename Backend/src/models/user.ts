import { Types } from "mongoose";
export type User = {
    "_id": Types.ObjectId,
    "name": string,
    "email": string,
    "username": string,
    "password": string,
    "DOB": Date,
    "gender": String,
    "SubTo": Array<Types.ObjectId>,
    "subscribers": number,
    "Description": string,
    "About": Array<string>,
    "ProfilePic": string,
    "verified": boolean,
    "views": number,  
    "noOfTools": number,
    "googleID": string,
    "shares": number
}