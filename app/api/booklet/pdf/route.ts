import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { STRIPE_CONFIG } from "@/lib/stripe"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has purchased the booklet
    const purchase = await prisma.subscription.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: STRIPE_CONFIG.PACED_ECG_BOOKLET_PRODUCT_ID,
        },
      },
    })

    if (purchase?.status !== "active") {
      return NextResponse.json({ error: "Not purchased" }, { status: 403 })
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
