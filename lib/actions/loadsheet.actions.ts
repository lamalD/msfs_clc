'use server'

import { aircraft } from "@/constants/aircraftindex"

export async function calculateOperatingWeight(dow:string, tof:string) {

    // DOW + TOF

    var operatingWeight = parseInt(dow) + parseInt(tof)

    console.log("OW: ", operatingWeight)

    return operatingWeight
}

export async function calculateAllowedTrafficLoad(tof:string, tif:string, operatingWeight:number, acftType:string, units:string) {

    // LOWEST OF:
    // - MZFW + TOF
    // - MTOW
    // - MLDW + TIF

    var one
    var two
    var three

    if (units === "kgs") {

        one = parseInt(aircraft.find((item) => item.acft === acftType)!.max_zfw_kgs) + parseInt(tof)

        two = parseInt(aircraft.find((item) => item.acft === acftType)!.max_tow_kgs)

        three = parseInt(aircraft.find((item) => item.acft === acftType)!.max_ldw_kgs) + parseInt(tif)
    } else {

        one = parseInt(aircraft.find((item) => item.acft === acftType)!.max_zfw_lbs) + parseInt(tof)

        two = parseInt(aircraft.find((item) => item.acft === acftType)!.max_tow_lbs)

        three = parseInt(aircraft.find((item) => item.acft === acftType)!.max_ldw_lbs) + parseInt(tif)
    }

    function findLowest(a: number, b: number, c: number): number {
        return Math.min(a, b, c);
    }

    const limitation = findLowest(one, two, three)

    let limitingWeight

    switch (limitation) {
        case one:
            limitingWeight = "ZFW"
            break;
        case two:
            limitingWeight = "TOW"
            break;
        case three:
            limitingWeight = "LDW"
            break;
        default:
            break;
    }

    // ALLOWED TRAFFIC LOAD = ALLOWED WEIGHT FOR TO - OPERATING WEIGHT

    const allowedTrafficLoad = limitation - operatingWeight

    return { allowedTrafficLoad, limitingWeight }
}

export async function calculateUnderload(allowedTrafficLoad:number, totalTrafficLoad:number) {

    // UNDERLOAD = ALLOWED TRAFFIC LOAD - TOTAL TRAFFIC LOAD

    var underload = allowedTrafficLoad - totalTrafficLoad

    return underload
}

export async function generateEDPloadsheet() {

    function padStart(text:string, length:number) {
      return text.padStart(length, ' ');
    }
  
    console.log(`\n
  L O A D S H E E T           CHECKED          APPROVED      EDNO\n
  ALL WEIGHTS IN KILOGRAMS                                   ffa \n
                                                                 \n
  FROM/TO FLIGHT      A/C REG  VERSION      CREW     DATE    TIME\n
  aaa aaa aaaffffa/f  mmmmmm   ttttttttttt  f/f/f    ffaaaff ffff\n
                                                                 \n
                        WEIGHT           DISTRIBUTION            \n
  LOAD IN COMPARTMENTS    ffffff t------------------------------t\n
                                 t------------------------------t\n
  PASSENGER/CABIN BAG     ffffff fff/fff/fff/fff TTL fff CAB ffff\n
                                 PAX fff/fff/fff SOC ff/ff/ff    \n
  TOTAL TRAFFIC LOAD      ffffff BLKD ff/ff/ff                   \n
  DRY OPERATING WEIGHT    ffffff                                 \n
  ******************************                                 \n
  ZERO FUEL WEIGHT ACTUAL ffffff MAX ffffff  a  ADJ              \n
  ******************************                                 \n
  TAKE OFF FUEL           ffffff                                 \n
  ******************************                                 \n
  TAKE OFF WEIGHT  ACTUAL ffffff MAX ffffff  a  ADJ              \n
  ******************************                                 \n
  TRIP FUEL               ffffff                                 \n
  LANDING WEIGHT   ACTUAL ffffff MAX ffffff  a  ADJ              \n
                                                                 \n
  BALANCE AND SEATING CONDITIONS        LAST MINUTE CHANGES      \n
  t-----------------------------t DEST  SPEC    CL/CPT + - WEIGHT\n
  t-----------------------------t                                \n
  t-----------------------------t                                \n
  t-----------------------------t                                \n
  t-----------------------------t                                \n
                                                                 \n
  UNDERLOAD BEFORE LMC    ffffff           LMC TOTAL + -         \n
  CAPTAINS INFORMATION / NOTES                                   \n
  LOADMESSAGE BEFORE LMC                                         \n`)
  }