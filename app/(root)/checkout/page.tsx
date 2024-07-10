import { SignedIn, useAuth } from "@clerk/nextjs";
import Image from "next/image"
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { plans } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import Subscribe from "@/components/shared/Subscribe";

const Checkout = async () => {
    const { userId } = useAuth()

    if (!userId) redirect("/sign-in")

    const user = await getUserById(userId)

    return (
        <>
            <section>
                <ul>
                    {plans.map((plan) => (
                        <li key={plan.name}>
                            <div className="flex-center flex-col gap-3">
                                <Image src={plan.icon} alt="check" width={50} height={50} />
                                <p className="p-20-semibold mt-2 text-orange-1">{plan.name}</p>
                                <p className="h1-semibold text-black-2">€{plan.price}</p>
                            </div>
                            {/* inclusions */}
                            <ul className="flex flex-col gap-5 py-9">
                                {plan.inclusions.map((inclusion) => (
                                    <li key={plan.name + inclusion.label} className="flex items-center gap-4">
                                        <Image 
                                            src={`/assets/icons/${inclusion.isIncluded ? "check.svg" : "cross.svg"}`}
                                            alt="check"
                                            width={24}
                                            height={24}
                                        />
                                        <p className="p-16-regular">{inclusion.label}</p>
                                    </li>
                                ))}
                            </ul>

                            <SignedIn>
                                <Subscribe
                                    plan={plan.name}
                                    buyerId={user._id}
                                />
                            </SignedIn>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    )
}

export default Checkout