import { NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log("handleCheckoutComplete called")
  console.log("Session metadata:", JSON.stringify(session.metadata))
  console.log("Session subscription:", session.subscription)
  console.log("Session customer:", session.customer)

  const { userId, courseId, paymentType, productId } = session.metadata || {}
  console.log("Extracted - userId:", userId, "productId:", productId)

  // Handle ECG Vault subscription
  if (productId === STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID) {
    console.log("ECG Vault subscription detected")

    if (!userId) {
      console.error("Missing userId for vault subscription")
      return
    }

    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id

    if (!subscriptionId) {
      console.error("No subscription ID in checkout session")
      return
    }

    console.log("Fetching subscription from Stripe:", subscriptionId)

    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data']
      })
      console.log("Stripe subscription retrieved:", stripeSubscription.id)

      // Get period dates from the first subscription item
      const firstItem = stripeSubscription.items.data[0]
      const periodStart = firstItem ? new Date(firstItem.current_period_start * 1000) : new Date()
      const periodEnd = firstItem ? new Date(firstItem.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      // Update subscription record
      await prisma.subscription.upsert({
        where: {
          userId_productId: {
            userId,
            productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
          },
        },
        create: {
          userId,
          productId: STRIPE_CONFIG.ECG_VAULT_PRODUCT_ID,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId || null,
          status: "active",
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        },
        update: {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId || null,
          status: "active",
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        },
      })

      console.log(`ECG Vault subscription activated for user ${userId}`)
    } catch (err: any) {
      console.error("Error processing ECG Vault subscription:", err.message)
      throw err
    }
    return
  }

  // Handle course payments (existing logic)
  if (!userId || !courseId || !paymentType) {
    console.error("Missing metadata in checkout session")
    return
  }

  // Update payment record
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
  })

  if (!payment) {
    console.error("Payment record not found for session:", session.id)
    return
  }

  if (paymentType === "one_time") {
    // One-time payment completed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "completed",
        stripePaymentId: session.payment_intent as string,
        installmentsPaid: 1,
      },
    })

    // Grant access to course
    await grantCourseAccess(userId, courseId)
  } else if (paymentType === "subscription") {
    // First payment of subscription
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "active",
        stripeSubscriptionId: session.subscription as string,
        installmentsPaid: 1,
      },
    })

    // Grant access to course
    await grantCourseAccess(userId, courseId)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as unknown as { subscription: string }).subscription

  if (!subscriptionId) return

  // Find payment record by subscription ID
  const payment = await prisma.payment.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!payment) {
    console.error("Payment not found for subscription:", subscriptionId)
    return
  }

  // Increment installments paid
  const newInstallmentsPaid = payment.installmentsPaid + 1

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      installmentsPaid: newInstallmentsPaid,
      status: newInstallmentsPaid >= payment.totalInstallments
        ? "completed"
        : "active",
    },
  })

  // If all installments paid, cancel subscription
  if (newInstallmentsPaid >= payment.totalInstallments) {
    try {
      await stripe.subscriptions.cancel(subscriptionId)
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as unknown as { subscription: string }).subscription

  if (!subscriptionId) return

  const payment = await prisma.payment.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!payment) return

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "failed" },
  })

  // Optionally: revoke course access or send notification
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Check if this is an ECG Vault subscription
  const vaultSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (vaultSubscription) {
    await prisma.subscription.update({
      where: { id: vaultSubscription.id },
      data: { status: "canceled" },
    })
    console.log(`ECG Vault subscription canceled for user ${vaultSubscription.userId}`)
    return
  }

  // Handle course payment subscription
  const payment = await prisma.payment.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!payment) return

  // Only mark as canceled if not already completed
  if (payment.status !== "completed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "canceled" },
    })
  }
}

async function grantCourseAccess(userId: string, courseId: string) {
  // Check if enrollment exists
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  })

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 year access

  if (existingEnrollment) {
    // Update existing enrollment
    await prisma.enrollment.update({
      where: { id: existingEnrollment.id },
      data: {
        hasPaid: true,
        expiresAt,
      },
    })
  } else {
    // Create new enrollment
    await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        hasPaid: true,
        expiresAt,
      },
    })
  }
}
