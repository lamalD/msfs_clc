'use client'

import React from 'react'

import { useStore } from '@/lib/database/storeData';
import { operators } from '@/constants/operatorindex';
import { aircraft } from '@/constants/aircraftindex';
import { calculateTotalWeight, calcWeightPerCpt, formatCptWeights, formatString } from '@/lib/actions/edp.actions';

const Edp_Loadsheet = ({
    stdTime, 
    stdDate, 
    ttlCargoWeight, 
    ttlMailWeight, 
    ttlBagWeight,
    ttlPax,
    ttlPaxWeight,
    ttlBagPcs,
    ttlTrafficLoad,
}:{
    stdTime:string, 
    stdDate:string,
    ttlCargoWeight:string,
    ttlMailWeight:string,
    ttlBagWeight:string,
    ttlPax:string,
    ttlPaxWeight:string,
    ttlBagPcs:string,
    ttlTrafficLoad:string,
}) => {

    function padStart(text:string, length:number) {
        return text.padStart(length, ' ');
    }

    function padEnd(text:string, length:number) {
        return text.padEnd(length, ' ');
    }

    function getHoursAndMinutes() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}${minutes}`;
    }

    const { userData } = useStore()
    const { flightData } = useStore()

    const dep = flightData?.origin
    const arr = flightData?.destination
    const operator = operators.find((item) => item.icao_code === (flightData!.flightNumber)!.substring(0,3))!.iata_code
    const flightnumber = (flightData!.flightNumber)!.substring(3)
    const flightdate = stdDate.substring(0,2)
    const flightNdate = padEnd((operator+flightnumber+"/"+flightdate), 9)
    const reg = padStart((flightData!.registration).replace("-", ""), 6)
    const date = padStart(((stdDate.replace(" ", "")).substring(0, 5)), 7)
    const time = getHoursAndMinutes()
    const ttlInCpts = padStart((parseInt(ttlCargoWeight) + parseInt(ttlMailWeight) + parseInt(ttlBagWeight)).toFixed(), 6)
    const paxWeight = padStart(ttlPaxWeight, 6)
    const M = flightData!.paxMale
    const F = flightData!.paxFemale
    const C = flightData!.paxChildren
    const I = "0" 
    const allPax = padStart(ttlPax, 3)
    const allBags = padEnd(ttlBagPcs, 4)
    const paxF = flightData!.paxCount_F
    const paxC = flightData!.paxCount_C
    const paxY = flightData!.paxCount_Y
    const ttlTL = padStart(ttlTrafficLoad, 6)
    const aDOW = padStart(flightData!.dow, 6)
    const aZFW = padStart((parseInt(aDOW) + parseInt(ttlTL)).toFixed(), 6)
    const aTOF = padStart(flightData!.to_fuel, 6)
    const aTOW = padStart((parseInt(aZFW) + parseInt(aTOF)).toFixed(), 6)
    const aTIF = padStart(flightData!.trip_fuel, 6)
    const aLDW = padStart((parseInt(aTOW) + parseInt(aTIF)).toFixed(), 6)

    const mZFW = padStart((aircraft.find((item) => item.acft === flightData!.aircraftType)!.max_zfw_kgs), 6)
    const mTOW = padStart((aircraft.find((item) => item.acft === flightData!.aircraftType)!.max_tow_kgs), 6)
    const mLDW = padStart((aircraft.find((item) => item.acft === flightData!.aircraftType)!.max_ldw_kgs), 6)

    const aLIM = flightData!.limitation

    const aUnderload = padStart(flightData!.underload, 6)

    const aDOI = padStart(flightData!.doi.substring(0,4), 3)
    const liZFW = padStart(flightData!.zfwi.substring(0,4), 3)
    const liTOW = padStart(flightData!.towi.substring(0,4), 3)

    const macZFW = flightData!.zfwmac
    const macTOW = flightData!.towmac

    const ttlPerCpt = calcWeightPerCpt(flightData)

    const ttlCpt1 = calculateTotalWeight(ttlPerCpt.cpt1_uld).toFixed()
    const ttlCpt2 = calculateTotalWeight(ttlPerCpt.cpt2_uld).toFixed()
    const ttlCpt3 = calculateTotalWeight(ttlPerCpt.cpt3_uld).toFixed()
    const ttlCpt4 = calculateTotalWeight(ttlPerCpt.cpt4_uld).toFixed()
    const ttlCpt5 = calculateTotalWeight(flightData!.blk_hold_uld.split(",")).toFixed()

    const cptTtlS = formatCptWeights(ttlCpt1, ttlCpt2, ttlCpt3, ttlCpt4, ttlCpt5)

    console.log("cptTtlS: ", cptTtlS)

    const frmttdCptTTlS = formatString(cptTtlS)

    console.log(frmttdCptTTlS)

    const ttlCpts = (parseInt(ttlCargoWeight) + parseInt(ttlMailWeight) + parseInt(ttlBagWeight)).toFixed()

    const loadmessage = `-${arr}.${M}/${F}/${C}/${I}.0.T${ttlCpts}.1/${ttlCpt1}.2/${ttlCpt2}.3/${ttlCpt3}.4/${ttlCpt4}.5/${ttlCpt5}`

  return (
    <div id='Edp_Loadsheet' className='text-xs' style={{lineHeight: 1.0}}>
        <pre>                                                               </pre>
        <pre>L O A D S H E E T           CHECKED          APPROVED      EDNO</pre>
        <pre>ALL WEIGHTS IN KILOGRAMS                                   01F </pre>
        <pre>                                                               </pre>
        <pre>FROM/TO FLIGHT      A/C REG  VERSION      CREW     DATE    TIME</pre>
        <pre>{dep} {arr} {flightNdate}  {reg}    F12C42Y316   2/11   {date}   {time}</pre>
        <pre>                                                               </pre>
        <pre>                        WEIGHT           DISTRIBUTION          </pre>
        <pre>LOAD IN COMPARTMENTS    {ttlInCpts} {frmttdCptTTlS[0]}</pre>
        <pre>                               {frmttdCptTTlS.length > 1 ? frmttdCptTTlS[1] : " "}</pre>
        <pre>PASSENGER/CABIN BAG     {paxWeight} {M}/{F}/{C}/{I} TTL {allPax} CAB 0   </pre>
        <pre>                               PAX FCY {paxF}/{paxC}/{paxY} SOC 0/0/0    </pre>
        <pre>TOTAL TRAFFIC LOAD      {ttlTL} BLKD 0/0/0                   </pre>
        <pre>DRY OPERATING WEIGHT    {aDOW}                                 </pre>
        <pre>******************************                                 </pre>
        <pre>ZERO FUEL WEIGHT ACTUAL {aZFW} MAX {mZFW}  {aLIM === "ZFW" ? "L" : " "}  ADJ              </pre>
        <pre>******************************                                 </pre>
        <pre>TAKE OFF FUEL           {aTOF}                                 </pre>
        <pre>******************************                                 </pre>
        <pre>TAKE OFF WEIGHT  ACTUAL {aTOW} MAX {mTOW}  {aLIM === "TOW" ? "L" : " "}  ADJ              </pre>
        <pre>******************************                                 </pre>
        <pre>TRIP FUEL               {aTIF}                                 </pre>
        <pre>LANDING WEIGHT   ACTUAL {aLDW} MAX {mLDW}  {aLIM === "LDW" ? "L" : " "}  ADJ              </pre>
        <pre>                                                               </pre>
        <pre>BALANCE AND SEATING CONDITIONS        LAST MINUTE CHANGES      </pre>
        <pre>DOI {aDOI} LIZFW {liZFW} LITOW {liTOW} DEST  SPEC    CL/CPT + - WEIGHT</pre>
        <pre>t-----------------------------t                                </pre>
        <pre>t-----------------------------t                                </pre>
        <pre>t-----------------------------t                                </pre>
        <pre>t-----------------------------t                                </pre>
        <pre>                                                               </pre>
        <pre>UNDERLOAD BEFORE LMC    {aUnderload}           LMC TOTAL + -         </pre>
        <pre>CAPTAINS INFORMATION / NOTES                                   </pre>
        <pre>MACZFW {macZFW} MACTOW {macTOW}</pre>
        <pre>LOADMESSAGE BEFORE LMC                                         </pre>
        <pre>{loadmessage}</pre>
    </div>
  )
}

export default Edp_Loadsheet