'use server'

import { connectToDatabase } from "../database/mongoose"
import { handleError } from "../utils"

import { cargoDistributionData } from "@/constants/loaddistribution"
import { paxData_PMDG77W } from "@/constants/paxdistribution"
import { aircraft } from "@/constants/aircraftindex"

import Flight from "../database/models/flight.model"
import { fuelIndex_77W } from "@/constants/fuelindex"
import { loadDistribution } from "./loaddistribution.actions"
import { calculateAllowedTrafficLoad, calculateOperatingWeight, calculateUnderload } from "./loadsheet.actions"

export async function calcWnB(id: string) {
    try {
        
        await connectToDatabase()

        const flight = await Flight.findOne({_id: id})

        console.log("flight for calc: ", flight)

        if (!flight) throw new Error("No Flight Found!")
        
        // LOAD & PAXDISTRIBUTION

        //---Look for % of MAX PAYLOAD
        var mpld: string

        switch (flight.units) {
            case "kgs":
                
                mpld = aircraft.find((type) => type.acft === flight.aircraftType)?.mpld_kgs!
                console.log("mpld set to ", mpld, "kgs")
                break;

            case "lbs":

                mpld = aircraft.find((type) => type.acft === flight.aircraftType)?.mpld_lbs!
                console.log("mpld set to ", mpld, "lbs")
                break;
        
            default:
                mpld = "0"
                break;
        }

        console.log(flight.pld)
        var pldPct = ((flight.pld / parseInt(mpld, 10))*100).toFixed()+"%"
        // var pldPct = ((flight.pld / parseInt(mpld, 10))*100).toFixed(2)

        console.log("pldPct = ", pldPct.toString(), "%")
        console.log("pldPct = ", pldPct, "%")

        var ttlWeightAboveWing = flight.pld / 2
        var ttlWeightBelowWing = flight.pld - ttlWeightAboveWing

        console.log("Above Wing: ", ttlWeightAboveWing, " / Below Wing: ", ttlWeightBelowWing)

        //---Look for PAX DISTRIBUTION BASED ON %
        if (flight.aircraftType === "77W") {

            var ttlPax_F = paxData_PMDG77W.find((type) => type.paxLevel === pldPct)?.first
            var ttlPax_C = paxData_PMDG77W.find((type) => type.paxLevel === pldPct)?.business
            var ttlPax_Y = paxData_PMDG77W.find((type) => type.paxLevel === pldPct)?.economy
            var ttlPax = paxData_PMDG77W.find((type) => type.paxLevel === pldPct)?.ttlPax

            console.log("F: ", ttlPax_F, " C: ", ttlPax_C, " Y: ", ttlPax_Y, " Ttl Pax: ", ttlPax)
        }

        //---LOAD DISTRIBUTION
        var fwdHldPct = cargoDistributionData.find((type) => type.acft === flight.aircraftType)?.fwdHldPercentage
        var aftHldPct = cargoDistributionData.find((type) => type.acft === flight.aircraftType)?.aftHoldPercentage
        var blkHldPct = cargoDistributionData.find((type) => type.acft === flight.aircraftType)?.blkHldPercentage
        
        console.log(fwdHldPct, aftHldPct, blkHldPct)

        var fwdHld = ((ttlWeightBelowWing * parseFloat(fwdHldPct!)) / 100).toFixed()
        var aftHld = ((ttlWeightBelowWing * parseFloat(aftHldPct!)) / 100).toFixed()
        var blkHld = ((ttlWeightBelowWing * parseFloat(blkHldPct!)) / 100).toFixed()

        console.log("fwd hold: ", fwdHld, " ", flight.units)
        console.log("aft hold: ", aftHld, " ", flight.units)
        console.log("blk hold: ", blkHld, " ", flight.units)
        
        const zfwDetails = await calculateZFWindex(flight, ttlPax_F!, ttlPax_C!, ttlPax_Y!, fwdHld!, aftHld!, blkHld!)

        const towDetails = await calculateTOWindex(flight, zfwDetails.index)

        console.log("ZFWi: ", zfwDetails!.index, "MAC ZFW: ", zfwDetails!.mac)
        console.log("TOWi: ", towDetails!.index, "MAC TOW: ", towDetails!.mac)
        
        const loadData = await loadDistribution(id)

        const operatingWeight = await calculateOperatingWeight(flight.dow, flight.takeoffFuel)
        console.log("Operating Weight = ", operatingWeight)

        const allowedTrafficLoad = await calculateAllowedTrafficLoad(flight.takeoffFuel, flight.tripfuel, operatingWeight, flight.aircraftType, flight.units)
        console.log("Allowed Traffic Load = ", allowedTrafficLoad.allowedTrafficLoad)
        console.log("Limitation: ", allowedTrafficLoad.limitingWeight)

        const underload = await calculateUnderload(allowedTrafficLoad.allowedTrafficLoad, flight.pld)
        console.log("underload: ", underload)

        return{
            status:"success",
            paxF: ttlPax_F,
            paxC: ttlPax_C,
            paxY: ttlPax_Y,
            paxTtl: ttlPax,
            fwdHld: fwdHld,
            aftHld: aftHld,
            blkHld: blkHld,
            zfwIndex: zfwDetails!.index,
            zfwMac: zfwDetails!.mac,
            towIndex: towDetails!.index,
            towMac: towDetails!.mac,
            fwd_hold_uld: loadData.fwdHldUlds.toString(),
            aft_hold_uld: loadData.aftHldUlds.toString(),
            blk_hold_uld: loadData.blkHldUlds.toString(),
            limitation: allowedTrafficLoad.limitingWeight,
            underload: underload.toString(),
        }

    } catch (error) {
        handleError(error)
        return({status:"error"})
    }
}

