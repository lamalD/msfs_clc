'use server'

import { aft_version_77W, config_77W, fwd_version_77W } from "@/constants/loadconfigindex"
import Flight from "../database/models/flight.model"
import { connectToDatabase } from "../database/mongoose"

export async function loadDistribution(db_Id:string) {

    await connectToDatabase()

    const flight = await Flight.findOne({_id: db_Id})

    const averageBag = await calculateAverageBagPerPax(flight)
    const ttlLD3Pax = await caculateTtlLD3Bag(averageBag.ttlBagY, averageBag.ttlBagC)

    // #### CHECK ROUNDING!!!
    var ld3Version = config_77W.find((version) => version.ld3 === (2 * Math.round(ttlLD3Pax.ttlLd3Pax / 2)).toString())
    console.log("version: ", ld3Version, " for ", (2 * Math.round(ttlLD3Pax.ttlLd3Pax / 2)).toString())

    let fwd_version = fwd_version_77W.find((version) => version.version === ld3Version?.fwd_version)?.config
    let aft_version = aft_version_77W.find((version) => version.version === ld3Version?.aft_version)?.config

    console.log(fwd_version, " / ", aft_version)

    const ttlLd3Aft = fwd_version_77W.find((version) => version.version === ld3Version?.aft_version)?.ld3

    const fwdHld = fwd_version!.split("/")

    const aftHld = aft_version!.split("/")

    const bagUlds = await generateBagUld(ttlLD3Pax.ttlLd3Pax, ttlLd3Aft!, fwdHld, aftHld)

    console.log("aftHldUlds: ", bagUlds.aftHldUlds)
    console.log("fwdHldUlds: ", bagUlds.fwdHldUlds)

    let aftHldUlds = bagUlds.aftHldUlds
    let fwdHldUlds = bagUlds.fwdHldUlds
    let blkHldUlds = []

    var remainingWeightY = averageBag.ttlBagYWeight
    var remainingWeightC = averageBag.ttlBagCWeight
    var remainingWeightF = averageBag.ttlBagFWeight

    var remainingBagsY = averageBag.ttlBagY
    var remainingBagsC = averageBag.ttlBagC
    var remainingBagsF = averageBag.ttlBagF

    const assignLD3 = await assignCatToLD3(
        aftHldUlds,
        fwdHldUlds,
        ttlLD3Pax.ttlLd3Pax,
        ttlLD3Pax.ttlLd3C,
        averageBag.ttlBagC,
        averageBag.ttlBagF,
        remainingBagsY,
        remainingBagsC,
        remainingBagsF,
        flight.bag_weight,
        remainingWeightY,
        remainingWeightC,
        remainingWeightF,
        flight.destination,
    )

    aftHldUlds = assignLD3.aftHldUlds
    fwdHldUlds = assignLD3.fwdHldUlds

    blkHldUlds.push("5/BF/"+(assignLD3.remainingBagsF*(flight.bag_weight)).toFixed()+"/"+(assignLD3.remainingBagsF).toFixed()+"/"+flight.destination+"/R")
    blkHldUlds.push("5/BC/"+(assignLD3.remainingBagsC*(flight.bag_weight)).toFixed()+"/"+(assignLD3.remainingBagsC).toFixed()+"/"+flight.destination+"/R")
    blkHldUlds.push("5/BY/"+(assignLD3.remainingBagsY*(flight.bag_weight)).toFixed()+"/"+(assignLD3.remainingBagsY).toFixed()+"/"+flight.destination+"/R")

    console.log("blkHld: ", blkHldUlds)

    // CALCULATE WEIGHT AVAILABLE FOR CARGO (& MAIL)
    var availWeightForCargo = 
        parseInt(flight.pld)
        - (
            (parseInt(flight.paxCountF) * parseFloat(flight.pax_weight))
            + (parseInt(flight.paxCountC) * parseFloat(flight.pax_weight))
            + (parseInt(flight.paxCountY) * parseFloat(flight.pax_weight))
            + (parseInt(flight.bagCount) * parseFloat(flight.bag_weight)) 
            - averageBag.ttlBagYWeight 
            - averageBag.ttlBagCWeight 
            - averageBag.ttlBagFWeight
        )
    console.log("availWeightForCargo = ", availWeightForCargo.toFixed(0))

    const assignedCargoWeight = await assignCargoWeights2Holds(
                                            fwdHldUlds,
                                            aftHldUlds,
                                            blkHldUlds,
                                            flight.fwd_hold,
                                            flight.aft_hold,
                                            flight.blk_hold
                                        )

    var availWeightCargoFwd = assignedCargoWeight.availWeightCargoFwd
    var availWeightCargoAft = assignedCargoWeight.availWeightCargoAft
    var availWeightCargoBlk = assignedCargoWeight.availWeightCargoBlk

    const fwdCargoUlds = await generateCargoUldFwd(fwdHld, availWeightCargoFwd, fwdHldUlds, flight.destination)
    const aftCargoUlds = await generateCargoUldAft(aftHld, availWeightCargoAft, aftHldUlds, flight.destination)
    const blkCargoUlds = await generateCargoUldBlk(availWeightCargoBlk, blkHldUlds, flight.destination)

    return {
        fwdHldUlds: fwdCargoUlds.fwdHldUlds,
        aftHldUlds: aftCargoUlds.aftHldUlds, 
        blkHldUlds: blkCargoUlds.blkHldUlds,
    }
}

