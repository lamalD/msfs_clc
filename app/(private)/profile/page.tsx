'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from 'zod'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { getUserById } from '@/lib/actions/user.actions'
import { getLocalData } from '@/lib/actions/localstorage.actions'

const simbriefSchema = z.object({
  simbriefUsername: z.string(),
})


const Profile = () => {

  const [simbriefUsername, setSimbriefUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { userId } = useAuth()

  const simbriefUsernameFetch = useCallback(async () => {
    try {
      if (!userId) redirect("/sign-in");

      // const user = await getUserById(userId);
      const user = getLocalData('usernameSimbrief');
      setSimbriefUsername(user as string || '')
      setIsLoading(false);
      console.log(user)
    } catch (error) {
      console.error('Error fetching simbrief username:', error);
      setIsLoading(false);
    }

  }, [userId])

  const initialValues = useMemo(() => ({ simbriefUsername }), [simbriefUsername]);

  // 1. Define your form.
  const form = useForm<z.infer<typeof simbriefSchema>>({
    resolver: zodResolver(simbriefSchema),
    defaultValues: initialValues,
  })
 
  // 2. Define a submit handler.
  function onSubmitSimbriefUsername(values: z.infer<typeof simbriefSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  useEffect(() => {

    simbriefUsernameFetch()

  }, [simbriefUsernameFetch])

  useEffect(() => {
    form.reset({ simbriefUsername });
  }, [simbriefUsername, form.reset, form]);

  return (
    <div className='flex flex-col bg-gray-1 w-full h-full'>   
      <h1 className='pt-5 pl-5 text-20 font-bold text-white-1'>Account Settings</h1>
      <div className='flex flex-col bg-orange-1 py-5 px-5 my-3 mx-2 border-black-1 border rounded-md'>
      <div>Simbrief</div>
      <div className='flex flex-row justify-between items-center mt-2'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitSimbriefUsername)} className='flex flex-row'>
            <FormField
              control={form.control}
              name="simbriefUsername"
              render={({ field }) => (
                // <FormItem>
                  // <FormControl>
                    <Input placeholder="Simbrief Username" {...field} />
                  // </FormControl>
                // </FormItem>
              )}
            />
            <Button className='bg-gray-1 rounded-md mx-3' type="submit">{simbriefUsername ? 'Update' : 'Save'}</Button>
          </form>
        </Form>
      </div>
    </div>
      {/* <div className='flex flex-col bg-orange-1 py-5 px-5 my-3 mx-2 border-black-1 border rounded-md'>
        <div>Hoppie</div>
        <div>Hoppie username here</div>
      </div> */}
      <div className='flex flex-col bg-orange-1 py-5 px-5 my-3 mx-2 border-black-1 border rounded-md'>
        <div>General Settings</div>
        <div>General settings come here</div>
      </div>
      <div className='flex flex-col bg-orange-1 py-5 px-5 my-3 mx-2 border-black-1 border rounded-md'>
        <div>Profile Settings</div>
        <div>Insert Clerck details here</div>
      </div>
      <div className='flex flex-col bg-orange-1 py-5 px-5 my-3 mx-2 border-black-1 border rounded-md'>
        <div>Manage Subscription</div>
        <div>Link to Stripe subscription page</div>
      </div>
    </div>
  )
}

export default Profile