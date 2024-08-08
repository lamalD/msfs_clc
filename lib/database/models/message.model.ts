import { Schema, model, models, Document } from "mongoose"

export interface MessageProps extends Document {
    usernameSimbrief: string,
    flightId: string,
    messageType: string,
    messageBody: string,
}

const MessageSchema = new Schema<MessageProps>({
    usernameSimbrief: {
        type: String,
        required: true,
    },
    flightId: {
        type: String,
        required: true,
    },
    messageType: {
        type: String,
        required: true,
    },
    messageBody: {
        type: String,
        required: true,
    }
})

const Message = models?.Messages || model("Flight", MessageSchema);

export default Message;