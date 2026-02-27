import { NextResponse } from "next/server"

export async function GET() {
  // Demo mode - all rhythms available for testing
  // TODO: Re-enable database check when Supabase is connected
  const isDemoMode = process.env.DEMO_MODE === "true" || !process.env.DATABASE_URL?.startsWith("postgres")

  if (isDemoMode) {
    return NextResponse.json({
      isPro: true,
      status: "demo_mode",
      message: "Demo mode - all rhythms unlocked for testing"
    })
  }

  // Production mode with database
  try {
    const { getServerSession } = await import("next-auth")
    const { authOptions } = await import("@/lib/auth")
    const { prisma } = await import("@/lib/prisma")
    const { STRIPE_CONFIG } = await import("@/lib/stripe")

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

    // Check for ECG Rhythm Library purchase (one-time, lifetime access)
    const purchase = await prisma.subscription.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: STRIPE_CONFIG.ECG_LIBRARY_PRODUCT_ID,
        },
      },
    })

    if (!purchase) {
      return NextResponse.json({ isPro: false, status: "no_purchase" })
    }

    return NextResponse.json({
      isPro: purchase.status === "active",
      status: purchase.status,
    })
  } catch (error) {
    console.error("Vault status error:", error)
    // Fall back to demo mode on error
    return NextResponse.json({ isPro: true, status: "demo_fallback" })
  }
}
