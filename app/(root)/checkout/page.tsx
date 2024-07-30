
import { auth } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";

import { getUserById } from "@/lib/actions/user.actions";
import Pricing from "@/components/shared/Pricing";

const Checkout = async () => {
    const { userId } = auth()

    if (!userId) redirect("/sign-in")

    const user = await getUserById(userId)

    return (
        <>
            <main className="bg-black-2 h-full w-full">
                <Pricing />
            </main>
        </>
    )
}

export default Checkout