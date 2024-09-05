import { Router, json, Request, Response } from "express";
const router = Router();
router.use(json());
import user from "../schemas/user.schema.js";
import userVerification from "../schemas/userVerification.schema.js";
import bcrypt from "bcrypt";

router.get("/:id/:uid", async (req: Request, res: Response) => {
    const id = req.params.id;
    const uid = req.params.uid;
    let message: String;
    try {
        const u = await user.findById(id);
        if (u) {
            const x = await userVerification.findOne({ uid: id });
            if (x && await bcrypt.compare(uid, x.uString)) {
                message = 'The email has been verified';
                await userVerification.deleteOne({ _id: x.id });
                await user.updateOne({ _id: id }, { $set: { verified: true } });
                return res.redirect(`/verify/verified?message=${message}`);
            }
            else {
                message = 'The link is invalid.It has been altered use the link in the email'
                return res.redirect(`/verify/verified?error=true&&message=${message}`)
            }
        }
        else {
            message = "The email is already verifed or please sign up again"
            return res.redirect(`/verify/verified?error=true&&message=${message}`)
        }
    } catch (error: any) {
        console.log(error);
        return res.redirect(`/verify/verified?error=true&&message=${error?.message}`)
    }
})

router.get('/verified', (req, res) => {
    let x = `D:/study/SEM5/SGP - II/Backend/verified.html`;
    return res.sendFile(x)
})

export default router;