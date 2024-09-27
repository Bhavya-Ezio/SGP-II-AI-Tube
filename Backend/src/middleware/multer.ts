import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { Tools } from '../models/tools';
import { Request, Response } from "express";
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME!,
        metadata: (req: Request<Tools>, file: Express.Multer.File, cb: (error: any, info: any) => void) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req: Request, file: Express.Multer.File, cb: (error: any, key: string) => void) => {
            cb(null, ("id" in req.user! ? req.user.id : "") + '-' + file.originalname);
        },
    }),
});

export { upload };