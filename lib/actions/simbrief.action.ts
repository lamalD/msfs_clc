'use server'

import { revalidatePath } from "next/cache"

import { connectToDatabase } from "../database/mongoose"
import { handleError } from "../utils"
import { getUserCurrentFlight, getUserCurrentFlightId, updateUserWithFlightData } from "./user.actions"
import { aircraft } from "@/constants/aircraftindex"
import { calcWnB } from "./weightnbalance.actions"

import Flight from "../database/models/flight.model"


export async function LoadSimbriefData({usernameSimbrief}:{usernameSimbrief:string}) {
    
    console.log("usernameSimbrief: ", usernameSimbrief)
    
    try {
        const getSimbriefData = async () => {
            const res = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?username=${usernameSimbrief}&json=1`)

            return res.json()
        }

        const data = await getSimbriefData()

        if (data) {

            if (data.aircraft.iata_code === "77W") {

                const flightState = await checkFlight({flightData:data, usernameSimbrief:usernameSimbrief})
    
                if (flightState!.status === "update flight") {
    
                    console.log("Updating flight ... with db_id: ", flightState!.id)
    
                    await updateFlight({flightData:data, usernameSimbrief:usernameSimbrief, _id:flightState!.id})
                }
    
                if (flightState!.status === "create new flight") {
    
                    await createFlight({flightData:data, usernameSimbrief:usernameSimbrief})
                }
            } else {
                console.log("Aircraft currently not supported")
                return("Aircraft currently not supported!")
            }

        } else {
            console.log("No data")
        }
    } catch (error) {
        handleError(error)
    }
}

export async function checkFlight({flightData, usernameSimbrief}:{flightData:any, usernameSimbrief:string}) {

    try {
        
        await connectToDatabase()

        const currentFlightId = await getUserCurrentFlightId(usernameSimbrief)
        // console.log("currentFlightId: ", currentFlightId)

        if (currentFlightId === "No currentFlightId found") {
            // console.log("No currentFlightId found, downloaded flight can be inserted in DB.")

            // INSERT FLIGHT IN DB
            await createFlight({flightData:flightData, usernameSimbrief:usernameSimbrief})

        } else {
            
            console.log("currentFligfhtId found, needs to be checked against latest download from Simbrief")
            
            // LOOK UP FLIGHT WITH DB OBJECT_ID
            const flight_db_id = await getUserCurrentFlight(currentFlightId)

            // console.log("db _id: ", flight_db_id._id)
            // EXTRACT SIMBRIEFID FROM FLIGHT
            // console.log("simbriefId loaded: ", flight_db_id.simbriefId, "simbriefId download: ", flightData.params.sequence_id)
            // COMPARE WITH SEQUENCE_ID OF DOWNLOADED FLIGHT

            // IF SIMBRIEFID = SEQUENCE_ID => UPDATE FLIGHT
            if (flight_db_id.simbriefId === flightData.params.sequence_id) {
                // console.log("SimbriefId and sequence_id match, updating flight")
                
                return({status: "update flight", id: flight_db_id._id as string})
            }
            // IF SIMBRIEFID != SEQUENCE_ID => CREATE NEW FLIGHT & UPDATE CURRENTFLIGHTID
            else {
                // console.log("SimbriefId and sequence_id do not match, creating new flight")
                
                return({status: "create new flight", id: ""})
            }
        }   
    } catch (error) {
        handleError(error)
    }
}

export async function createFlight({flightData, usernameSimbrief}:{flightData:any, usernameSimbrief:string}) {

    try {

        console.log("createFlight triggert")
        
        const newFlight = await Flight.create({
            simbriefId: flightData.params.sequence_id,
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
            doi: aircraft.find((type) => type.acft === flightData.aircraft.iata_code)?.doi,
            zfw: flightData.weights.est_zfw,
            zfwi: "0",
            tow: flightData.weights.est_tow,
            towi: "0",
            ldw: flightData.weights.est_ldw,
            pld: flightData.weights.payload,
            paxCount: flightData.weights.pax_count,
            pax_weight: flightData.weights.pax_weight,
            paxCount_F: "0",
            paxCount_C: "0",
            paxCount_Y: "0",
            bagCount: flightData.weights.bag_count,
            bag_weight: flightData.weights.bag_weight,
            cargo: flightData.weights.cargo,
            ramp_fuel: flightData.fuel.plan_ramp,
            to_fuel: flightData.fuel.plan_takeoff,
            trip_fuel: flightData.fuel.enroute_burn,
            units: flightData.params.units,
        }
    )

    console.log(JSON.parse(JSON.stringify(newFlight._id)))
    
    console.log("usernameSimbrief: ", usernameSimbrief)
    
    await updateUserWithFlightData(usernameSimbrief, newFlight._id)
    
    const updatedWnB = await calcWnB(newFlight._id)

    if (updatedWnB.status === "success") {

        await Flight.findOneAndUpdate(newFlight._id, {
            zfwi: updatedWnB.zfwIndex!,
            zfwmac: updatedWnB.zfwMac!,
            towi: updatedWnB.towIndex!,
            towmac: updatedWnB.towMac!,
            paxCount_F: updatedWnB.paxF!,
            paxCount_C: updatedWnB.paxC!,
            paxCount_Y: updatedWnB.paxY!,
        })
    }

    return JSON.parse(JSON.stringify(newFlight))

    } catch (error) {
        handleError(error)
    }
}

export async function updateFlight({flightData, usernameSimbrief, _id}:{flightData:any, usernameSimbrief:string, _id:string}) {

    try {

        const updatedFlight = await Flight.findOneAndUpdate({_id}, {
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
            doi: aircraft.find((type) => type.acft === flightData.aircraft.iata_code)?.doi,
            zfw: flightData.weights.est_zfw,
            // zfwi: "0",
            tow: flightData.weights.est_tow,
            // towi: "0",
            ldw: flightData.weights.est_ldw,
            pld: flightData.weights.payload,
            paxCount: flightData.weights.pax_count,
            pax_weight: flightData.weights.pax_weight,
            // paxCount_F: "0",
            // paxCount_C: "0",
            // paxCount_Y: "0",
            bagCount: flightData.weights.bag_count,
            bag_weight: flightData.weights.bag_weight,
            cargo: flightData.weights.cargo,
            ramp_fuel: flightData.fuel.plan_ramp,
            to_fuel: flightData.fuel.plan_takeoff,
            trip_fuel: flightData.fuel.enroute_burn,
            units: flightData.params.units,
        }, {new: true})

        // await calcWnB(_id)
        const updatedWnB = await calcWnB(_id)

        if (updatedWnB.status === "success") {

            await Flight.findOneAndUpdate({_id}, {
                zfwi: updatedWnB.zfwIndex!,
                zfwmac: updatedWnB.zfwMac!,
                towi: updatedWnB.towIndex!,
                towmac: updatedWnB.towMac!,
                paxCount_F: updatedWnB.paxF!,
                paxCount_C: updatedWnB.paxC!,
                paxCount_Y: updatedWnB.paxY!,
            })
        }
        
        return JSON.parse(JSON.stringify(updatedFlight))
        
    } catch (error) {
        handleError(error)
    }

}