import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    console.log("Subscribe API called")

    // Step 1: Get session
    let session
    try {
      session = await getServerSession(authOptions)
      console.log("Session:", session?.user?.email || "no session")
    } catch (sessionError: any) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Auth error: " + sessionError.message }, { status: 500 })
    }

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in to subscribe" }, { status: 401 })
    }

    // Step 2: Find user
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      console.log("User found:", user?.id || "no user")
    } catch (dbError: any) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    // Step 3: Check existing subscription
    try {
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
    } catch (subError: any) {
      console.error("Subscription check error:", subError)
      // Continue anyway - not critical
    }

    const origin = req.headers.get("origin") || "https://learning-platform-indol.vercel.app"
    console.log("Origin:", origin)

    // Step 4: Create Stripe checkout session
    console.log("Creating Stripe checkout session...")
    let checkoutSession
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.CURRENCY,
              product_data: {
                name: "Live ECG Vault - Pro",
                description: "Full access to all 49 ECG rhythms, quizzes, and analysis tools",
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
        customer_email: user.email || session.user.email,
        metadata: {
          userId: user.id,
          productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
        },
        success_url: `${origin}/rhythms?subscription=success`,
        cancel_url: `${origin}/vault?subscription=canceled`,
      })
      console.log("Checkout session created:", checkoutSession.id)
    } catch (stripeError: any) {
      console.error("Stripe error:", stripeError)
      return NextResponse.json({ error: "Stripe error: " + stripeError.message }, { status: 500 })
    }

    // Step 5: Create/update subscription record
    try {
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
    } catch (upsertError: any) {
      console.error("Upsert error:", upsertError)
      // Don't fail - we can still redirect to Stripe
    }

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error: any) {
    console.error("Vault subscription error:", error)
    return NextResponse.json(
      { error: "Unexpected error: " + (error?.message || "Unknown") },
      { status: 500 }
    )
  }
}
