'use server'

import { connectToDatabase } from "../database/mongoose"
import Flight from "../database/models/flight.model"
import { handleError } from "../utils"


export async function allLoadedUlds (currentFlightId:string) {

    try {
        
        await connectToDatabase()

        const flight = await Flight.findOne({_id:currentFlightId})

        if (!flight) throw new Error("Flight not found")

            console.log("flight = ", flight)
        return {
            fwd_hold: flight.fwd_hold_uld,
            aft_hold: flight.aft_hold_uld,
            blk_hold: flight.blk_hold_uld,
        }
    } catch (error) {
        handleError(error)
    }
}