async function calculateAverageBagPerPax(flightData: any) {

    const averageBag = ["0.75", "0.85", "0.95", "1.00", "1.05", "1.15", "1.25", "1.35", "1.45", "1.50"]

    function getBagAverage(averageBag: string | any[]) {
        const randomIndex = Math.floor(Math.random() * averageBag.length);
        const randomElement = averageBag[randomIndex];
        return randomElement;
    }

    // var paxCount = flight.paxCount
    var paxCountF = flightData!.paxCount_F
    var paxCountC = flightData!.paxCount_C
    var paxCountY = flightData!.paxCount_Y

    // CALCULATE TTL BAGS Y-CLASS BASED ON BAG AVERAGE + TTL WEIGHT
    var ttlBagY = Math.floor(paxCountY * getBagAverage(averageBag))
    var ttlBagYWeight = ttlBagY * parseFloat(flightData.bag_weight)
    console.log("Ttl bag Y: ", ttlBagY, " Average: ", ttlBagY/paxCountY, " Ttl weight: ", ttlBagYWeight)
    
    // CALCULATE TTL BAGS C-CLASS BASED ON BAG AVERAGE + TTL WEIGHT
    var ttlBagC = Math.floor(paxCountC * getBagAverage(averageBag))
    var ttlBagCWeight = ttlBagC * parseFloat(flightData.bag_weight)
    console.log("Ttl bag C: ", ttlBagC, " Average: ", ttlBagC/paxCountC, " Ttl weight: ", ttlBagCWeight)

    // CALCULATE TTL BAGS C-CLASS BASED ON BAG AVERAGE + TTL WEIGHT
    var ttlBagF = Math.floor(paxCountF * getBagAverage(averageBag))
    var ttlBagFWeight = ttlBagF * parseFloat(flightData.bag_weight)
    console.log("Ttl bag F: ", ttlBagF, " Average: ", ttlBagF/paxCountF, " Ttl weight: ", ttlBagFWeight)

    return {
        ttlBagY,
        ttlBagC,
        ttlBagF,
        ttlBagYWeight,
        ttlBagCWeight,
        ttlBagFWeight,
    }
}

async function caculateTtlLD3Bag(ttlBagY:number, ttlBagC:number) {

    // CALCULATE TTL LD3 Y-CLASS
    var ttlLd3Y = Math.floor(ttlBagY / 30)
    console.log("Required LD3 Y: ", ttlLd3Y)

    // CALCULATE TTL LD3 C-CLASS
    var ttlLd3C = Math.floor(ttlBagC / 25)
    console.log("Required LD3 C: ", ttlLd3C)

    var ttlLd3Pax = ttlLd3Y + ttlLd3C
    
    if (ttlLd3C === 0) {
        //Add 1 LD3 BC/BF
        ttlLd3C = 1
        ttlLd3Pax = ttlLd3Pax + 1
        
    }
        
    console.log("TTL LD3: ", ttlLd3Pax)

    return {ttlLd3Pax, ttlLd3Y, ttlLd3C}
}

