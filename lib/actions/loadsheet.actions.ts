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