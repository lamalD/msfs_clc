import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import Link from 'next/link'

const Flight = () => {
  return (
    <div className='flex flex-col w-full bg-black-2'>
      <Tabs defaultValue="initflight" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger className='rounded-t-xl mb-0' value="initflight">Init flight</TabsTrigger>
          <TabsTrigger value="loadplan">Load Distribution</TabsTrigger>
          <TabsTrigger value="loadsheet">Loadsheet</TabsTrigger>
          <TabsTrigger value="message">Mesages</TabsTrigger>
        </TabsList>
        <TabsContent value="initflight">Here the flight will be initialized</TabsContent>
        <TabsContent value="loadplan">Here details about loadplan can be found</TabsContent>
        <TabsContent value="loadsheet">Here details about the loadsheet can be found</TabsContent>
        <TabsContent value="messages">Here all messages can be found</TabsContent>
      </Tabs>
      <div>
        <h1 className='text-20 font-bold text-white-1'>My Flight</h1>
      </div>
    </div>
  )
}

export default Flight