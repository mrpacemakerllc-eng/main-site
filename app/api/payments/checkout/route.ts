import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { courseId } = await request.json()

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.price === 0) {
      // Free course, create enrollment directly
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 year access

      const enrollment = await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        create: {
          userId,
          courseId,
          hasPaid: true,
          expiresAt,
        },
        update: {
          hasPaid: true,
          expiresAt,
        },
      })

      return NextResponse.json({
        success: true,
        free: true,
        enrollmentId: enrollment.id
      })
    }

    // Paid course, create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description || undefined,
            },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/course/${courseId}?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/course/${courseId}?payment=cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
        courseId,
      },
    })

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId,
        courseId,
        stripeSessionId: checkoutSession.id,
        amount: course.price,
        status: "pending",
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
