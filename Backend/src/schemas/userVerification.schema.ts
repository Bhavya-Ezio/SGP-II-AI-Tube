import mongoose from "mongoose"

const UserVerificationSchema = new mongoose.Schema(
    {
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        uString: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now,
            index: { expireAfterSeconds: 21600000 }
        },
    }
)

export default mongoose.model("user-verifications", UserVerificationSchema)