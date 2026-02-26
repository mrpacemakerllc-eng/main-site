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
  // ECG Vault subscription
  ECG_VAULT_PRICE_MONTHLY: 999, // $9.99 per month in cents
  ECG_VAULT_PRICE_ANNUAL: 9900, // $99.00 per year in cents (save ~$20)
  ECG_VAULT_PRODUCT_ID: "ecg_vault",
}