async function generateBagUld(ttlLd3Pax:number, ttlLd3Aft:string, fwdHld:string[], aftHld:string[]) {

    let aftHldUlds = []
    let fwdHldUlds = []
    let blkHldUlds = []

    const getRandomUldNumber = (min: number, max: number) => {
        return Math.random() * (max - min) + min
    }

    if (ttlLd3Pax! <= parseInt(ttlLd3Aft!)) {

        console.log("ttlLd3Pax! <= ttlLd3Aft!")

        for (let index = 0; index < aftHld.length; index++) {
            let position = aftHld[index];
            
            if (position.length === 2) {

                for (let nmbr = 0; nmbr < 2; nmbr++) {

                    if (nmbr === 0) {
                        position = position + "R"
                    }

                    if (nmbr === 1) {
                        position = position + "L"
                    }
                    
                    const uldNumber = position.slice(0,3) 
                                        + "/" 
                                        + "AKE" 
                                        + (getRandomUldNumber(10000, 90000).toFixed(0)) 
                                        + "FF"

                    aftHldUlds.push(uldNumber)

                    position = position.slice(0,-1)
                }
            }
        }    
    } else {
        console.log("ttlLd3Pax! > ttlLd3Aft!")

        for (let index = 0; index < aftHld.length; index++) {
            let position = aftHld[index];
            
            if (position.length === 2) {

                for (let nmbr = 0; nmbr < 2; nmbr++) {

                    if (nmbr === 0) {
                        position = position + "R"
                    }

                    if (nmbr === 1) {
                        position = position + "L"
                    }
                    
                    const uldNumber = position.slice(0,3) 
                                        + "/" 
                                        + "AKE" 
                                        + (getRandomUldNumber(10000, 90000).toFixed(0)) 
                                        + "FF"

                    aftHldUlds.push(uldNumber)

                    position = position.slice(0,-1)
                }
            }
        }

        for (let index = 0; index < fwdHld.length; index++) {
            let position = fwdHld[index];
            
            if (position.length === 2) {

                for (let nmbr = 0; nmbr < 2; nmbr++) {

                    if (nmbr === 0) {
                        position = position + "R"
                    }

                    if (nmbr === 1) {
                        position = position + "L"
                    }
                    
                    const uldNumber = position.slice(0,3) 
                                        + "/" 
                                        + "AKE" 
                                        + (getRandomUldNumber(10000, 90000).toFixed(0)) 
                                        + "FF"

                    fwdHldUlds.push(uldNumber)

                    position = position.slice(0,-1)
                }
            }
        }
    }

    console.log("aftHldUlds: ", aftHldUlds)
    console.log("fwdHldUlds: ", fwdHldUlds)

    return {fwdHldUlds, aftHldUlds}
}

