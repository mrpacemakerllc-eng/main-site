import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { STRIPE_CONFIG } from "@/lib/stripe"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ isPro: false, status: "not_logged_in" })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ isPro: false, status: "user_not_found" })
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
        },
      },
    })

    if (!subscription) {
      return NextResponse.json({ isPro: false, status: "no_subscription" })
    }

    // Check if subscription is active and not expired
    const isActive = subscription.status === "active"
    const isExpired = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd) < new Date()
      : true

    return NextResponse.json({
      isPro: isActive && !isExpired,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    })
  } catch (error) {
    console.error("Vault status error:", error)
    return NextResponse.json({ isPro: false, status: "error" })
  }
}
