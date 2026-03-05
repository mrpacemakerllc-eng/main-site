import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const origin = req.headers.get("origin") || "https://learning-platform-indol.vercel.app"

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.CURRENCY,
            product_data: {
              name: "ECG Rhythm Library",
              description: "49 animated ECG rhythms - Lifetime access",
            },
            unit_amount: STRIPE_CONFIG.ECG_LIBRARY_PRICE,
          },
          quantity: 1,
        },
      ],
      // If logged in, prefill email; otherwise Stripe will collect it
      ...(session?.user?.email && { customer_email: session.user.email }),
      metadata: {
        productId: STRIPE_CONFIG.ECG_LIBRARY_PRODUCT_ID,
        ...(session?.user?.email && { userEmail: session.user.email }),
      },
      success_url: `${origin}/rhythms?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/rhythms?purchase=canceled`,
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error: any) {
    console.error("ECG Library purchase error:", error)
    return NextResponse.json(
      { error: "Unexpected error: " + (error?.message || "Unknown") },
      { status: 500 }
    )
  }
}
