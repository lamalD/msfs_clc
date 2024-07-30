'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'

import { LoadSimbriefData } from '@/lib/actions/simbrief.action'
import { AppleSpinner } from './shared/appeSpinner'
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { getUserById } from '@/lib/actions/user.actions'
import { getLocalData } from '@/lib/actions/localstorage.actions'

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

    const [loading, setLoading] = useState(false)
    const [simbriefUsername, setSimbriefUsername] = useState('');
    const [simbriefData, setSimbriefData] = useState<SimbriefData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { userId } = useAuth()

    const simbriefUsernameFetch = useCallback(async () => {
      try {

        if (!userId) redirect("/sign-in");

        setSimbriefUsername(getLocalData('usernameSimbrief') || '');
        
      } catch (error) {
        console.error('Error fetching simbrief username:', error);
      }
  
    }, [userId])

    const handleImport = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const data = await LoadSimbriefData({ usernameSimbrief: simbriefUsername });
        setSimbriefData(data!);
      } catch (error: unknown) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setSimbriefData(null);
      } finally {
        setLoading(false);
      }
    }

    const loadImport = useCallback(async () => {
      
      try {
        if (simbriefUsername) {

          const data = await LoadSimbriefData({ usernameSimbrief: simbriefUsername });
          setSimbriefData(data!)
          console.log("simbriefData: ", data!)
        }
      } catch (error: unknown) {
        console.error('Error fetching data:', error)
        if (error instanceof Error) {
          if (error.message === "Aircraft currently not supported!") {
            // Handle unsupported aircraft case
            console.log('Aircraft currently not supported')
            // You can display an error message to the user here
            setSimbriefData(null); // Set simbriefData to null for unsupported aircraft
          } else {
            // Handle other errors
            console.log('Unexpected error:', error.message)
          }
        }
      } finally {
        // setLoading(false)
      }
  }, [simbriefUsername])

  useEffect(() => {

    simbriefUsernameFetch()

  }, [simbriefUsernameFetch])
  
    useEffect(() => {
      
      loadImport();
    }, [loadImport])
    
    useEffect(() => {
        // Handle actions based on simbriefData changes
        console.log('simbriefData updated: ', simbriefData);
        // Populate your UI elements with simbriefData here

        if (simbriefData) {

            const { date, time } = formatDateAndTime(simbriefData.departureDate)
            console.log(date)
            console.log(time)

            simbriefData.departureDate = date
            simbriefData.departureTime = time
        }
    }, [simbriefData])

  return (
    <div className='flex flex-col w-full px-4 py-4'>
        <div className='my-4'>
            <Button
                className={`rounded-lg bg-white-1 text-black-1 hover:bg-orange-1 ${loading ? 'relative' : ''}`}
                onClick={handleImport}
                disabled={loading}
                >
                    {loading ? (
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
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.flightNumber : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? formatDateAndTime(simbriefData.departureDate).date : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? formatDateAndTime(simbriefData.departureDate).time : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.aircraftType : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Departure</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Arrival</div>
            <div></div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Aircraft Registration</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.origin : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.destination : ''}</div>
            <div></div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.registration : ''}</div>
          </div>
        </div>
        <div className='flex border border-white-1 rounded-lg py-2 bg-white-5 mt-4'>
          <div className='grid grid-cols-4 mx-2 gap-x-2 w-full p-4'>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Empty Weight</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Estimated ZFW</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Estimated TOW</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Estimated LDW</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.dow + " " + simbriefData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.zfw + " " + simbriefData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.tow + " " + simbriefData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.ldw + " " + simbriefData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Block Fuel</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Fuel Burn</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Payload</div>
            <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Pax Count</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.ramp_fuel + " " + simbriefData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.trip_fuel + " " + simbriefData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.pld + " " + simbriefData.units : ''}</div>
            <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>{simbriefData ? simbriefData.paxCount : ''}</div>
          </div>
        </div>
    </div>
  )
}

export default InitFlight