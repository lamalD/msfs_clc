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