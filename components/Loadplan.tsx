'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'

import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { uldPositions_77W } from '@/constants/loadconfigindex';
import { getUserById, getUserCurrentFlight } from '@/lib/actions/user.actions';
import { allLoadedUlds, calculatePiecesAndWeights } from '@/lib/actions/loadplan.actions';
import { DataTable } from '@/app/(private)/flight/data-table';
import { columns } from '@/app/(private)/flight/columns';
import { handleError } from '@/lib/utils';

interface UserData {
  usernameSimbrief: string
  currentFlightId: string
}

interface SimbriefData {
  _id: string,
  simbriefId: string,
  usernameSimbrief: string,
  origin: string,
  destination: string,
  departureDate: string,
  departureTime: string,
  aircraftType: string,
  registration: string,
  flightNumber: string,
  blockFuel: string,
  takeoffFuel: string,
  tripfuel: string,
  dow: string,
  doi: string,
  zfw: string,
  zfwi: string,
  tow: string,
  towi: string,
  ldw: string,
  pld: string,
  paxCount: string,
  pax_weight: string,
  paxCount_F: string,
  paxCount_C: string,
  paxCount_Y: string,
  bagCount: string,
  bag_weight: string,
  cargo: string,
  ramp_fuel: string,
  to_fuel: string,
  trip_fuel: string,
  units: string,
  __v: 0,
  aft_hold_uld: string,
  blk_hold_uld: string,
  fwd_hold_uld: string,
  towmac: string,
  zfwmac: string,
  aft_hold: string,
  blk_hold: string,
  fwd_hold: string,
}

interface ULD {
  id: string
  width: number
  length: number
  startX: number
  startY: number
  category: string
  weight: string
  pieces: string
  destination: string
}

interface UldData {
  position: string
  uldNumber: string | null
  category: string
  weight: string
  pieces: string | null
  destination: string
}

function formatDateAndTime(isoString: string): { date: string; time: string } {
  const date = new Date(isoString);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour12: false, // Force 24-hour format
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  };

  const formattedDate = date.toLocaleDateString('en-GB', dateOptions).replace(',', '')
  const formattedTime = date.toLocaleTimeString('en-GB', timeOptions)

  return { date: formattedDate, time: formattedTime }
}

