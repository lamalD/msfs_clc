// 'use server'

import { aircraft } from "@/constants/aircraftindex";

export function padStart(text:string, length:number) {
    return text.padStart(length, ' ');
  }

export function calculateTotalWeight(data:any) {
let totalWeight = 0;
for (const item of data) {
    const parts = item.split('/')
    const catIndex = parts[0].length == 1 ? 2 : 3
    const weight = parseInt(parts[catIndex], 10)
    totalWeight += weight
}
return totalWeight;
}

export function extractWeights(dataString:string) {
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

export function calcWeightPerCpt(flightData:any) {
    
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

    return { cpt1_uld, cpt2_uld, cpt3_uld, cpt4_uld}
}

export function formatCptWeights(ttlCpt1:string, ttlCpt2:string, ttlCpt3:string, ttlCpt4:string, ttlCpt5:string) {
    const weights = [
        { cpt: 1, weight: ttlCpt1 },
        { cpt: 2, weight: ttlCpt2 },
        { cpt: 3, weight: ttlCpt3 },
        { cpt: 4, weight: ttlCpt4 },
        { cpt: 5, weight: ttlCpt5 },
    ];

    const formattedWeights = weights
        .filter(w => w.weight !== '0')
        .map(w => `${w.cpt}/${w.weight}`);

    let output = '';
    let currentLine = '';

    formattedWeights.forEach(weight => {
        currentLine += weight + ' ';
    });

    output += currentLine.trim();

    return output;
}

export function formatString(inputString: string, maxLength = 31): string[] {
    const words = inputString.split(' ');
    const lines: string[] = [];
    let currentLine = '';
  
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxLength) {
        currentLine += word + ' ';
      } else {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      }
    }
  
    if (currentLine) {
      lines.push(currentLine.trim());
    }
  
    return lines;   
  
}