import { Schema, model, models, Document } from "mongoose";

export interface FlightProps extends Document {
    clerkId: string
    email: string
    userName: Schema.Types.ObjectId
    photo: string
    firstName?:  string
    lastName?: string
    planId?: string
    userId: string
}

const FlightSchema = new Schema<FlightProps>({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    photo: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    planId: {
        type: Number,
        default: 0,
    },
})

const Flight = models?.Flight || model("Flight", FlightSchema);

export default Flight;