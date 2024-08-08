'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useStore } from '@/lib/database/storeData'
import { redirect } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { AppleSpinner } from './shared/appeSpinner'
import { Fuel, FuelIcon } from 'lucide-react'

import { envelope_77W_ldw, envelope_77W_tow, envelope_77W_zfw } from '@/constants/envelopeindex'

import Edp_Loadsheet from './Edp_Loadsheet'
import { getUserCurrentFlight } from '@/lib/actions/user.actions'
import { formatDateAndTime } from '@/lib/actions/simbrief.action'
import { generateEDPloadsheet } from '@/lib/actions/loadsheet.actions'
import { allLoadedUlds, calculatePiecesAndWeights } from '@/lib/actions/loadplan.actions'
import { fuelIndex_77W } from '@/constants/fuelindex'

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
  limitation: string,
  underload: string,
  paxMale: string,
  paxFemale: string,
  paxChildren: string,
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

const Loadsheet = () => {
  const { userId } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { flightData } = useStore()
  const { userData } = useStore()
  
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

  const [simbriefUsername, setSimbriefUsername] = useState('')
  const [currentFlightId, setCurrentFlightId] = useState('')
  const [formattedStd, setFormattedStd] = useState<string>('')
  const [formattedDate, setFormattedDate] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const tof = Math.round(parseInt(flightData!.to_fuel)/1000)*1000
    
  console.log("tof: ", tof)

  const tofIndex = fuelIndex_77W.find((type) => type.fuelQuantity === tof)!.index

  const simbriefUsernameFetch = async () => {
    if (!simbriefUsername) {
       try {
 
         if (!userId) redirect("/sign-in");
 
         // setUserData(await getUserById(userId))
 
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
        const fd = await getUserCurrentFlight(currentFlightId)
        setFlight(fd)
      }
      fetchFlightData()
    }
  }, [currentFlightId])

  useEffect(() => {
    if (flight) {
      const formatAndSetStd = async () => {
        const { time } = await formatDateAndTime(flight.departureDate);
        setFormattedStd(`${time}Z`);
      };
      formatAndSetStd();

      const formatAndSetDate = async () => {
        const { date } = await formatDateAndTime(flight.departureDate);
        setFormattedDate(date)
      };
      formatAndSetDate();
    }
  }, [flight])
  
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
    simbriefUsernameFetch()
  })

  useEffect(() => {
    if(currentFlightId){ 
      uldData()
    }
  }, [currentFlightId])

  //DRAW ENVELOPE
  useEffect(() => {

    console.log("flightData LS: ", flightData)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;   

    const canvasWidth = window.innerWidth
    const canvasHeight = 1250 // Adjust as needed
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling factors
    const scaleX = canvas.width / (85 - 13.5) // 77W SPECIFIC !!
    const scaleY = canvas.height / (351534 - 160000) // 77W SPECIFIC !!

    console.log("scaleX: ", scaleX, " scaleY: ", scaleY)

    ctx.lineWidth = 3

    // Draw axes
    // ...
    const dataZFW = envelope_77W_zfw
    // Draw ZFW-envelope
    ctx.beginPath();
    for (let i = 0; i < dataZFW.length; i++) {
      const x = (dataZFW[i].x - 13.2) * scaleX; // for 77W SPECIFIC!!
      const y = canvas.height - (dataZFW[i].y - Math.min(...dataZFW.map(d => d.y))) * scaleY;
      ctx.lineTo(x, y);
      console.log(x,y)
    }
    ctx.stroke()

    const dataTOW = envelope_77W_tow
    // Draw TOW-envelope
    ctx.beginPath();
    for (let i = 0; i < dataTOW.length; i++) {
      const x = (dataTOW[i].x - 13.2) * scaleX; // for 77W SPECIFIC!!
      const y = canvas.height - (dataTOW[i].y - Math.min(...dataTOW.map(d => d.y))) * scaleY;
      ctx.lineTo(x, y);
    }
    ctx.stroke()

    const dataLDW = envelope_77W_ldw
    // Draw LDW-envelope
    ctx.beginPath();
    for (let i = 0; i < dataLDW.length; i++) {
      const x = (dataLDW[i].x - 13.2) * scaleX; // for 77W SPECIFIC!!
      const y = canvas.height - (dataLDW[i].y - Math.min(...dataLDW.map(d => d.y))) * scaleY;
      ctx.lineTo(x, y);
    }
    ctx.stroke()

    //DRAW ZFW MAC
    const zfw_x = (parseFloat(flightData!.zfwi)-13.2)*scaleX
    const zfw_y = canvas.height - (parseInt(flightData!.zfw)-160000)*scaleY
    const zfw_size = 15

    console.log(parseInt(flightData!.zfw)-160000, zfw_x, zfw_y)

    ctx.beginPath();
    ctx.moveTo(zfw_x - zfw_size, zfw_y);
    ctx.lineTo(zfw_x + zfw_size, zfw_y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(zfw_x, zfw_y - zfw_size);
    ctx.lineTo(zfw_x, zfw_y + zfw_size);
    ctx.stroke()

    // Draw the label
    ctx.font = '24px Arial'; // Adjust font as needed
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("ZFW", zfw_x, zfw_y + zfw_size + 15)

    //DRAW TOW MAC
    const tow_x = (parseFloat(flightData!.towi)-13.2)*scaleX
    const tow_y = canvas.height - (parseInt(flightData!.tow)-160000)*scaleY
    const tow_size = 15

    console.log(flightData!.towi, parseInt(flightData!.tow)-160000, tow_x, tow_y)

    ctx.beginPath();
    ctx.moveTo(tow_x - tow_size, tow_y);
    ctx.lineTo(tow_x + tow_size, tow_y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tow_x, tow_y - tow_size);
    ctx.lineTo(tow_x, tow_y + tow_size);
    ctx.stroke()

    // Draw the label
    ctx.font = '24px Arial'; // Adjust font as needed
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("TOW", tow_x, tow_y + tow_size + 15)
  })

  const createEDPls = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await generateEDPloadsheet()
      console.log(data)
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
    } finally {
      setLoading(false);
    }
  }
  
  let existingData = { males: 0, females: 0, child: 0 } 

  useEffect(() => {
    dividePax(ttlPax, existingData)
  
  })
  
  function dividePax(ttlPassengers: number, existingData: { males: number; females: number; child: number }): { males: number; females: number; child: number } {
    if (existingData.males === 0 && existingData.females === 0 && existingData.child === 0) {
        const maxChildren = Math.floor(ttlPassengers * 0.1)
        const child = Math.floor(Math.random() * (maxChildren + 1))
        const remainingPax = ttlPassengers - child
        const maleRatio = Math.random()
        const males = Math.floor(remainingPax * maleRatio)
        const females = remainingPax - males
        return { males, females, child }
    } else {
        return existingData
    }
  }

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      printRef.current.classList.remove('hidden'); // Show the element
      const printContent = printRef.current.outerHTML;
      const windowContent = window.open('', '_blank', 'width=800,height=600');
      
      if (windowContent) {

        windowContent.document.write(printContent);
        windowContent.document.title = 'Loadsheet'
        windowContent.document.close();
        windowContent.print();
        printRef.current.classList.add('hidden'); // Hide the element again
      }
    }
  }

  return (
    <div className='flex flex-col w-full px-2 py-1'>
      <div className='flex flex-col justify-center items-center w-full py-2'>
        <div className='flex flex-row justify-between items-center w-full pb-2'>
          <div className='grid grid-cols-6 mt-2 gap-x-2 w-full p-2 border-1 border rounded-md border-white-1'>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              Flight: {flightData ? flightData.flightNumber : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              From/To: {flightData ? flightData.origin+"/"+flightData.destination : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              STD: {flightData ? formattedStd.replace(":","") : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              Date: {flightData ? formattedDate : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center border-1 border-r border-white-1'>
              A/C Reg: {flightData ? flightData.registration : " "}
            </div>
            <div className=' text-white-1 p-1 text-md text-center'>
              A/C Type: {flightData ? flightData.aircraftType : " "}
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-row justify-between items-start w-full py-5 bg-orange-1 h-full'>
          <div className='px-5 mt-2 w-1/2 space-y-2'>
            <div className='flex flex-col items-center justify-start w-full text-sm'>
              <Card className='py-1 mb-2 w-full'>
                <CardContent>
                  <div className='flex flex-row justify-between items-center font-bold'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p>Dry Operating Weight</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? flightData.dow : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? flightData.doi : ""} I.U</p>
                    </div>
                  </div>
                  <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
                  <div className='flex flex-row justify-between items-center font-light'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p> + Total Traffic Load</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? ttlTrafficLoad.toFixed() : ""} { flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? (parseFloat(flightData.zfwi)-parseFloat(flightData.doi)).toFixed(2) : ""} I.U</p>
                    </div>
                  </div>
                  <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
                  <div className='flex flex-row justify-between items-center font-bold'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p>Zero Fuel Weight</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? (parseInt(flightData.dow) + ttlTrafficLoad).toFixed() : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? flightData.zfwi : ""} I.U</p>
                    </div>
                  </div>
                  <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
                  <div className='flex flex-row justify-between items-center font-light'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p> + Take Off Fuel</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? flightData.to_fuel : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{tofIndex.toFixed(2)} I.U</p>
                    </div>
                  </div>
                  <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
                  <div className='flex flex-row justify-between items-center font-bold'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p>Take Off Weight</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? (parseInt(flightData.to_fuel) + parseInt(flightData.dow) + ttlTrafficLoad).toFixed() : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? flightData.towi : ""} I.U</p>
                    </div>
                  </div>
                  <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
                  <div className='flex flex-row justify-between items-center font-light'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p> - Trip Fuel</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? flightData.trip_fuel : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'/>
                  </div>
                  <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
                  <div className='flex flex-row justify-between items-center font-bold'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p>Landing Weight</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? (parseInt(flightData.to_fuel) + parseInt(flightData.dow) + ttlTrafficLoad - parseInt(flightData.trip_fuel)).toFixed() : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'/>
                  </div>
                </CardContent>
              </Card>
              <Card className='w-full'>
                <CardHeader>
                  <CardTitle>Fuel Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-row justify-between items-center w-full'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p>Block Fuel</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? flightData.blockFuel : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-md bg-white-1 text-black-1 hover:bg-gray-1 hover:border-white-1 hover:text-white-1 ${loading ? 'relative' : ''} text-xs h-[20px] w-[25px] mx-2 mb-1`}
                        // onClick={}
                        // disabled={loading}
                      >
                        <FuelIcon className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                  <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
                  <div className='flex flex-row justify-between items-center w-full'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p> - Taxi Fuel</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? parseInt(flightData.blockFuel)-parseInt(flightData.to_fuel) : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3' />
                  </div>
                  <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
                  <div className='flex flex-row justify-between items-center w-full'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p>Take Off Fuel</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? flightData.to_fuel : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'/>
                  </div>
                  <div className='mb-2 bg-gray-1 h-0.5 rounded-lg'/>
                  <div className='flex flex-row justify-between items-center w-full'>
                    <div className='flex items-center justify-start w-2/3'>
                      <p>Trip Fuel</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      <p>{flightData ? flightData.trip_fuel : ""} {flightData?.units}</p>
                    </div>
                    <div className='flex items-center justify-end w-1/3'>
                      
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className='flex flex-row items-center justify-between space-x-4 mt-3'>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className={`rounded-lg bg-white-1 text-black-1 hover:bg-gray-1 ${loading ? 'relative' : ''} w-full`}
                      onClick={createEDPls}
                      disabled={loading}
                      >
                        {loading ? (
                              <AppleSpinner />
                              ) : (
                                  'View Loadsheet'
                              )
                          }
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='bg-white-1 rounded-lg p-4 w-[1000px] h-[500px] overflow-y-scroll'>
                    <DialogHeader>
                      <DialogTitle>Loadsheet</DialogTitle>
                    </DialogHeader>
                    <Edp_Loadsheet 
                      stdTime={formattedStd}
                      stdDate={formattedDate}
                      ttlCargoWeight={ttlCargoWeight.toFixed()}
                      ttlMailWeight={ttlMailWeight.toFixed()}
                      ttlBagWeight={ttlBagWeight.toFixed()}
                      ttlPax={ttlPax.toFixed()}
                      ttlPaxWeight={ttlPaxWeight.toFixed()}
                      ttlBagPcs={ttlBagPcs.toFixed()}
                      ttlTrafficLoad={ttlTrafficLoad.toFixed()}
                    />
                  </DialogContent>
                </Dialog>
                <Button className={`rounded-lg bg-white-1 text-black-1 hover:bg-orange-1 w-full`}
                  // onClick={}
                  // disabled={}
                  >
                  Send Loadsheet
                </Button>
                <Button className={`rounded-lg bg-white-1 text-black-1 hover:bg-orange-1 w-full`}
                  onClick={handlePrint}
                  // disabled={}
                  >
                  Print Loadsheet
                </Button>
              </div>
            </div>
          </div>
          <div className='px-5 mt-2 w-1/2'>
            <div className='flex flex-col items-center justify-start w-full'>
              <div className='w-full h-2/3 bg-white-1'>
                <canvas ref={canvasRef} key="myCanvas" className='bg-gray-1 pt-10 pb-0 px-5 w-full'/>
              </div>
              <div className='flex flex-row items-center justify-start w-full h-1/3 border-white-1 border rounded-md mt-5 px-2'>
                <div className='px-2 border-r border-1 border-white-1'>MAC ZFW: {flightData ? flightData.zfwmac : ""}%</div>
                <div className='px-2 border-r border-1 border-white-1'>MAC TOW: {flightData ? flightData.towmac : ""}%</div>
              </div>
            </div>
          </div>
      </div>
      <div ref={printRef} id='printable-loadsheet' className='hidden'>
        <Edp_Loadsheet 
          stdTime={formattedStd}
          stdDate={formattedDate}
          ttlCargoWeight={ttlCargoWeight.toFixed()}
          ttlMailWeight={ttlMailWeight.toFixed()}
          ttlBagWeight={ttlBagWeight.toFixed()}
          ttlPax={ttlPax.toFixed()}
          ttlPaxWeight={ttlPaxWeight.toFixed()}
          ttlBagPcs={ttlBagPcs.toFixed()}
          ttlTrafficLoad={ttlTrafficLoad.toFixed()}
        />
      </div>
    </div>
  )
}

export default Loadsheet