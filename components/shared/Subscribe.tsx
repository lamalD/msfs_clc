'use client'

import { loadStripe } from "@stripe/stripe-js"
import { useEffect } from "react"

import { useToast } from "../ui/use-toast"
import { checkoutSubscription } from "@/lib/actions/transaction.action"

import { Button } from "../ui/button"

const Subscribe = ({
    plan,
    buyerId,
}: {
    plan: string
    buyerId: string
}) => {

    const { toast } = useToast()

    useEffect(() => {
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    }, [])

    useEffect(() => {
        // Check to see if this is a redirect back from Checkout
        const query = new URLSearchParams(window.location.search)

        if (query.get("success")) {
            toast({
                title: "Subscription Confirmed!",
                description: "You are now subscribed to the plan.",
                duration: 5000,
                className: "success-toast"
            })
        }

        if (query.get("canceled")) {
            toast({
                title: "Subscription Canceled!",
                description: "",
                duration: 5000,
                className: "error-toast"
            })
        }
    }, [])

    const onCheckout = async () => {
        const transaction = {
            plan,
            buyerId,
        }

        await checkoutSubscription(transaction)
    }

    return (
        <form action={onCheckout} method="POST">
            <section>
                <Button
                    type="submit"
                    role="link"
                    className="w-full rounded-full bg-orange-1 bg-cover text-white-1"
                >
                    Subscribe
                </Button>
            </section>
        </form>
    )
}

export default Subscribe