import mongoose, { Schema, type InferSchemaType, model } from "mongoose"

const interviewSchema = new Schema(
    {
        researchId: { type: mongoose.Types.ObjectId, ref: "Research", required: true },
        name: { type: String },
        schedule: { type: Date },
        advice: { type: String },
        follow_up: { type: String },
        result: { type: String },
        status: { type: Number }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export type Interview = InferSchemaType<typeof interviewSchema>
export const Interview = model("Interview", interviewSchema)