import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const sig = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const courseId = session.metadata?.courseId

        if (!userId || !courseId) {
          console.error("Missing userId or courseId in session metadata")
          break
        }

        // Update payment status
        await prisma.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "completed",
            stripePaymentId: session.payment_intent as string,
          },
        })

        // Set expiration to 1 year from now
        const expiresAt = new Date()
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)

        // Create or update enrollment with payment confirmation
        await prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          create: {
            userId,
            courseId,
            hasPaid: true,
            expiresAt,
          },
          update: {
            hasPaid: true,
            expiresAt,
          },
        })

        console.log(`Payment completed for user ${userId}, course ${courseId}`)
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session

        // Update payment status to failed
        await prisma.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "failed",
          },
        })

        console.log(`Payment session expired: ${session.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
