import { Schema, model, models, Document } from "mongoose";

export interface UserProps extends Document {
    clerkId: string
    email: string
    userName: string
    photo: string
    firstName?:  string
    lastName?: string
    planId?: string
}

const UserSchema = new Schema<UserProps>({
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
        type: String,
        required: true,
        unique: true,
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

const User = models?.User || model("User", UserSchema);

export default User;