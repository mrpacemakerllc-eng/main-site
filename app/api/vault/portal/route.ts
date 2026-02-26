import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { STRIPE_CONFIG } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get subscription to find Stripe customer ID
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
        },
      },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    const origin = req.headers.get("origin") || "https://learning-platform-indol.vercel.app"

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/rhythms`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error("Portal error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
