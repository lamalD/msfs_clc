import { SignedIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import Image from "next/image"
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { plans } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import Subscribe from "@/components/shared/Subscribe";
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