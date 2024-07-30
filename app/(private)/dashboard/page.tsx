'use client'

import { getLocalData, storeLocalData } from '@/lib/actions/localstorage.actions'
import { getUserById } from '@/lib/actions/user.actions'
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

const Dashboard = () => {

  const [simbriefUsername, setSimbriefUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { userId } = useAuth()

  const simbriefUsernameFetch = useCallback(async () => {
    try {
      if (!userId) redirect("/sign-in")

      const user = await getUserById(userId)
      
      setSimbriefUsername(user.usernameSimbrief || '')
      
      storeLocalData("usernameSimbrief", user.usernameSimbrief)
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching simbrief username:', error)
      setIsLoading(false);
    }

  }, [userId])

  useEffect(() => {

    simbriefUsernameFetch()

  }, [simbriefUsernameFetch])

  useEffect(() => {
    if (simbriefUsername) {
      storeLocalData("usernameSimbrief", simbriefUsername);
    }
  }, [simbriefUsername])

  // useEffect(() => {
  //   simbriefUsernameFetch();
  // }, [simbriefUsernameFetch]);

  // useEffect(() => {
  //   if (simbriefUsername) {
  //     storeLocalData("usernameSimbrief", simbriefUsername);
  //   }
  // }, [simbriefUsername]);


  return (
    <div>   
      <h1 className='text-20 font-bold text-white-1'>My Dashboard</h1>
    </div>
  )
}

export default Dashboard