async function assignCatToLD3(
    aftHldUlds:string[],
    fwdHldUlds:string[],
    ttlLd3Pax:number, 
    ttlLd3C:number, 
    ttlBagC:number, 
    ttlBagF:number,
    remainingBagsY:number,
    remainingBagsC:number,
    remainingBagsF:number,
    bag_weight:string,
    remainingWeightY:number,
    remainingWeightC:number,
    remainingWeightF:number,
    destination:string,
) {

    const getRandomBagsLD3 = (min: number, max: number) => {
        return Math.random() * (max - min) + min
    }

    const getRandomCargoWeight = (min: number, max: number) => {
        return Math.random() * (max - min) + min
    }

    for (let index = 0; index < aftHldUlds.length; index++) {
        const element:string = aftHldUlds[index];
        
        let position = element.slice(0,3)
        console.log("position: ", position)

        if (position === "42R" && ttlLd3C > 0) {

            if (ttlBagC+ttlBagF < 35) {

                var loadedBags = remainingBagsC + remainingBagsF

                var loadedWeight = loadedBags * parseFloat(bag_weight)
            
                remainingBagsC = 0
                remainingBagsF = 0
                remainingWeightC = remainingWeightC - (remainingBagsC * parseFloat(bag_weight))
                remainingWeightF = remainingWeightF - (remainingBagsF * parseFloat(bag_weight))
                
                aftHldUlds[index] = element + "/" + "BF" + "/" + "BC" + "/" + loadedWeight.toFixed(0) + "/" + loadedBags.toFixed() + "/" + destination
            } else {

                var loadedBags = 0
                
                if (ttlBagC < 35) { 
                    var loadedBags = ttlBagC 
                } else {
                    loadedBags = 35
                }

                var loadedWeight = loadedBags * parseFloat(bag_weight)
            
                remainingBagsC = remainingBagsC - loadedBags

                remainingWeightC = remainingWeightC - (remainingBagsC * parseFloat(bag_weight))
                
                aftHldUlds[index] = element + "/" + "BC" + "/" + loadedWeight.toFixed(0) + "/" + loadedBags.toFixed() + "/" + destination
            }

        } else {

            loadedBags = getRandomBagsLD3(28, 35)
            
            if ((remainingBagsY-loadedBags) < 0) {
                loadedBags = remainingBagsY
            } else {
                remainingBagsY = remainingBagsY - loadedBags
            }

            if (loadedBags < 20) {
                console.log("This should be a cargo ULD")
                aftHldUlds[index] = element + "/" + "C" + "/" + getRandomCargoWeight(250, 825).toFixed(0) + "/" + destination
            }
            var loadedWeight = loadedBags * parseFloat(bag_weight)
            
            remainingWeightY = remainingWeightY - loadedWeight
            
            aftHldUlds[index] = element + "/" + "BY" + "/" + loadedWeight.toFixed(0) + "/" + loadedBags.toFixed() + "/" + destination

        }
    }

    console.log("aftHldUlds = ", aftHldUlds)
    console.log(remainingBagsF, remainingBagsC, remainingBagsY)

    for (let index = 0; index < fwdHldUlds.length; index++) {
        const element:string = fwdHldUlds[index];
        
        loadedBags = getRandomBagsLD3(25, 35)
            
        if ((remainingBagsY-loadedBags) < 0) {
            loadedBags = remainingBagsY
        } else {
            remainingBagsY = remainingBagsY - loadedBags
        }

        var loadedWeight = loadedBags * parseFloat(bag_weight)
        
        remainingWeightY = remainingWeightY - loadedWeight
        
        if (loadedBags < 20) {
            console.log("This should be a cargo ULD")
            fwdHldUlds[index] = element + "/" + "C" + "/" + getRandomCargoWeight(250, 825).toFixed(0) + "/" + destination
        } else {

            fwdHldUlds[index] = element + "/" + "BY" + "/" + loadedWeight.toFixed(0) + "/" + loadedBags.toFixed() + "/" + destination
        }
    }

    console.log("aftHldUlds = ", aftHldUlds)
    // console.log(remainingBagsF, remainingBagsC, remainingBagsY)
    console.log("fwdHldUlds = ", fwdHldUlds)
    console.log(remainingBagsF.toFixed(), remainingBagsC.toFixed(), remainingBagsY.toFixed())

    return {
        aftHldUlds,
        fwdHldUlds,
        remainingBagsF,
        remainingBagsC,
        remainingBagsY
    }
}

