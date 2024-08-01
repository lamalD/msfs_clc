'use server'

import { revalidatePath } from "next/cache"

import User from "../database/models/user.model"
import { connectToDatabase } from "../database/mongoose"
import { handleError } from "../utils"
import Flight from "../database/models/flight.model"

// CREATE USER
export async function createUser(user: CreateUserParams) {
    try {
        await connectToDatabase()

        const newUser = await User.create(user)

        return JSON.parse(JSON.stringify(newUser))
    } catch (error) {
        handleError(error)
    }
}

// READ USER
export async function getUserById(userId: string) {
    try {
        await connectToDatabase()

        const user = await User.findOne({ clerkId: userId })

        if (!user) throw new Error("User not found")

        return JSON.parse(JSON.stringify(user))
    } catch (error) {
        handleError(error)
    }
}

// UPDATE USER
export async function updateUser(clerkId: string, user: UpdateUserParams) {
    try {
        await connectToDatabase()

        const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true })

        if (!updatedUser) throw new Error("User update failed")

        return JSON.parse(JSON.stringify(updatedUser))
    } catch (error) {
        handleError(error)
    }
}

// GET USER'S SIMBRIEFUSERNAME FROM DB
export async function checkSimbriefUsername() {
    
    try {
        
        await connectToDatabase()
    } catch (error) {
        handleError(error)
    }
}

// GET USER'S CURRENT FLIGHT ID
export async function getUserCurrentFlightId(usernameSimbrief: string) {

    try {
        await connectToDatabase()

        // console.log("username get: ", usernameSimbrief)

        const user = await User.findOne({ usernameSimbrief: usernameSimbrief })

        // if (!user) throw new Error("User not found")

        if (!user.currentFlightId) return("No currentFlightId found")

        return JSON.parse(JSON.stringify(user.currentFlightId))

    } catch (error) {
        handleError(error)
    }
}

// GET USER'S CURRENT FLIGHT BASED ON CURRENTFLIGHTID
export async function getUserCurrentFlight(currentFlightId: string) {

    try {
        
        await connectToDatabase()

        const currentFlight = await Flight.findOne({_id: currentFlightId})

        if (!currentFlight) throw new Error("No flight found!")

        return JSON.parse(JSON.stringify(currentFlight))
        // return currentFlight

    } catch (error) {
        handleError(error)
    }
}

// UPDATE USER WITH SIMBRIEF FLIGHTDATA
export async function updateUserWithFlightData(usernameSimbrief:string, currentFlightId: string) {
    try {
        await connectToDatabase()

        console.log("usernameSimbrief updateData: ", usernameSimbrief)

        const user = await User.findOne({ usernameSimbrief })
        
        if (!user) throw new Error("User not found")

        const updatedUser = await User.findOneAndUpdate({usernameSimbrief}, { currentFlightId: currentFlightId}, {new: true})

        return JSON.parse(JSON.stringify(updatedUser))

    } catch (error) {
        handleError(error)
    }
}

// DELETE USER
export async function deleteUser(clerkId: string) {
    try {
        await connectToDatabase()

        const userToDelete = await User.findOne({ clerkId })

        if (!userToDelete) throw new Error("User not found")

        const deletedUser = await User.findByIdAndDelete(userToDelete._id)
        revalidatePath("/")

        return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null
    }
    catch (error) {
        handleError(error)
    }
}

// SUBSCRIBE
export async function updatePlan(userId: string) {
    try {
        await connectToDatabase()

        const updateUserSubscription = await User.findOneAndUpdate(
            { _id: userId },
            { planId: 1},
        )

        if (!updateUserSubscription) throw new Error("User subscription update failed")

        return JSON.parse(JSON.stringify(updateUserSubscription))
    } catch (error) {
        handleError(error)
    }
}