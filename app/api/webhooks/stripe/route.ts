/* eslint-disable camelcase */
import { createTransaction } from "@/lib/actions/transaction.action";
import { NextResponse } from "next/server";
//import stripe from "stripe";
import User from '@/lib/database/models/user.model';
import { headers } from "next/headers";

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

//const stripe = new stripe(process.env.STRIPE_SECRET_KEY!)
//const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  const body = await request.text();

  //const sig = request.headers.get("stripe-signature") as string;
  const sig = headers().get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  let data;
  let eventType;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    return NextResponse.json({ message: "Webhook error", error: err });
  }

  // Get the ID and type
  data = event.data;
  eventType = event.type;

  try {
    switch (eventType) {
        case 'checkout.session.completed': {
            let user

            const session = await stripe.checkout.sessions.retrieve(
                data.object.id,
                {
                    expand: ['line_items']
                } 
            )

            const customerId = session?.customer
            const customer = await stripe.customers.retrieve(customerId)
            const priceId = session?.line_items?.data[0]?.price.id

            if (customer.email) {
                user = await User.findOne({ email: customer.email })

                if (!user) {
                    user = await User.create({
                        email: customer.email,
                        name: customer.name,
                        stripeCustomerId: customerId,
                    })

                    await user.save()
                }
            } else {
                console.error('No user found')
                throw new Error('No user found')
            }

            user.priceId = priceId
            user.hasAccess = true

            break;
        }

        case 'customer.subscription.deleted' : {
            const subscription = await stripe.subscriptions.retrieve(
                data.id
            )

            const user = await User.findOne({
                customerId: subscription.customer
            })

            user.hasAccess = false
            await user.save()

            break;
        }

        default:
            break;
    }
  } catch (error) {
    
  }

//   // CREATE
//   if (eventType === "checkout.session.completed") {
//     const { id, amount_total, metadata } = event.data.object;

//     const transaction = {
//       stripeId: id,
//       amount: amount_total ? amount_total / 100 : 0,
//       plan: metadata?.plan || "",
//       //credits: Number(metadata?.credits) || 0,
//       mode: "subscription",
//       buyerId: metadata?.buyerId || "",
//       createdAt: new Date(),
//     };

//     const newTransaction = await createTransaction(transaction);
    
//     return NextResponse.json({ message: "OK", transaction: newTransaction });
//   }

//   return new Response("", { status: 200 });
}