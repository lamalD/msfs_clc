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
}

// ======= FLIGHT PARAMS
declare type CreateFlightParams = {
    origin: string
    destination: string
    departureDate: string
    departureTime: string
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