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

export async function calculatePiecesAndWeights(allUlds: any, uldArray: any) {
    console.log("triggert", allUlds, uldArray);
  
    const totalPaxCount = parseInt(allUlds.paxCount_F) + parseInt(allUlds.paxCount_C) + parseInt(allUlds.paxCount_Y)
    const totalPaxWeight = parseFloat(allUlds.pld)/2
    let totalBagWeight = 0
    let totalBagPcs = 0
    let totalCargoWeight = 0
    let totalMailWeight = 0
  
    for (let index = 0; index < uldArray.length; index++) {
      const element = uldArray[index]
  
      if (typeof element !== 'object' || element === null) {
        console.error('Invalid element in uldArray:', element);
        continue;
      }
  
      if (!('category' in element) || !('weight' in element)) {
        console.error('Missing properties in element:', element);
        continue;
      }
  
      const weight = parseInt(element.weight)
      const pieces = element.pieces ? parseInt(element.pieces) : 0
  
      switch (element.category) {
        case "BF":
        case "BC":
        case "BY":
          totalBagWeight += weight
          totalBagPcs += pieces
          break;
        case "C":
          totalCargoWeight += weight
          break;
        case "M":
          totalMailWeight += weight
          break;
        default:
          console.log("ULD category not recognized")
      }
    }
  
    console.log("ttlPaxCount: ", totalPaxCount, " ttlPaxWeight: ", totalPaxWeight)
    console.log("ttlBagWeight: ", totalBagWeight, " ttlBagPcs: ", totalBagPcs, " ttlCargoWeight: ", totalCargoWeight, " ttlMailWeight: ", totalMailWeight);
  
    return { totalPaxWeight, totalPaxCount, totalBagWeight, totalBagPcs, totalCargoWeight, totalMailWeight };
  }