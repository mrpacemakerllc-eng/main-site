import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in to subscribe" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already subscribed
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
        },
      },
    })

    if (existingSubscription?.status === "active") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      )
    }

    const origin = req.headers.get("origin") || "http://localhost:3000"

    // Create Stripe checkout session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.CURRENCY,
            product_data: {
              name: "Live ECG Vault - Pro",
              description: "Full access to all 47 ECG rhythms, quizzes, and analysis tools",
            },
            unit_amount: STRIPE_CONFIG.ECG_VAULT_PRICE,
            recurring: {
              interval: "month",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          userId: user.id,
          productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
        },
      },
      customer_email: user.email,
      metadata: {
        userId: user.id,
        productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
      },
      success_url: `${origin}/rhythms?subscription=success`,
      cancel_url: `${origin}/vault?subscription=canceled`,
    })

    // Create or update subscription record as pending
    await prisma.subscription.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
        },
      },
      create: {
        userId: user.id,
        productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
        status: "inactive",
      },
      update: {
        status: "inactive",
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error("Vault subscription error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
