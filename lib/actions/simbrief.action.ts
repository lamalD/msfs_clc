'use server'

import { revalidatePath } from "next/cache"

import Flight from "../database/models/flight.model"
import { connectToDatabase } from "../database/mongoose"
import { handleError } from "../utils"
import { getUserCurrentFlightId, updateUserWithFlightData } from "./user.actions"

export async function LoadSimbriefData({usernameSimbrief}:{usernameSimbrief:string}) {
    
    console.log("usernameSimbrief: ", usernameSimbrief)
    
    try {
        const getSimbriefData = async () => {
            const res = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?username=${usernameSimbrief}&json=1`)

            return res.json()
        }

        const data = await getSimbriefData()

        if (data) {

            createFlight({flightData:data, usernameSimbrief:usernameSimbrief})

        } else {
            console.log("No data")
        }
    } catch (error) {
        handleError(error)
    }
}

export async function createFlight({flightData, usernameSimbrief}:{flightData:any, usernameSimbrief:string}) {

    try {
        
        await connectToDatabase()

        const currentFlightId = await getUserCurrentFlightId(usernameSimbrief)
        console.log("currentFlightId: ", currentFlightId)

        if (currentFlightId === "No currentFlightId found") {

            console.log("No currentFlightId found, downloaded flight can be inserted in DB.")

        } else {
            
            console.log("currentFligfhtId found, needs to be checked against latest download from Simbrief")
            
            
        }

        

        const newFlight = await Flight.create({
            usernameSimbrief: usernameSimbrief,
            origin: flightData.origin.iata_code,
            destination: flightData.destination.iata_code,
            departureDate: new Date(flightData.times.sched_out * 1000),
            departureTime: new Date(flightData.times.sched_out * 1000),
            aircraftType: flightData.aircraft.iata_code,
            registration: flightData.aircraft.reg,
            flightNumber: flightData.general.icao_airline+flightData.general.flight_number,
            blockFuel: flightData.fuel.plan_ramp,
            takeoffFuel: flightData.fuel.plan_takeoff,
            tripfuel: flightData.fuel.enroute_burn,
            dow: flightData.weights.oew,
            doi: 0,
            zfw: flightData.weights.est_zfw,
            zfwi: 0,
            tow: flightData.weights.est_tow,
            towi: 0,
            ldw: flightData.weights.est_ldw,
            units: flightData.params.units,
        })

        
        console.log(JSON.parse(JSON.stringify(newFlight._id)))

        console.log("usernameSimbrief: ", usernameSimbrief)

        await updateUserWithFlightData(usernameSimbrief, newFlight._id)

        return JSON.parse(JSON.stringify(newFlight))


    } catch (error) {
        handleError(error)
    }
}