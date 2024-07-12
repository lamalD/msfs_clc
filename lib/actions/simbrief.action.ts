import { revalidatePath } from "next/cache"

import User from "../database/models/user.model"
import { connectToDatabase } from "../database/mongoose"
import { handleError } from "../utils"

export default async function LoadSimbriefData() {
    try {
        const getSimbriefData = async () => {
            const res = await fetch("https://www.simbrief.com/api/xml.fetcher.php?username=Lamal_D&json=1")

            return res.json()

            // return JSON.parse(JSON.stringify(res))
        }

        const data = await getSimbriefData()

        console.log("Simbrief data: ", data.weights)
    } catch (error) {
        handleError(error)
    }
}