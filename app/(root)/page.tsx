
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const Home = () => {

  const { userId } = auth()

  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className='flex flex-col gap-9'>
      <section className='flex flex-col gap-5'>
        <h1 className='text-20 font-bold text-white-1'>Home</h1>
      </section>
    </div>
  )
}

export default Home