async function assignCargoWeights2Holds(fwdHldUlds:string[], aftHldUlds:string[], blkHldUlds:string[], fwd_hold:string, aft_hold:string, blk_hold:string) {

    // FWD HOLD
    var ttlWeightFwdHld = parseInt(fwd_hold)
    var ttlBagWeightFwd = 0
    var availWeightCargoFwd = 0

    for (let index = 0; index < fwdHldUlds.length; index++) {
        const element = fwdHldUlds[index];
        
        if (element.includes("BY") || element.includes("BC") || element.includes("BF")) {

            let uldDetails = element!.split("/")

            ttlBagWeightFwd = ttlBagWeightFwd + parseInt(uldDetails[3])
        }
    }

    availWeightCargoFwd = ttlWeightFwdHld-ttlBagWeightFwd
    console.log("Available weight for Cargo in FWD Hold = ", availWeightCargoFwd)

    // AFT HOLD
    var ttlWeightAftHld = parseInt(aft_hold)
    var ttlBagWeightAft = 0
    var availWeightCargoAft = 0

    for (let index = 0; index < aftHldUlds.length; index++) {
        const element = aftHldUlds[index];
        
        if (element.includes("BC") && element.includes("BF")) {
            let uldDetails = element!.split("/")
            
            ttlBagWeightAft = ttlBagWeightAft + parseInt(uldDetails[4])
        } else {
            let uldDetails = element!.split("/")

            ttlBagWeightAft = ttlBagWeightAft + parseInt(uldDetails[3])
        }
    }

    availWeightCargoAft = ttlWeightAftHld-ttlBagWeightAft
    console.log("Available weight for Cargo in AFT Hold = ", availWeightCargoAft)

    // BLK HOLD
    var ttlWeightBlkHld = parseInt(blk_hold)
    var ttlBagWeightBlk = 0
    var availWeightCargoBlk = 0

    for (let index = 0; index < blkHldUlds.length; index++) {
        const element = blkHldUlds[index];
        
        if (element.includes("BY") || element.includes("BC") || element.includes("BF")) {

            let uldDetails = element!.split("/")

            ttlBagWeightBlk = ttlBagWeightBlk + parseInt(uldDetails[2])
        }
    }

    availWeightCargoBlk = ttlWeightBlkHld-ttlBagWeightBlk
    console.log("Available weight for Cargo in BLK Hold = ", availWeightCargoBlk)

    return { availWeightCargoFwd, availWeightCargoAft, availWeightCargoBlk }
}

async function generateCargoUldFwd(
    fwdHld:string[],
    availWeightCargoFwd:number,
    fwdHldUlds:string[],
    destination:string,
) {

    let uldType

    const getRandomUldNumber = (min: number, max: number) => {
        return Math.random() * (max - min) + min
    }

    const getRandomCargoWeight = (min: number, max: number) => {
        return Math.random() * (max - min) + min
    }

    console.log("Available Weight for FWD Cargo = ", availWeightCargoFwd)
    for (let index = 0; index < fwdHldUlds.length; index++) {
        const element = fwdHldUlds[index];
        
        if (element.includes("/C/") || element.includes("/M/")) {

            let uldDetails = element!.split("/")

            availWeightCargoFwd = availWeightCargoFwd - parseInt(uldDetails[3])
            
            console.log("Available Weight for FWD Cargo after Cargo LD3 reduction = ", availWeightCargoFwd)
        }
    }

    console.log("Available Cargo Weight for PAL = ", availWeightCargoFwd)

    var countPalFwd = 0

    for (let index = 0; index < fwdHld.length; index++) {
        const element = fwdHld[index];
        
        if (element.includes("P")) {

            countPalFwd = countPalFwd + 1
            
            console.log("Available Pallet position in FWD hold = ", countPalFwd)
        }
    }

    var upperLimitUld = (availWeightCargoFwd/countPalFwd) + 250
    var lowerLimitUld = (availWeightCargoFwd/countPalFwd) - 250
    
    console.log("fwdHld: ", fwdHld)
    console.log("fwdHldUlds: ", fwdHldUlds)

    for (let index = fwdHld.length-1; index >= 0; index--) {
        const position = fwdHld[index];

        if (position.length === 3 && position.includes("P")) {
            console.log("position === 3 / ", position)
            uldType = "PMC"
        } else {
            continue
        }

        var uldWeight = 0

        if ( index === 0 ) {
            uldWeight = availWeightCargoFwd
        } else {
            uldWeight = getRandomCargoWeight(lowerLimitUld, upperLimitUld)
        }

        availWeightCargoFwd = availWeightCargoFwd - uldWeight

        let uldNumber:string

        console.log("uldWeight: ", uldWeight)
        console.log("available weight = ", availWeightCargoFwd)

        if (uldWeight == 0) {
            uldNumber = 
            position.slice(0,3) 
            + "/N" 
        } else {
            uldNumber = 
                position.slice(0,3) 
                + "/" 
                + uldType! 
                + (getRandomUldNumber(10000, 90000).toFixed()) 
                + "FF"
                + "/" 
                + "C" 
                + "/"
                + (uldWeight.toFixed())
                + "/"
                + destination
        }

        console.log("uldNumber: ", uldNumber)

        fwdHldUlds.push(uldNumber)
    }

    return { fwdHldUlds }
}