export async function calculateZFWindex(flightData:any, f:string, c:string, y:string, fwd:string, aft:string, blk:string){

    //INDEX FOR F-CLASS
    var paxFweight = parseInt(f)*parseFloat(flightData.pax_weight)
    var indexF = (paxFweight*(250.56-1258))/300000

    console.log(indexF)

    //INDEX FOR C-CLASS
    var paxCweight = parseInt(c)*parseFloat(flightData.pax_weight)
    var indexC = (paxCweight*(635.52-1258))/300000

    console.log(indexC)

    //INDEX FOR Y-CLASS
    var paxYweight = parseInt(y)*parseFloat(flightData.pax_weight)
    var indexY = (paxYweight*(1523.64-1258))/300000

    console.log(indexY)

    //INDEX FOR FWD HLD
    var indexFwdHld = (parseInt(fwd)*(598.5-1258))/300000

    console.log(indexFwdHld)

    //INDEX FOR AFT HLD
    var indexAftHld = (parseInt(aft)*(1756-1258))/300000

    console.log(indexAftHld)

    //INDEX FOR BLK HLD
    var indexBlkHld = (parseInt(blk)*(2144.75-1258))/300000

    console.log(indexBlkHld)

    //CALCULATE ZFW INDEX
    var doi = parseFloat(flightData.doi)
    
    var zfwIndex = doi + indexF + indexC + indexY + indexFwdHld + indexAftHld + indexBlkHld

    console.log(zfwIndex.toFixed(2))

    // CALCULATE MAC ZFW
    var macZFW = ((300000*(zfwIndex-50)/parseInt(flightData.zfw))+(1258-1174.5))/(278.5/100)

    console.log(macZFW.toFixed(1))

    return({index: zfwIndex.toFixed(2), mac: macZFW.toFixed(1)})
}

export async function calculateTOWindex(flightData:any, zfwIndex:string) {

    if (flightData.aircraftType === "77W") {

        // INDEX FOR TAKE-OFF FUEL
        var tof = Math.round(flightData.to_fuel/1000)*1000
    
        console.log("tof: ", tof)
    
        var tofIndex = fuelIndex_77W.find((type) => type.fuelQuantity === tof)?.index
    
        console.log(tofIndex)
    
        var towIndex = parseFloat(zfwIndex) + tofIndex!
    
        console.log(towIndex)
    
        // CALCULATE MAC TOW
        var macTOW = ((300000*(towIndex-50)/parseInt(flightData.tow))+(1258-1174.5))/(278.5/100)
    
        console.log(macTOW.toFixed(1))

        return({index: towIndex.toFixed(2), mac: macTOW.toFixed(1)})
    }
}