import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const STRIPE_CONFIG = {
  COURSE_PRICE: 19900, // $199.00 in cents
  PAYMENT_PLAN_PRICE: 6700, // $67.00 per month in cents
  PAYMENT_PLAN_INSTALLMENTS: 3,
  CURRENCY: "usd",
  // ECG Rhythm Library - one-time purchase
  ECG_LIBRARY_PRICE: 1900, // $19.00 one-time
  ECG_LIBRARY_PRODUCT_ID: "ecg_rhythm_library",
}
