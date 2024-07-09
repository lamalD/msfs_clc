'use client'

import React from 'react'
import { Button } from './ui/button'

const InitFlight = () => {
  return (
    <div className='flex flex-col w-full px-4 py-4'>
        <div className='my-4    '>
            <Button className='rounded-lg bg-white-1 text-black-1 hover:bg-orange-1' onClick={() => {}}>Import from Simbrief</Button>
        </div>    
        <div className='flex border border-white-1 rounded-lg py-2 bg-white-5'>
            <div className='grid grid-cols-4 mx-2 gap-x-2 w-full p-4'>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Flight Number</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Departure Date</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Departure Time</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Aircraft Type</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col5</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col6</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col7</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col8</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Departure</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Arrival</div>
                <div></div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Aircraft Registration</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col5</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col6</div>
                <div></div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col8</div>
            </div>    
        </div>
        <div className='flex border border-white-1 rounded-lg py-2 bg-white-5 mt-4'>
            <div className='grid grid-cols-4 mx-2 gap-x-2 w-full p-4'>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Empty Weight`</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Estimated ZFW`</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Estimated TOW</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Estimated LDW</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col5</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col6</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col7</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col8</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Block Fuel`</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Fuel Burn</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Payload</div>
                <div className='bg-gray-1  text-white-1 p-1 text-xs text-center'>Pax Count</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col5</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col6</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col7</div>
                <div className='bg-gray-1  text-white-1 p-1 text-sm text-center'>Col8</div>
            </div>    
        </div>
    </div>
  )
}

export default InitFlight