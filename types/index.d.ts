/* eslint-disable no-unused-vars */

// ======= USER PARAMS
declare type CreateUserParams = {
    clerkId: string
    email: string
    userName: string
    firstName: string | null
    lastName: string | null
    photo: string
}

declare type UpdateUserParams = {
    firstName: string | null
    lastName: string | null
    userName: string
    photo: string
    simbriefUserId: string
    currentFlightId: string
}

// ======= FLIGHT PARAMS
declare type CreateFlightParams = {
    username: string
    origin: string
    destination: string
    departureDate: string
    departureTime: string
    aircraftType: string
    registration: string
    flightNumber: string
    blockFuel: number
    takeoffFuel: number
    tripfuel: number
    dow: number
    doi: number
    zfw: number
    zfwi: number
    tow: number
    towi: number
    ldw: number
}

// ======= TRANSACTION PARAMS
declare type CheckoutTransactionParams = {
    plan: string
    amount: number
    buyerId: string
}

declare type CreateTransactionParams = {
    stripeId: string
    amount: number
    plan: string
    buyerId: string
    createdAt: Date
}