async function generateCargoUldAft(
    aftHld:string[],
    availWeightCargoAft:number,
    aftHldUlds:string[],
    destination:string,
) {
    function findLastIndexOfP(arr: string[]): number | undefined {
        const lastPItem = arr.findLast((item) => item.includes('P'));
        return lastPItem ? arr.lastIndexOf(lastPItem) : undefined;
    }
    
    let uldType

    const getRandomUldNumber = (min: number, max: number) => {
        return Math.random() * (max - min) + min
    }

    const getRandomCargoWeight = (min: number, max: number) => {
        return Math.random() * (max - min) + min
    }

    console.log("Available Weight for AFT Cargo = ", availWeightCargoAft)
    for (let index = 0; index < aftHldUlds.length; index++) {
        const element = aftHldUlds[index];
        
        if (element.includes("/C/") || element.includes("/M/")) {

            let uldDetails = element!.split("/")

            availWeightCargoAft = availWeightCargoAft - parseInt(uldDetails[3])
            
            console.log("Available Weight for AFT Cargo after Cargo LD3 reduction = ", availWeightCargoAft)
        }
    }

    console.log("Available Cargo Weight for PAL = ", availWeightCargoAft)

    var countPalFwd = 0

    for (let index = 0; index < aftHld.length; index++) {
        const element = aftHld[index];
        
        if (element.includes("P")) {

            countPalFwd = countPalFwd + 1
            
            console.log("Available Pallet position in AFT hold = ", countPalFwd)
        }
    }

    var upperLimitUld = (availWeightCargoAft/countPalFwd) + 250
    var lowerLimitUld = (availWeightCargoAft/countPalFwd) - 250
    
    console.log("aftHld: ", aftHld)
    console.log("aftHldUlds: ", aftHldUlds)

    const lastPIndex = findLastIndexOfP(aftHld);
          
    console.log(lastPIndex);

    for (let index = 0; index < aftHld.length; index++) {
        const position = aftHld[index];

        if (position.length === 3 && position.includes("P")) {
            console.log("position === 3 / ", position)
            uldType = "PMC"
        } else if (position.length === 8) {
            if (position.includes("PMC")) {
                console.log("PMC")
                uldType = "PMC"
            }

            if (position.includes("PAG")) {
                console.log("PAG")
                uldType = "PAG"
            }
        } else {
            continue
        }

        var uldWeight = 0

        if ( index === lastPIndex ) {
            uldWeight = availWeightCargoAft
        } else {
            uldWeight = getRandomCargoWeight(lowerLimitUld, upperLimitUld)
        }

        availWeightCargoAft = availWeightCargoAft - uldWeight

        let uldNumber:string

        console.log("uldWeight: ", uldWeight)
        console.log("available weight = ", availWeightCargoAft)

        if (uldWeight == 0) {
            uldNumber = 
            position.slice(0,3) 
            + "/N" 
        } else {
            uldNumber = 
                position.slice(0,3) 
                + "/" 
                + uldType! 
                + (getRandomUldNumber(10000, 90000).toFixed()) 
                + "FF"
                + "/" 
                + "C" 
                + "/"
                + (uldWeight.toFixed())
                + "/"
                + destination
        }

        console.log("uldNumber: ", uldNumber)

        aftHldUlds.push(uldNumber)
    }

    return { aftHldUlds }
}

async function generateCargoUldBlk(availWeightCargoBlk:number, blkHldUlds:string[], destination:string) {
    
    const getRandomCargoWeight = (min: number, max: number) => {
        return Math.random() * (max - min) + min
    }

    var mailWeightBlk = getRandomCargoWeight(0, availWeightCargoBlk)
    var cargoWeightBlk = availWeightCargoBlk - mailWeightBlk
    availWeightCargoBlk = availWeightCargoBlk - (mailWeightBlk + cargoWeightBlk)
    
    blkHldUlds.push("5/M/" + mailWeightBlk.toFixed() + "/" + destination + "/R")
    blkHldUlds.push("5/C/" + cargoWeightBlk.toFixed() + "/" + destination + "/R")

    return { blkHldUlds }
}