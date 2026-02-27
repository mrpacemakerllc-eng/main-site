import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { STRIPE_CONFIG } from "@/lib/stripe"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hasPurchased: false, status: "not_logged_in" })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ hasPurchased: false, status: "user_not_found" })
    }

    const purchase = await prisma.subscription.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: STRIPE_CONFIG.PACED_ECG_BOOKLET_PRODUCT_ID,
        },
      },
    })

    return NextResponse.json({
      hasPurchased: purchase?.status === "active",
      status: purchase?.status || "no_purchase",
    })
  } catch (error) {
    console.error("Booklet status error:", error)
    return NextResponse.json({ hasPurchased: false, status: "error" })
  }
}
