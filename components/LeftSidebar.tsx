'use client'

import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

const LeftSidebar = () => {

    const pathname = usePathname()
    const router = useRouter()

  return (
    <section className='left_sidebar'>
        <nav className='flex flex-col gap-6'>
            <Link href='/' className='flex cursor-pointer items-center gap-1 pb-10 max-lg:justify-center'>
                <Image src='/icons/logo.svg' alt='logo' width={23} height={27}/>
                <h1 className='text-24 font-extrabold text-white max-lg:hidden'>MSFS CLC</h1>
            </Link>

            {sidebarLinks.map(({ route, label, imgURL }) => {
                const isActive = pathname === route || pathname.startsWith(`${route}/`)

                return <Link href={route} key={label} className={cn('flex gap-3 items-center py-4 max-lg:px-4 justify-center lg:justify-start', {'bg-nav-focus border-r-4 border-orange-1': isActive})}>
                    <Image src={imgURL} alt={label} width={24} height={24}/>
                    <p>{label}</p>
                </Link>
            })}
        </nav>
        <div className='p-2 bg-black-2 rounded-xl w-fit mb-3'>
            {/* <SignedOut>
              <SignInButton>
                <button className='text-white-1 bg-orange-1 rounded-xl p-2'>Sign In</button>
              </SignInButton>
            </SignedOut> */}
            <SignedIn>
              <UserButton showName />
            </SignedIn>
        </div>
    </section>
  )
}

export default LeftSidebar