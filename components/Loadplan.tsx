'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'

import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { uldPositions_77W } from '@/constants/loadconfigindex';
import { getUserById } from '@/lib/actions/user.actions';
import { allLoadedUlds } from '@/lib/actions/loadplan.actions';
import { DataTable } from '@/app/(private)/flight/data-table';
import { columns, lddUlds } from '@/app/(private)/flight/columns';

interface UserData {
  usernameSimbrief: string
  currentFlightId: string
}

interface ULD {
  id: string
  width: number
  length: number
  startX: number
  startY: number
  category: string
  weight: string
}

interface UldData {
  position: string
  uldNumber: string | null
  category: string
  weight: string
  pieces: string | null
}

const Loadplan = () => {

  // const [loading, setLoading] = useState(false)
  const [simbriefUsername, setSimbriefUsername] = useState('');
  const [currentFlightId, setCurrentFlightId] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null)
  const [uldLoadData, setUldLoadData] = useState<string[]>([])
  const [blkLoadData, setBlkLoadData] = useState<string[]>([])
  const [allUldData, setAllUldData] = useState<UldData[]>([])
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

  const uldData = async () => {

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
        const dataArray = dataString.split(',')
      
        const parseItem = (item: string): UldData => {
          const parts = item.split('/');
          if (parts.length === 5) {
            const [position, uldNumber, category, weight, pieces] = parts;
            return { position, uldNumber, category, weight, pieces }
          } else if (parts.length === 4) {
            if (parts[0].length === 1) {
              const [position, category, weight, pieces] = parts
              return { position, uldNumber: null, category, weight, pieces: null }
            } else {
              const [position, uldNumber, category, weight, pieces] = parts
              return { position, uldNumber, category, weight, pieces }
            }
          } else {
            throw new Error('Invalid data format')
          }
        };
      
        const formattedData = dataArray.map(parseItem);
        
        return formattedData;

      }
      
      setAllUldData(processData(dataString))
      
    }
  }
  
  useEffect(() => {
    simbriefUsernameFetch()
  })

  useEffect(() => {

    if (uldLoadData.length === 0) {
      uldData()
    }
  })

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

      if (position.length == 1) {
        
        [position, category, weight] = dataString.split('/')
      } else {
        [position, uldNumber, category, weight] = dataString.split('/')
        uldType = uldNumber[1]
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
          }
        // }
      }

      return null;
    }

    const parseBULKData = (dataString: string): ULD | null => {

      let [position] = dataString.split('/')
      // const [position, uldNumber, category, weight] = dataString.split('/')
      let category:string
      let weight:string
      let uldType:string
      let uldNumber:string

      if (position.length == 1) {
        
        [position, category, weight] = dataString.split('/')
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

        // ctx.fillText(uld.destination, uld.startX + scaledWidth / 2, uld.startY + scaledLength / 2 + lineHeight)
        ctx.fillText(`${uld.category}/${uld.weight}`, uld.startX + scaledWidth / 2, uld.startY + textYOffset + scaledLength / 2 - lineHeight);
      } else {
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        const textYOffset = 25
        const lineHeight = 16

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
        
        console.log("element: ", element)
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
    <div className='flex flex-col w-full px-4 py-4'>
      <div className='flex flex-col justify-center items-center w-full py-5'>
        <h1>Header</h1>
      </div>
      <div className='p-15 mb-3 mt-2 bg-orange-1 h-1 rounded-lg'/>
      <div>
        <canvas ref={canvasRef} key="myCanvas" className='bg-gray-1 pt-10 pb-0 px-5 w-full'/>
      </div>
      <div className='flex flex-row justify-between items-start w-full py-5 bg-orange-1 h-[350px]'>
        <div className='px-5 w-1/3'>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-row justify-between items-center'>
                <p>Pax Weight</p>
                <p>Card Content</p>
              </div>
              <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='flex flex-row justify-between items-center'>
                <p>Baggage Weight</p>
                <p>Card Content</p>
              </div>
              <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='flex flex-row justify-between items-center'>
                <p>Cargo Weight</p>
                <p>Card Content</p>
              </div>
              <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='flex flex-row justify-between items-center'>
                <p>Mail Weight</p>
                <p>Card Content</p>
              </div>
              <div className='mb-1 mt-1 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
              <div className='flex flex-row justify-between items-center'>
                <p>Total Traffic Load</p>
                <p>Card Content</p>
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