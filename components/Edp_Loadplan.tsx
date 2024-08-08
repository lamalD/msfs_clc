'use client'

import React from 'react'

import { useStore } from '@/lib/database/storeData'
import { aircraft } from '@/constants/aircraftindex'

const Edp_Loadplan = ({ 
  stdTime, 
  stdDate, 
  ttlCargoWeight, 
  ttlMailWeight, 
  ttlBagWeight 
}:{
  stdTime:string, 
  stdDate:string, 
  ttlCargoWeight:string, 
  ttlMailWeight:string, 
  ttlBagWeight:string
}) => {

  function padStart(text:string, length:number) {
    return text.padStart(length, ' ');
  }

  function calculateTotalWeight(data:any) {
    let totalWeight = 0;
    for (const item of data) {
      const parts = item.split('/')
      const catIndex = parts[0].length == 1 ? 2 : 3
      const weight = parseInt(parts[catIndex], 10)
      totalWeight += weight
    }
    return totalWeight;
  }

  function extractWeights(dataString:string) {
    const items = dataString.split(',')
    const weights = items.map(item => {
      const parts = item!.split('/')
      const weight = parseInt(parts[2], 10)
      const destIndex = parts[1] === "BF" || parts[1] === "BC" || parts[1] === "BY" ? 4 : 3
      const dest = parts[destIndex]
      const category = parts[1]
      return {category, weight, dest}
    });
    return weights
  }

  const { userData } = useStore()
  const { flightData } = useStore()

  let maxCpt1:string = ""
  let maxCpt2:string = ""
  let maxCpt3:string = ""
  let maxCpt4:string = ""
  let maxCpt5:string = ""

  switch (flightData?.units) {
    case "lbs":
      maxCpt1 = aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt1_lbs
      maxCpt2 = aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt2_lbs
      maxCpt3 = aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt3_lbs
      maxCpt4 = aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt4_lbs
      maxCpt5 = aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt5_lbs

      break;
  
    default:
      maxCpt1 = padStart(aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt1_kgs, 5)
      maxCpt2 = padStart(aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt2_kgs, 5)
      maxCpt3 = padStart(aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt3_kgs, 5)
      maxCpt4 = padStart(aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt4_kgs, 5)
      maxCpt5 = padStart(aircraft.find((index) => index.acft === flightData?.aircraftType)!.max_cpt5_kgs, 5)

      break;
  }
  
  const fwd_uld_array = flightData?.fwd_hold_uld.split(",")
  const aft_uld_array = flightData?.aft_hold_uld.split(",")
  const blk_uld_array = flightData!.blk_hold_uld

  const cpt1_uld = []
  const cpt2_uld = []
  const cpt3_uld = []
  const cpt4_uld = []
  const cpt5_uld = blk_uld_array
  let blkLoads

  for (let index = 0; index < fwd_uld_array!.length; index++) {
    const element = fwd_uld_array![index];
    
    let [position] = element.split("/")

    switch (position.substring(0,1)) {
      case "1":
        cpt1_uld.push(element)
        cpt1_uld.sort()
        break;
    
      case "2":
        cpt2_uld.push(element)
        cpt2_uld.sort()
        break;
      default:
        break;
    }
  }

  for (let index = 0; index < aft_uld_array!.length; index++) {
    const element = aft_uld_array![index];
    
    let [position] = element.split("/")

    switch (position.substring(0,1)) {
      case "3":
        cpt3_uld.push(element)
        cpt3_uld.sort()
        break;
    
      case "4":
        cpt4_uld.push(element)
        cpt4_uld.sort()
        break;
      default:
        break;
    }
  }

  const generateUldPositions = (uldArray: string[]) => {
    const positions = [];
    console.log("uldArray: ", uldArray)
    for (let index = 0; index < uldArray.length; index++) {
      const element = uldArray[index]
      let [position, uldNumber, category] = element.split('/')
      let weight:string = ""
      let destination:string = ""

      if (category === "C" || category === "M") {
        [position, uldNumber, category, weight, destination] = element.split('/')
      } else {
        [position, uldNumber, category, weight, , destination] = element.split('/')
      }
      
      switch (position.charAt(position.length - 1)) {
        case "P":
          positions.push(
            <div key={index}>
              <pre>:{position}  {uldNumber}                                                     </pre>
              <pre>:ONLOAD: {destination} {category}/{weight}                                        </pre>
              <pre>:SPECS:  NIL                                                    </pre>
              <pre>:REPORT: {weight}                                           :  {weight}</pre>
              <pre>                                                                </pre>
            </div>
          )

          break;
          
        case "L":

          const elementR = uldArray[index+1]
          console.log("elementR = ", elementR)
          let [positionR, uldNumberR, categoryR] = elementR.split('/')
          let weightR:string = ""
          let destinationR:string = ""
    
          if (categoryR === "C" || categoryR === "M") {
            [positionR, uldNumberR, categoryR, weightR, destinationR] = elementR.split('/')
          } else {
            [positionR, uldNumberR, categoryR, weightR, , destinationR] = elementR.split('/')
          }
          
          positions.push(
            <div key={index}>
              <pre>:{position}  {uldNumber}       :{positionR}  {uldNumberR}                         </pre>
              <pre>:ONLOAD: {destination} {category}/{weight}    :ONLOAD: {destinationR} {categoryR}/{weightR}            </pre>
              <pre>:SPECS:  NIL           :SPECS:  NIL                        </pre>
              <pre>:REPORT: {weight}           :REPORT: {weightR}                     : {parseInt(weight)+parseInt(weightR)}         </pre>
              <pre>                                                                </pre>
            </div>
          )

          break;
        default:
          break;
      }
    }
    return positions
  }

  const generateBlkPositions = (uldArray: string) => {
    const positions = [];
    for (let index = 0; index < 1; index++) {
      
      blkLoads = extractWeights(uldArray)

      positions.push(
        <div key={index}>
          <pre> </pre>
          <pre>:ONLOAD: {blkLoads[0].dest} {blkLoads[0].category}/{blkLoads[0].weight}R {blkLoads[1].category}/{blkLoads[1].weight}R {blkLoads[2].category}/{blkLoads[2].weight}R {blkLoads[3].category}/{blkLoads[3].weight}R {blkLoads[4].category}/{blkLoads[4].weight}R                                                             </pre>
          <pre>:SPECS:  NIL                                   </pre>
          <pre>:REPORT:                                           </pre>
          <pre>                                                                </pre>
        </div>
      )
    }
    return positions
  }

  const ttlWeightCPT_1 = calculateTotalWeight(cpt1_uld)
  const ttlWeightCPT_2 = calculateTotalWeight(cpt2_uld)
  const ttlWeightCPT_3 = calculateTotalWeight(cpt3_uld)
  const ttlWeightCPT_4 = calculateTotalWeight(cpt4_uld)
  const ttlWeightCPT_5 = calculateTotalWeight(cpt5_uld.split(","))

  return (
    <div id='Edp_Loadplan' className='text-xs' style={{lineHeight: 1.0}}>
        <pre>LOADING INSTRUCTION/REPORT             PREPARED BY LAMD     EDNO</pre>
        <pre>ALL WEIGHTS IN KILOS                                          1 </pre>
        <pre>FROM/TO FLIGHT A/C REG  VERSION     GATE TAR STD   DATE     TIME</pre>
        <pre>{flightData?.origin} {flightData?.destination} {flightData?.flightNumber} {flightData?.registration}   F12C42Y316  E23 E23 {stdTime.replace(":", "")}  {stdDate.replace(/\s/g, "")}  1120</pre>
        <pre>PLANNED LOAD                                                    </pre>
        <pre>ORD  F {padStart(flightData!.paxCount_F, 2)}  C {padStart(flightData!.paxCount_C, 2)}  Y {padStart(flightData!.paxCount_Y,3)}  C {padStart(ttlCargoWeight, 5)}  M {padStart(ttlMailWeight, 4)} B {padStart(ttlBagWeight, 5)}                </pre>
        <pre>LOADING INSTRUCTION                                       ACTUAL</pre>
        <pre>--------------------------------------------              WEIGHT</pre>
        <pre>CPT 1 FWD  MAX {maxCpt1}                      ::              IN KGS</pre>
        <pre>                                          ----------------------</pre>
        {generateUldPositions(cpt1_uld)}
        <pre>--------------------------------------------                    </pre>
        <pre>CPT 2 FWD  MAX {maxCpt2}                      :: CPT 1 TOTAL:  {ttlWeightCPT_1}</pre>
        <pre>                                          ----------------------</pre>
        {generateUldPositions(cpt2_uld)}
        <pre>--------------------------------------------                    </pre>
        <pre>CPT 3 FWD  MAX {maxCpt3}                      :: CPT 2 TOTAL:  {ttlWeightCPT_2}</pre>
        <pre>                                          ----------------------</pre>
        {generateUldPositions(cpt3_uld)}
        <pre>--------------------------------------------                    </pre>
        <pre>CPT 4 FWD  MAX {maxCpt4}                      :: CPT 3 TOTAL:  {ttlWeightCPT_3}</pre>
        <pre>                                          ----------------------</pre>
        {generateUldPositions(cpt4_uld)}
        <pre>--------------------------------------------                    </pre>
        <pre>CPT 5 FWD  MAX {maxCpt5}                      :: CPT 4 TOTAL:  {ttlWeightCPT_4}</pre>
        <pre>                                          ----------------------</pre>
        {generateBlkPositions(cpt5_uld)}
        <pre>--------------------------------------------                    </pre>
        <pre>                                          :: CPT 5 TOTAL:  {ttlWeightCPT_5}</pre>
        <pre>                                          ----------------------</pre>
        <pre>                                                                </pre>
        <pre>SI.                                                             </pre>
        <pre>NIL OR COMMENT                                                  </pre>
        <pre>                                                                </pre>
        <pre>SERVICE WEIGHT ITEMS                                            </pre>
        <pre>NIL OR COMMENT                                                  </pre>
        <pre>                                                                </pre>
        <pre>THIS AIRCRAFT HAS BEEN LOADED IN ACCORDANCE WITH THESE INSTRU - </pre>
        <pre>TIONS AND THE DEVIATIONS SHOWN ON THIS REPORT. BULK LOAD HAS    </pre>
        <pre>BEEN SECURED.                                                   </pre>
        <pre>                                                                </pre>
        <pre>PRINT NAME:                       SIGNATURE:                    </pre>
        <pre>                                                                </pre>
        <pre>THE CONTAINER / PALLETS HAV BEEN SECURED IN ACCORDANCE WITH     </pre>
        <pre>COMPANY INSTRUCTIONS.                                           </pre>
        <pre>                                                                </pre>
        <pre>PRINT NAME:                       SIGNATURE:                    </pre>
        <pre>                                                                </pre>
        <pre>LOADING REPORT DATA TRANSMITTED TO THE LOADSHEET AGENT BY       </pre>
        <pre>                                                                </pre>
        <pre>PRINT NAME:                       SIGNATURE:                    </pre>
        <pre>                                                                </pre>
        <pre>PLEASE CHECK AND CONFIRM THAT ALL HOLDS AND EMPTY CONTAINERS    </pre>
        <pre>TO BE LOADED WERE EMPTY BEFORE LOADING                          </pre>
        <pre>                                                                </pre>
        <pre>PRINT NAME:                       SIGNATURE:                    </pre>
        <pre>                                                                </pre>
    </div>
  )
}

export default Edp_Loadplan