import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get("session_id")

    let hasAccess = false
    let userEmail = ""

    // Method 1: Check Stripe session (for guest purchases)
    if (sessionId) {
      // TEST MODE - allow test_session for testing
      if (sessionId === "test_session") {
        hasAccess = true
        userEmail = "Test User"
      } else {
        try {
          const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
          if (checkoutSession.payment_status === "paid") {
            hasAccess = true
            userEmail = checkoutSession.customer_email || "Purchased"
          }
        } catch (e) {
          console.error("Stripe session check failed:", e)
        }
      }
    }

    // Method 2: Check logged-in user's purchase (for returning users)
    if (!hasAccess) {
      const session = await getServerSession(authOptions)
      if (session?.user?.email) {
        userEmail = session.user.email
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        })

        if (user) {
          const purchase = await prisma.subscription.findUnique({
            where: {
              userId_productId: {
                userId: user.id,
                productId: STRIPE_CONFIG.PACED_ECG_BOOKLET_PRODUCT_ID,
              },
            },
          })

          if (purchase?.status === "active") {
            hasAccess = true
          }
        }
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Read the PDF file
    const pdfPath = path.join(process.cwd(), "private", "paced-ecg-booklet.pdf")
    const pdfBuffer = await readFile(pdfPath)

    // Return the PDF with appropriate headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        // Prevent caching and downloading
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        // Security headers
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error: any) {
    console.error("PDF serve error:", error)
    return NextResponse.json(
      { error: "Failed to load PDF" },
      { status: 500 }
    )
  }
}
