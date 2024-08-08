'use server'

import React from 'react'

import { connectToDatabase } from "../database/mongoose"
import Flight from "../database/models/flight.model"
import { handleError } from "../utils"
import { formatDateAndTime } from '@/lib/actions/simbrief.action';

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

export async function generateEDPloadplan( userData:any, flightData:any, ttlCargoWeight:string, ttlMailWeight:string, ttlBagWeight:string) {

  function padStart(text:string, length:number) {
    return text.padStart(length, ' ');
  }

  console.log("userData: ", userData, " flightData: ", flightData)

  console.log(`\n
LOADING INSTRUCTION/REPORT             PREPARED BY LAMD     EDNO\n
ALL WEIGHTS IN KILOS                                          1 \n
FROM/TO FLIGHT A/C REG  VERSION     GATE TAR STD   DATE     TIME\n
${flightData?.origin} ${flightData?.destination} ${flightData?.flightNumber} ${flightData?.registration}   F12C42Y316   E23 E23 ${((await formatDateAndTime(flightData?.departureTime)).time).replace(":", "")}  ${((await formatDateAndTime(flightData?.departureDate)).date).replace(/\s/g, "")}  1120\n
PLANNED LOAD                                                    \n
ORD  F ${padStart(flightData.paxCount_F, 2)}  C ${padStart(flightData.paxCount_C, 2)}  Y ${padStart(flightData.paxCount_Y,3)}  C ${padStart(ttlCargoWeight, 5)}  M ${padStart(ttlMailWeight, 4)} B ${padStart(ttlBagWeight, 6)}                \n
JOINING SPECS:      SEE SUMMARY/NIL                             \n
TRANSIT SPECS:      SEE SUMMARY/NIL                             \n
RELOADS:            NIL                                         \n
                                                                \n
LOADING INSTRUCTION                                       ACTUAL\n
--------------------------------------------              WEIGHT\n
CPT 1 FWD  MAX 12345                      ::              IN KGS\n
                                          ----------------------\n
:POS  ULDNR                 :POS  ULDNR                         \n
:ONLOAD: DEST CAT/WEIGHT    :ONLOAD: DEST CAT/WEIGHT            \n
:SPECS:  SEE SUMMARY        :SPECS:  SEE SUMMARY                \n
:REPORT:                    :REPORT:                            \n
--------------------------------------------                    \n
CPT 2 FWD  MAX 12345                      :: CPT 1 TOTAL:  12345\n
                                          ----------------------\n
--------------------------------------------                    \n
CPT 3 FWD  MAX 12345                      :: CPT 2 TOTAL:  12345\n
                                          ----------------------\n
--------------------------------------------                    \n
CPT 4 FWD  MAX 12345                      :: CPT 3 TOTAL:  12345\n
                                          ----------------------\n
--------------------------------------------                    \n
CPT 5 FWD  MAX 12345                      :: CPT 4 TOTAL:  12345\n
                                          ----------------------\n
--------------------------------------------                    \n
                                          :: CPT 5 TOTAL:  12345\n
                                          ----------------------\n
                                                                \n
SI.                                                             \n
NIL OR COMMENT                                                  \n
                                                                \n
SERVICE WEIGHT ITEMS                                            \n
NIL OR COMMENT                                                  \n
                                                                \n
THIS AIRCRAFT HAS BEEN LOADED IN ACCORDANCE WITH THESE INSTRU - \n
TIONS AND THE DEVIATIONS SHOWN ON THIS REPORT. BULK LOAD HAS    \n
BEEN SECURED.                                                   \n
                                                                \n
PRINT NAME:                       SIGNATURE:                    \n
                                                                \n
THE CONTAINER / PALLETS HAV BEEN SECURED IN ACCORDANCE WITH     \n
COMPANY INSTRUCTIONS.                                           \n
                                                                \n
PRINT NAME:                       SIGNATURE:                    \n
                                                                \n
LOADING REPORT DATA TRANSMITTED TO THE LOADSHEET AGENT BY       \n
                                                                \n
PRINT NAME:                       SIGNATURE:                    \n
                                                                \n
PLEASE CHECK AND CONFIRM THAT ALL HOLDS AND EMPTY CONTAINERS    \n
TO BE LOADED WERE EMPTY BEFORE LOADING                          \n
                                                                \n
PRINT NAME:                       SIGNATURE:                    \n
                                                                \n`)
}