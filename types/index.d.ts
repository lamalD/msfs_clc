/* eslint-disable no-unused-vars */

// ======= USER PARAMS
declare type CreateUserParams = {
    clerkId: string
    email: string
    userName: string
    firstName: string
    lastName: string
    photo: string
}

declare type UpdateUserParams = {
    firstName: string
    lastName: string
    userName: string
    photo: string
}