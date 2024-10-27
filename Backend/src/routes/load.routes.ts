import https from "https";
import { Router, Response, Request } from "express";
const router = Router();
import sharp from "sharp";
import { StatusCodes } from "http-status-codes";

const notDownloadImage = (url: string) => {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                let data: any = [];

                res.on("data", (chunk) => {
                    data.push(chunk);
                });

                res.on("end", async () => {
                    const buffer = Buffer.concat(data);
                    try {
                        resolve(buffer);
                    } catch (error) {
                        console.error("Error processing image with sharp:", error);
                        reject(error);
                    }
                });

                res.on("error", (err) => {
                    console.error("Error downloading image:", err);
                    reject(err);
                });
            })
            .on("error", (err) => {
                console.error("Error making HTTP request:", err);
                reject(err);
            });
    });
}

router.get("/:img", async (req: Request, res: Response) => {
    const img = req.params.img;

    try {
        const imageUrl = process.env.AWS_BUCKET_URL + img;
        let buffer = await notDownloadImage(imageUrl);
        res.status(StatusCodes.OK).send(buffer);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error processing image");
    }
});

export default router;
