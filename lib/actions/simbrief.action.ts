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
    
    const getSimbriefData = async () => {
        const res = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?username=${usernameSimbrief}&json=1`)

        return res.json()
    }
    try {

        const data = await getSimbriefData()

        if (!data) {
            throw new Error("No data retrieved from Simbrief"); // Handle missing data explicitly
        }

        if (data) {

            if (data.aircraft.iata_code === "77W") {

                const flightState = await checkFlight({flightData:data, usernameSimbrief:usernameSimbrief})
    
                if (flightState!.status === "update flight") {
    
                    console.log("Updating flight ... with db_id: ", flightState!.id)
    
                    const updatedFlight = await updateFlight({flightData:data, usernameSimbrief:usernameSimbrief, _id:flightState!.id})

                    const plainData = {
                        _id: updatedFlight._id,
                        simbriefId: updatedFlight.simbriefId,
                        usernameSimbrief: updatedFlight.usernameSimbrief,
                        origin: updatedFlight.origin,
                        destination: updatedFlight.destination,
                        departureDate: updatedFlight.departureDate,
                        departureTime: updatedFlight.departureTime,
                        aircraftType: updatedFlight.aircraftType,
                        flightNumber: updatedFlight.flightNumber,
                        blockFuel: updatedFlight.blockFuel,
                        takeoffFuel: updatedFlight.takeoffFuel,
                        tripfuel: updatedFlight.tripfuel,
                        dow: updatedFlight.dow,
                        doi: updatedFlight.doi,
                        zfw: updatedFlight.zfw,
                        zfwi: updatedFlight.zfwi,
                        tow: updatedFlight.tow,
                        towi: updatedFlight.tow,
                        ldw: updatedFlight.ldw,
                        pld: updatedFlight.pld,
                        paxCount: updatedFlight.paxCount,
                        pax_weight: updatedFlight.pax_weight,
                        paxCount_F: updatedFlight.paxCount_F,
                        paxCount_C: updatedFlight.paxCount_C,
                        paxCount_Y: updatedFlight.paxCount_Y,
                        bagCount: updatedFlight.bagCount,
                        bag_weight: updatedFlight.bag_weight,
                        cargo: updatedFlight.cargo,
                        ramp_fuel: updatedFlight.ramp_fuel,
                        to_fuel: updatedFlight.to_fuel,
                        trip_fuel: updatedFlight.trip_fuel,
                        units: updatedFlight.units,
                        __v: updatedFlight._v,
                        aft_hold_uld: updatedFlight.aft_hold_uld,
                        blk_hold_uld: updatedFlight.blk_hold_uld,
                        fwd_hold_uld: updatedFlight.fwd_hold_uld,
                        towmac: updatedFlight.towmac,
                        zfwmac: updatedFlight.zfwmac,
                        aft_hold: updatedFlight.aft_hold,
                        blk_hold: updatedFlight.blk_hold,
                        fwd_hold: updatedFlight.fwd_hold,
                      }

                    return plainData
                }
    
                if (flightState!.status === "create new flight") {
    
                    const newFlight = await createFlight({flightData:data, usernameSimbrief:usernameSimbrief})

                    const plainData = {
                        _id: newFlight._id,
                        simbriefId: newFlight.simbriefId,
                        usernameSimbrief: newFlight.usernameSimbrief,
                        origin: newFlight.origin,
                        destination: newFlight.destination,
                        departureDate: newFlight.departureDate,
                        departureTime: newFlight.departureTime,
                        aircraftType: newFlight.aircraftType,
                        flightNumber: newFlight.flightNumber,
                        blockFuel: newFlight.blockFuel,
                        takeoffFuel: newFlight.takeoffFuel,
                        tripfuel: newFlight.tripfuel,
                        dow: newFlight.dow,
                        doi: newFlight.doi,
                        zfw: newFlight.zfw,
                        zfwi: newFlight.zfwi,
                        tow: newFlight.tow,
                        towi: newFlight.tow,
                        ldw: newFlight.ldw,
                        pld: newFlight.pld,
                        paxCount: newFlight.paxCount,
                        pax_weight: newFlight.pax_weight,
                        paxCount_F: newFlight.paxCount_F,
                        paxCount_C: newFlight.paxCount_C,
                        paxCount_Y: newFlight.paxCount_Y,
                        bagCount: newFlight.bagCount,
                        bag_weight: newFlight.bag_weight,
                        cargo: newFlight.cargo,
                        ramp_fuel: newFlight.ramp_fuel,
                        to_fuel: newFlight.to_fuel,
                        trip_fuel: newFlight.trip_fuel,
                        units: newFlight.units,
                        __v: newFlight._v,
                        aft_hold_uld: newFlight.aft_hold_uld,
                        blk_hold_uld: newFlight.blk_hold_uld,
                        fwd_hold_uld: newFlight.fwd_hold_uld,
                        towmac: newFlight.towmac,
                        zfwmac: newFlight.zfwmac,
                        aft_hold: newFlight.aft_hold,
                        blk_hold: newFlight.blk_hold,
                        fwd_hold: newFlight.fwd_hold,
                      }

                    return plainData
                }
            } else {
                console.log("Aircraft currently not supported")
                throw new Error("Aircraft currently not supported!")
            }

        } else {
            console.log("No data")
        }
    } catch (error) {
        console.error("Error fetching Simbrief data:", error);
        handleError(error)
    }
}

export async function checkFlight({flightData, usernameSimbrief}:{flightData:any, usernameSimbrief:string}) {

    try {
        
        await connectToDatabase()

        const currentFlightId = await getUserCurrentFlightId(usernameSimbrief)
        console.log("currentFlightId: ", currentFlightId)

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
        console.error("Error checking flight:", error);
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
            departureDate: new Date(flightData.times.sched_out * 1000).toISOString(),
            departureTime: new Date(flightData.times.sched_out * 1000).toISOString(),
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
                fwd_hold_uld: updatedWnB.fwd_hold_uld,
                aft_hold_uld: updatedWnB.aft_hold_uld,
                blk_hold_uld: updatedWnB.blk_hold_uld,
            },
            {new: true},
        )
    }
    console.log("newFlight: ", newFlight)
    return newFlight

    } catch (error) {
        handleError(error)
    }
}

export async function updateFlight({flightData, usernameSimbrief, _id}:{flightData:any, usernameSimbrief:string, _id:string}) {

    try {

        const updatedFlight = await Flight.findOneAndUpdate({_id}, {
            origin: flightData.origin.iata_code,
            destination: flightData.destination.iata_code,
            departureDate: new Date(flightData.times.sched_out * 1000).toISOString(),
            departureTime: new Date(flightData.times.sched_out * 1000).toISOString(),
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
                    fwd_hold: updatedWnB.fwdHld!,
                    aft_hold: updatedWnB.aftHld!,
                    blk_hold: updatedWnB.blkHld!,
                    fwd_hold_uld: updatedWnB.fwd_hold_uld,
                    aft_hold_uld: updatedWnB.aft_hold_uld,
                    blk_hold_uld: updatedWnB.blk_hold_uld,
                },
                {new: true},
            )
        }
        console.log("updatedFlight: ", updatedFlight)
        return updatedFlight

        
    } catch (error) {
        console.error("Error updating flight:", error);
        handleError(error)
    }
}