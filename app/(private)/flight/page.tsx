import React from 'react'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import Link from 'next/link'

const Flight = () => {
  return (
    <div className='flex bg-white-1'>
      {/* <NavigationMenu className='flex px-4 justify-between bg-black-2'>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/docs" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Init flight
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/docs" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Loadplan
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/docs" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                LoadSheet
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/docs" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Messages
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu> */}
   
   <Tabs defaultValue="init" className="w-[400px]">
    <TabsList>
      <TabsTrigger value="initflight">Init flight</TabsTrigger>
      <TabsTrigger value="loadplan">Load Distribution</TabsTrigger>
      <TabsTrigger value="loadsheet">Loadsheet</TabsTrigger>
    </TabsList>
    <TabsContent value="initflight">Make changes to your account here.</TabsContent>
    <TabsContent value="loadplan">Change your password here.</TabsContent>
    <TabsContent value="loadsheet">Change your password here.</TabsContent>
  </Tabs>


      <h1 className='text-20 font-bold text-white-1'>My Flight</h1>
    </div>
  )
}

export default Flight