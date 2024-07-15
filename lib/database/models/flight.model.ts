import { Schema, model, models, Document } from "mongoose";

export interface FlightProps extends Document {
    usernameSimbrief: string
    origin: string
    destination: string
    departureDate: string
    departureTime: string
    aircraftType: string
    registration: string
    flightNumber: string
    blockFuel: number
    takeoffFuel: number
    tripfuel: number
    dow: number
    doi: number
    zfw: number
    zfwi: number
    tow: number
    towi: number
    ldw: number
    units: string
}

const FlightSchema = new Schema<FlightProps>({
    usernameSimbrief: {
        type: String,
        required: true,
    },
    origin: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    departureDate: {
        type: String,
        required: true,
    },
    departureTime: {
        type: String,
        required: true,
    },
    aircraftType: {
        type: String,
        required: true,
    },
    flightNumber: {
        type: String,
        required: true,
    },
    blockFuel: {
        type: Number
    },
    takeoffFuel: {
        type: Number
    },
    tripfuel: {
        type: Number
    },
    dow: {
        type: Number
    },
    doi: {
        type: Number
    },
    zfw: {
        type: Number
    },
    zfwi: {
        type: Number
    },
    tow: {
        type: Number
    },
    towi: {
        type: Number
    },
    ldw: {
        type: Number
    },
    units: {
        type: String,
        required: true,
    },

})

const Flight = models?.Flight || model("Flight", FlightSchema);

export default Flight;