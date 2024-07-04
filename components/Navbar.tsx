'use client'

import { topbarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

const Navbar = () => {

    const pathname = usePathname()
    const router = useRouter()

  return (
        <nav className='flex flex-row justify-between items-start border-none gap-4 bg-black pt-4 w-screen text-white-1;'>
          <div>
            <Link href='/' className='flex cursor-pointer items-center gap-1 pl-4 pb-10 max-lg:justify-center'>
                <Image src='/icons/logo.svg' alt='logo' width={23} height={27}/>
                <h1 className='text-24 font-extrabold text-white-1 max-lg:hidden'>MSFS CLC</h1>
            </Link>
          </div>
          <div className='flex flex-row gap-4'>
            {topbarLinks.map(({ route, label, imgURL }) => {
                const isActive = pathname === route || pathname.startsWith(`${route}/`)

                return <Link href={route} key={label} className={cn('flex gap-3 items-center px-4 py-4 max-lg:px-4 justify-center lg:justify-start', {'bg-nav-focus border-b-4 border-orange-1': isActive})}>
                    <Image src={imgURL} alt={label} width={24} height={24}/>
                    <p className='text-white-1'>{label}</p>
                </Link>
            })}
          </div>
          <div className='pr-4 pt-2'>
            <SignedOut>
              <SignInButton>
                <button className='text-white-1 bg-orange-1 rounded-xl'>Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </nav>
  )
}

export default Navbar