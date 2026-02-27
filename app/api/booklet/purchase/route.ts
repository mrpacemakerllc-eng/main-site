import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in to purchase" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already purchased
    const existingPurchase = await prisma.subscription.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: STRIPE_CONFIG.PACED_ECG_BOOKLET_PRODUCT_ID,
        },
      },
    })

    if (existingPurchase?.status === "active") {
      return NextResponse.json(
        { error: "You already own this booklet" },
        { status: 400 }
      )
    }

    const origin = req.headers.get("origin") || "https://learning-platform-indol.vercel.app"

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.CURRENCY,
            product_data: {
              name: "How to Read a Paced ECG",
              description: "Digital booklet - Lifetime access with watermarked viewer",
            },
            unit_amount: STRIPE_CONFIG.PACED_ECG_BOOKLET_PRICE,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email || session.user.email,
      metadata: {
        userId: user.id,
        productId: STRIPE_CONFIG.PACED_ECG_BOOKLET_PRODUCT_ID,
      },
      success_url: `${origin}/booklet?purchase=success`,
      cancel_url: `${origin}/booklet?purchase=canceled`,
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error: any) {
    console.error("Booklet purchase error:", error)
    return NextResponse.json(
      { error: "Unexpected error: " + (error?.message || "Unknown") },
      { status: 500 }
    )
  }
}