const Loadplan = () => {

  // const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  
  const [simbriefUsername, setSimbriefUsername] = useState('');
  const [currentFlightId, setCurrentFlightId] = useState('');
  const [flight, setFlight] = useState<SimbriefData | null>(null)

  const [uldLoadData, setUldLoadData] = useState<string[]>([])
  const [blkLoadData, setBlkLoadData] = useState<string[]>([])
  const [allUldData, setAllUldData] = useState<UldData[]>([])

  const [ttlPax, setTtlPax] = useState(0)
  const [ttlPaxWeight, setTtlPaxWeight] = useState(0)
  const [ttlBagWeight, setTtlBagWeight] = useState(0)
  const [ttlBagPcs, setTtlBagPcs] = useState(0)
  const [ttlCargoWeight, setTtlCargoWeight] = useState(0)
  const [ttlMailWeight, setTtlMailWeight] = useState(0)
  const [ttlTrafficLoad, setTtlTrafficLoad] = useState(0)

  // const [error, setError] = useState<string | null>(null)
  const { userId } = useAuth()

  const simbriefUsernameFetch = async () => {
   if (!simbriefUsername) {
      try {

        if (!userId) redirect("/sign-in");

        setUserData(await getUserById(userId))

        if (userData) {
          setSimbriefUsername(userData.usernameSimbrief);
          setCurrentFlightId(userData.currentFlightId)

        }
      } catch (error) {
        console.error('Error fetching simbrief username:', error);
      }
    }
    console.log(simbriefUsername, currentFlightId)
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const uldData = useCallback(async () => {

    if (currentFlightId) {
  
      const uldsData = await allLoadedUlds(currentFlightId)

      const fwd_array = uldsData!.fwd_hold.split(",")
      const aft_array = uldsData!.aft_hold.split(",")
      const blk_array = uldsData!.blk_hold.split(",")

      setUldLoadData(fwd_array.concat(aft_array))
      setBlkLoadData(blk_array)

      const sortUld = (a: string, b: string) => {
        const aPosition = a.split('/')[0];
        const bPosition = b.split('/')[0];
        return parseInt(aPosition.replace(/\D/g, ''), 10) - parseInt(bPosition.replace(/\D/g, ''), 10);
      }

      fwd_array.sort(sortUld)
      aft_array.sort(sortUld)
      blk_array.sort(sortUld)

      const dataString = fwd_array.concat(aft_array, blk_array).join(',')

      const processData = (dataString: string): UldData[] => {
        const dataArray = dataString.split(',');
      
        const parseItem = (item: string): UldData => {
          const parts = item.split('/');
      
          if (parts.length !== 5 && parts.length !== 6) {
            throw new Error('Invalid data format');
          }
          
          const isBulk = parts[parts.length - 1] === 'R'
      
          const position = parts[0]

          const uldNumber = isBulk ? null : parts[1]
          const category = isBulk ? parts[1] : parts[2]
          const weight = isBulk ? parts[2] : parts[3]
          const pieces = isBulk && parts[4] !== 'R' ? parts[3] : (category === 'BY' || category === 'BC' || category === 'BF') ? parts[4] : null
          const destination = isBulk ? parts[parts.length-2] : parts[parts.length-1]
          return { position, uldNumber, category, weight, pieces, destination }
        };
      
        const formattedData = dataArray.map(parseItem);
      
        return formattedData;
      }
      
      setAllUldData(processData(dataString))
    }
  }, [currentFlightId])

  useEffect(() => {
    if (currentFlightId) {
      const fetchFlightData = async () => {
        const fd = await getUserCurrentFlight(currentFlightId);
        setFlight(fd);
      }
      fetchFlightData()
    }
  }, [currentFlightId])
  
  useEffect(() => {
    if (flight) {
      const calculateAndUpdate = async () => {
        const pcsNweights = await calculatePiecesAndWeights(flight, allUldData)
        setTtlPax(pcsNweights.totalPaxCount)
        setTtlPaxWeight(pcsNweights.totalPaxWeight)
        setTtlBagWeight(pcsNweights.totalBagWeight);
        setTtlBagPcs(pcsNweights.totalBagPcs);
        setTtlCargoWeight(pcsNweights.totalCargoWeight);
        setTtlMailWeight(pcsNweights.totalMailWeight);

        setTtlTrafficLoad(pcsNweights.totalPaxWeight + pcsNweights.totalBagWeight + pcsNweights.totalCargoWeight + pcsNweights.totalMailWeight)
      };
      calculateAndUpdate();
    }
  }, [flight, allUldData]);

  useEffect(() => {

    const weightsNpieces = async () => {
      if (flight && allUldData) {
        try {  
          const pNw = await calculatePiecesAndWeights(flight, allUldData)
          
        } catch (error) {
          handleError(error)
        }
      }
    }

    weightsNpieces()
  }, [flight, allUldData])

  useEffect(() => {
    simbriefUsernameFetch()
  })

  useEffect(() => {
    if(currentFlightId){ 
      uldData()
    }
  }, [currentFlightId])

  useEffect(() => {
    
    simbriefUsernameFetch()

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const canvasWidth = window.innerWidth
    const canvasHeight = 200 // Adjust as needed
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const aircraftLength = 1600 // Example aircraft length
    const scaleFactor = canvasWidth / aircraftLength

    let uldsToDraw: ULD[] = []
    let bulkToDraw: ULD[] = []

    const parseULDData = (dataString: string): ULD | null => {


      let [position] = dataString.split('/')
      let category:string
      let weight:string
      let uldType:string
      let uldNumber:string
      let pieces:string | null = null
      let destination: string

      if (position.length == 3 || position.length == 2) {
        [, , category] = dataString.split('/')
      } else {
        [, category] = dataString.split('/')
      }

      console.log("category: ", category)

      switch (category) {
        case "C":
          if (position.length == 1) {
            [position, category, weight, destination] = dataString.split('/')
            console.log("pieces: ", pieces, " destination: ", destination)  
          } else {
            [position, uldNumber, category, weight, destination] = dataString.split('/')
            console.log("pieces: ", pieces, " destination: ", destination)
            uldType = uldNumber[1]
          }
          break;
        case "M":
          if (position.length == 1) {
            [position, category, weight, destination] = dataString.split('/')    
          } else {
            [position, uldNumber, category, weight, destination] = dataString.split('/')
          }
          break;
        default:
          [position, uldNumber, category, weight, pieces, destination] = dataString.split('/')
          uldType = uldNumber[1]
          break;
      }

      console.log(dataString)
      console.log("position: ", position)

      let uldData
      
      switch (position.length) {
        case 2:
          uldData = uldPositions_77W.find(uld => uld.id === `${position}`)
          break;
        case 3:
          if (position.includes("P")) {
            uldData = uldPositions_77W.find(uld => uld.id === `${position}(${uldType})`)
          } else {
            uldData = uldPositions_77W.find(uld => uld.id === `${position}`)
          }
          break;
        case 1:
            uldData = uldPositions_77W.find(uld => uld.id === `${position}`)
          break;
        default:
          break;
      }

      console.log("uldData: ", uldData)

      if (uldData) {
          return {
            id: uldData.id.replace(/\([A | M]\)/, ""),
            width: parseFloat(uldData.width),
            length: parseFloat(uldData.length),
            startX: parseFloat(uldData.start_position_x) * scaleFactor,
            startY: parseFloat(uldData.start_position_y) * scaleFactor,
            category: category,
            weight: weight,
            pieces: pieces ?? "",
            destination: destination,
          }
      }

      return null;
    }

    const parseBULKData = (dataString: string): ULD | null => {

      let [position, category] = dataString.split('/')
      let weight:string
      let uldType:string
      let uldNumber:string
      let pieces:string | null = null
      let destination:string

      switch (category) {
        case "C":
          [position, category, weight, destination] = dataString.split('/')    
          break;
        case "M":
            [position, category, weight, destination] = dataString.split('/')    
          break;
        default:
          [position, category, weight, pieces, destination] = dataString.split('/')
          break;
      }

      if (position.length == 1) {
        
        [position, category, weight, destination] = dataString.split('/')
      }

      console.log(dataString)
      console.log("position: ", position)

      let uldData
      
      switch (position.length) {
        case 2:
          uldData = uldPositions_77W.find(uld => uld.id === `${position}`)
          break;
        case 3:
          if (position.includes("P")) {
            uldData = uldPositions_77W.find(uld => uld.id === `${position}(${uldType})`)
          } else {
            uldData = uldPositions_77W.find(uld => uld.id === `${position}`)
          }
          break;
        case 1:
            uldData = uldPositions_77W.find(uld => uld.id === `${position}`)
          break;
        default:
          break;
      }

      console.log("uldData: ", uldData)

      if (uldData) {
          return {
            id: uldData.id,
            width: parseFloat(uldData.width),
            length: parseFloat(uldData.length),
            startX: parseFloat(uldData.start_position_x) * scaleFactor,
            startY: parseFloat(uldData.start_position_y) * scaleFactor,
            category: category!,
            weight: weight!,
            pieces: pieces ?? "",
            destination: destination
          }
      }

      return null;
    }

    for (const data of uldLoadData) {
      const uld = parseULDData(data);
      
      if (uld) {
        uldsToDraw.push(uld);
      }
    }

    for (const data of blkLoadData) {
      const uld = parseBULKData(data);
  
      if (uld) {
        bulkToDraw.push(uld) 
      }
    }

    // const uldStyles = {
    //   AKE: { fillStyle: 'blue', strokeStyle: 'black' },
    //   PMC: { fillStyle: 'green', strokeStyle: 'black' },
    //   // ... other ULD types
    // };

    const drawULD = (uld: ULD) => {
      
      const style = { fillStyle: 'white', strokeStyle: 'red' };

      console.log("uld: ", uld)

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      const scaledWidth = uld.length * scaleFactor;
      const scaledLength = uld.width * scaleFactor;
      console.log(scaledLength, scaledWidth)

      ctx.strokeRect(uld.startX, uld.startY, scaledWidth, scaledLength)
      ctx.fillRect(uld.startX, uld.startY, scaledWidth, scaledLength);
      
      // Add ULD position
      ctx.font = '8px Arial'
      ctx.fillStyle = 'black'
      ctx.textAlign = 'left'
      ctx.fillText(uld.id, uld.startX + 3, uld.startY + 7)

      if (uld.id.length == 2 || uld.id.includes("L") || uld.id.includes("R")) {
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';

        const textYOffset = 25
        const lineHeight = 12

        ctx.fillText(uld.destination, uld.startX + scaledWidth / 2, uld.startY + scaledLength / 2 + lineHeight*(-0.25))
        ctx.fillText(`${uld.category}/${uld.weight}`, uld.startX + scaledWidth / 2, uld.startY + textYOffset + scaledLength / 2 - lineHeight);
      } else {

        ctx.font = '16px Arial';
        ctx.textAlign = 'center';

        const textYOffset = 25
        const lineHeight = 16

        ctx.fillText(uld.destination, uld.startX + scaledWidth / 2, uld.startY + scaledLength / 2 + lineHeight*(-1))

        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        // const textYOffset = 25
        // const lineHeight = 16

        // ctx.fillText(uld.destination, uld.startX + scaledWidth / 2, uld.startY + scaledLength / 2 + lineHeight)
        ctx.fillText(`${uld.category}/${uld.weight}`, uld.startX + scaledWidth / 2, uld.startY + textYOffset + scaledLength / 2 - lineHeight);  
      }
    };

    uldsToDraw.forEach(uld => {
      drawULD(uld);
    })

    const drawBULK = (blk: ULD) => {
      
      const style = { fillStyle: 'white', strokeStyle: 'red' };

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      const scaledWidth = blk.length * scaleFactor;
      const scaledLength = blk.width * scaleFactor;
      console.log(scaledLength, scaledWidth)

      ctx.strokeRect(blk.startX, blk.startY, scaledWidth, scaledLength)
      ctx.fillRect(blk.startX, blk.startY, scaledWidth, scaledLength);
      
      // Add ULD position
      ctx.font = '8px Arial'
      ctx.fillStyle = 'black'
      ctx.textAlign = 'left'
      ctx.fillText(blk.id, blk.startX + 3, blk.startY + 7)

      for (let index = 0; index < blkLoadData.length; index++) {
        const element = blkLoadData[index];
        
        const [position, category, weight] = element.split('/')

        ctx.font = '12px Arial'
        ctx.textAlign = 'right'

        const textYOffset = 5+(15*index)
        const textXOffset = 5
        const lineHeight = 25

        ctx.fillText(`${category}/${weight}/R`, blk.startX + textXOffset + scaledWidth / 2, blk.startY + textYOffset + scaledLength / 2 - lineHeight)
      }
    };

    bulkToDraw.forEach(uld => {
      drawBULK(uld);
    })
  })

  return (
    <div className='flex flex-col w-full px-2 py-2'>
      <div className='flex flex-col justify-center items-center w-full py-5'>
        <div className='flex flex-row justify-between items-center w-full pb-2'>
          <div className='grid grid-cols-6 mt-2 gap-x-2 w-full p-2 border-1 border rounded-md border-white-1'>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              Flight: {flight ? flight.flightNumber : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              From/To: {flight ? flight.origin+"/"+flight.destination : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              STD: {flight ? formatDateAndTime(flight.departureDate).time + "Z" : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              Date: {flight ? formatDateAndTime(flight.departureDate).date : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              A/C Reg: {flight ? flight.registration : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center'>
              A/C Type: {flight ? flight.aircraftType : " "}
            </div>
          </div>
        </div>
      </div>
      <div className='p-15 mb-3 bg-orange-1 h-1 rounded-lg'/>
      <div>
        <canvas ref={canvasRef} key="myCanvas" className='bg-gray-1 pt-10 pb-0 px-5 w-full'/>
      </div>
      <div className='flex flex-row justify-between items-start w-full py-5 bg-orange-1 h-[350px]'>
        <div className='px-5 mt-10 w-1/3'>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-row justify-between items-center'>
                <p>Passengers</p>
                <p>{ttlPax ? ttlPax.toFixed() : ""} / {ttlPaxWeight ? ttlPaxWeight.toFixed() : ""} {flight?.units}</p>
              </div>
              <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='flex flex-row justify-between items-center'>
                <p>Baggage</p>
                <p>{ttlBagPcs ? ttlBagPcs : ""} pcs / {ttlBagWeight ? ttlBagWeight.toFixed() : ""} {flight?.units}</p>
              </div>
              <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='flex flex-row justify-between items-center'>
                <p>Cargo</p>
                <p>{ttlCargoWeight ? ttlCargoWeight : ""} {flight?.units}</p>
              </div>
              <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='flex flex-row justify-between items-center'>
                <p>Mail</p>
                <p>{ttlMailWeight ? ttlMailWeight : ""} {flight?.units}</p>
              </div>
              <div className='mb-1 mt-1 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='flex flex-row justify-between items-center'>
                <p>Total Traffic Load</p>
                <p>{ttlTrafficLoad ? ttlTrafficLoad.toFixed() : ""} {flight?.units}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='px-5 w-2/3'>
          <h1 className='px-8'>ULD Overview</h1>
          <div className="container mx-auto py-5 overflow-y-auto">
            <DataTable columns={columns} data={allUldData} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loadplan