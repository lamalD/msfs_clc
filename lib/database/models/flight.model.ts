import { Schema, model, models, Document } from "mongoose";

export interface FlightProps extends Document {
    simbriefId: string
    usernameSimbrief: string
    origin: string
    destination: string
    departureDate: string
    departureTime: string
    aircraftType: string
    registration: string
    flightNumber: string
    blockFuel: string
    takeoffFuel: string
    tripfuel: string
    dow: string
    doi: string
    zfw: string
    zfwi: string
    zfwmac: string
    tow: string
    towi: string
    towmac: string
    ldw: string
    pld: string
    paxCount: string
    pax_weight: string
    paxCount_F: string
    paxCount_C: string
    paxCount_Y: string
    bagCount: string
    bag_weight: string
    cargo: string
    fwd_hold: string
    fwd_hold_uld: string
    aft_hold: string
    aft_hold_uld: string
    blk_hold: string
    blk_hold_uld: string
    ramp_fuel: string
    to_fuel: string
    trip_fuel: string
    units: string
}

const FlightSchema = new Schema<FlightProps>({
    simbriefId: {
        type: String,
        required: true,
    },
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
        type: String
    },
    takeoffFuel: {
        type: String
    },
    tripfuel: {
        type: String
    },
    dow: {
        type: String
    },
    doi: {
        type: String
    },
    zfw: {
        type: String
    },
    zfwi: {
        type: String
    },
    zfwmac: {
        type: String
    },
    tow: {
        type: String
    },
    towi: {
        type: String
    },
    towmac: {
        type: String
    },
    ldw: {
        type: String
    },
    pld: {
        type: String
    },
    paxCount: {
        type: String
    },
    pax_weight: {
        type: String
    },
    paxCount_F: {
        type: String
    },
    paxCount_C: {
        type: String
    },
    paxCount_Y: {
        type: String
    },
    bagCount: {
        type: String
    },
    bag_weight: {
        type: String
    },
    cargo: {
        type: String
    },
    fwd_hold: {
        type: String
    },
    fwd_hold_uld: {
        type: String
    },
    aft_hold: {
        type: String
    },
    aft_hold_uld: {
        type: String
    },
    blk_hold: {
        type: String
    },
    blk_hold_uld: {
        type: String
    },
    ramp_fuel: {
        type: String
    },
    to_fuel: {
        type: String
    },
    trip_fuel: {
        type: String
    },
    units: {
        type: String,
        required: true,
    },

})

const Flight = models?.Flight || model("Flight", FlightSchema);

export default Flight;