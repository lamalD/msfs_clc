'use client'

import React, { useEffect, useState } from 'react'

import { useStore } from '@/lib/database/storeData'
import { useAuth } from '@clerk/nextjs'

import { Button } from './ui/button'
import { AppleSpinner } from './shared/appeSpinner'

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

interface UserData {
  usernameSimbrief: string
  currentFlightId: string
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

const InitFlight = () => {

    const { flightData, isLoading, fetchFlightData } = useStore()
    const { userData, fetchUserData } = useStore()
    const [loading, setLoading] = useState(false)
    const [simbriefUsername, setSimbriefUsername] = useState('')
    const [currentFlightId, setCurrentFlightId] = useState('')
    const [error, setError] = useState<string | null>(null)
    const { userId } = useAuth()

  useEffect(() => {

    if (userId) {
      fetchUserData(userId)
        .then(data => {
          setSimbriefUsername(data.usernameSimbrief);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    }

  }, [userId, fetchUserData])

  const handleImport = async () => {
    setLoading(true)
    setError(null)

      console.log("sbUn: ", simbriefUsername)
      if (simbriefUsername) {
        try {
          
          fetchFlightData(simbriefUsername)
        } catch (error: unknown) {
          console.error('Error fetching data:', error);
          setError(error instanceof Error ? error.message : 'An unexpected error occurred');
          // setSimbriefData(null);
        } finally {
          setLoading(false);
        }
      } else {
    }
  }

  return (
    <div className='flex flex-col w-full px-4 py-4'>
        <div className='my-4'>
            <Button
                className={`rounded-lg bg-white-1 text-black-1 hover:bg-orange-1 ${loading ? 'relative' : ''}`}
                onClick={handleImport}
                disabled={isLoading}
                >
                    {isLoading ? (
                        <AppleSpinner />
                        ) : (
                            'Import from Simbrief'
                        )
                    }
            </Button>
        </div>
        <div className='flex border border-white-1 rounded-lg py-2 bg-white-5'>
          <div className='grid grid-cols-4 mx-2 gap-x-2 w-full p-4'>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Flight Number</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Departure Date</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Departure Time</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Aircraft Type</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.flightNumber : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? formatDateAndTime(flightData.departureDate).date : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? formatDateAndTime(flightData.departureDate).time : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.aircraftType : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Departure</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Arrival</div>
            <div></div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Aircraft Registration</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.origin : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.destination : ''}</div>
            <div></div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.registration : ''}</div>
          </div>
        </div>
        <div className='flex border border-white-1 rounded-lg py-2 bg-white-5 mt-4'>
          <div className='grid grid-cols-4 mx-2 gap-x-2 w-full p-4'>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Empty Weight</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Estimated ZFW</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Estimated TOW</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Estimated LDW</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.dow + " " + flightData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.zfw + " " + flightData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.tow + " " + flightData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.ldw + " " + flightData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Block Fuel</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Fuel Burn</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Payload</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Pax Count</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.ramp_fuel + " " + flightData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.trip_fuel + " " + flightData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.pld + " " + flightData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{flightData ? flightData.paxCount : ''}</div>
          </div>
        </div>
    </div>
  )
}

export default InitFlight