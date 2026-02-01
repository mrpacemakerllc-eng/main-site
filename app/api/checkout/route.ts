import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
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

    const { courseId, paymentType } = await req.json()

    if (!courseId || !paymentType) {
      return NextResponse.json(
        { error: "Missing courseId or paymentType" },
        { status: 400 }
      )
    }

    if (paymentType !== "one_time" && paymentType !== "subscription") {
      return NextResponse.json(
        { error: "Invalid payment type" },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    })

    if (existingEnrollment?.hasPaid) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      )
    }

    const origin = req.headers.get("origin") || "http://localhost:3002"

    let checkoutSession

    if (paymentType === "one_time") {
      // One-time payment
      checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.CURRENCY,
              product_data: {
                name: course.title,
                description: "Full course access - One-time payment",
              },
              unit_amount: STRIPE_CONFIG.COURSE_PRICE,
            },
            quantity: 1,
          },
        ],
        customer_email: user.email,
        metadata: {
          userId: user.id,
          courseId: courseId,
          paymentType: "one_time",
        },
        success_url: `${origin}/dashboard?payment=success`,
        cancel_url: `${origin}/course/${courseId}?payment=canceled`,
      })
    } else {
      // Payment plan (subscription)
      checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.CURRENCY,
              product_data: {
                name: `${course.title} - Payment Plan`,
                description: `$49/month for ${STRIPE_CONFIG.PAYMENT_PLAN_INSTALLMENTS} months`,
              },
              unit_amount: STRIPE_CONFIG.PAYMENT_PLAN_PRICE,
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
            courseId: courseId,
            paymentType: "subscription",
            totalInstallments: STRIPE_CONFIG.PAYMENT_PLAN_INSTALLMENTS.toString(),
          },
        },
        customer_email: user.email,
        metadata: {
          userId: user.id,
          courseId: courseId,
          paymentType: "subscription",
        },
        success_url: `${origin}/dashboard?payment=success`,
        cancel_url: `${origin}/course/${courseId}?payment=canceled`,
      })
    }

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        courseId: courseId,
        stripeSessionId: checkoutSession.id,
        amount: paymentType === "one_time"
          ? STRIPE_CONFIG.COURSE_PRICE
          : STRIPE_CONFIG.PAYMENT_PLAN_PRICE,
        status: "pending",
        paymentType: paymentType,
        totalInstallments: paymentType === "subscription"
          ? STRIPE_CONFIG.PAYMENT_PLAN_INSTALLMENTS
          : 1,
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
