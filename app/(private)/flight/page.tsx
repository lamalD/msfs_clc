import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import Link from 'next/link'
import InitFlight from '@/components/InitFlight'
import Loadplan from '@/components/Loadplan'
import Loadsheet from '@/components/Loadsheet'
import Messages from '@/components/Messages'

const Flight = () => {
  return (
    <div className='flex flex-col w-full bg-black-2'>
      <Tabs defaultValue="initflight" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger className='rounded-t-xl mb-0' value="initflight">Init flight</TabsTrigger>
          <TabsTrigger value="loadplan">Load Distribution</TabsTrigger>
          <TabsTrigger value="loadsheet">Loadsheet</TabsTrigger>
          <TabsTrigger value="messages">Mesages</TabsTrigger>
        </TabsList>
        <TabsContent value="initflight">
          <InitFlight />
        </TabsContent>
        <TabsContent value="loadplan">
          <Loadplan />
        </TabsContent>
        <TabsContent value="loadsheet">
          <Loadsheet />
        </TabsContent>
        <TabsContent value="messages">
          <Messages />
        </TabsContent>
      </Tabs>
      {/* <div>
        <h1 className='text-20 font-bold text-white-1'>My Flight</h1>
      </div> */}
    </div>
  )
}

export default Flight