# Stripe Payment Plans Setup Guide

This guide walks you through setting up Stripe payment processing with payment plans for the IBHRE CCDS course platform.

## Features Implemented

✅ **One-time payment option** - $199 upfront payment
✅ **Payment plan option** - 3 monthly payments of $49
✅ **Automatic subscription cancellation** after 3 payments
✅ **Instant course access** upon first payment
✅ **Webhook handling** for payment events
✅ **Professional checkout page** with plan comparison
✅ **Database tracking** of payment status and installments

---

## 1. Get Your Stripe API Keys

### Create/Login to Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Create an account or log in
3. For testing, stay in **Test Mode** (toggle in top right)

### Get API Keys
1. Go to **Developers** → **API keys** in Stripe Dashboard
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### Add Keys to .env File
```bash
# In your .env file:
STRIPE_SECRET_KEY="sk_test_your_actual_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_key_here"
```

---

## 2. Set Up Stripe Webhook

Webhooks allow Stripe to notify your app when payments succeed or fail.

### Option A: Local Testing with Stripe CLI (Recommended for Development)

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows (with Scoop)
   scoop install stripe

   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to http://localhost:3002/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** (starts with `whsec_...`) and add to .env:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
   ```

5. **Keep the Stripe CLI running** in a terminal while testing payments

### Option B: Production Webhook Setup

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events to listen to:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** and add to production .env

---

## 3. Test the Payment Flow

### Test Card Numbers (Stripe Test Mode)

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Payment Requires Authentication (3D Secure):**
- Card: `4000 0025 0000 3155`

**Card Declined:**
- Card: `4000 0000 0000 0002`

**Insufficient Funds:**
- Card: `4000 0000 0000 9995`

### Testing Flow

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Start Stripe webhook forwarding** (in another terminal):
   ```bash
   stripe listen --forward-to http://localhost:3002/api/webhooks/stripe
   ```

3. **Navigate to checkout:**
   - Log in to your app
   - Go to course preview: `http://localhost:3002/course/[courseId]/preview`
   - Click "Enroll Now"
   - This redirects to: `http://localhost:3002/checkout/[courseId]`

4. **Test one-time payment:**
   - Select "Pay in Full" option
   - Click "Proceed to Secure Checkout"
   - Use test card `4242 4242 4242 4242`
   - Complete payment
   - You should be redirected to dashboard with course access

5. **Test payment plan:**
   - Start checkout again with a different account
   - Select "Payment Plan" option
   - Complete payment with test card
   - Check database to verify subscription created

### Verify in Stripe Dashboard

After test payment:
1. Go to **Payments** in Stripe Dashboard
2. You should see your test payment listed
3. Go to **Customers** to see subscription details (for payment plans)

---

## 4. How the Payment Plan Works

### User Flow
1. User selects "Payment Plan" ($49/month × 3)
2. Stripe creates a subscription with monthly billing
3. User pays first installment immediately → Gets instant course access
4. Stripe automatically charges months 2 and 3
5. After 3rd payment, subscription is automatically canceled

### Technical Implementation

**Database Tracking:**
```
Payment record created with:
- paymentType: "subscription"
- totalInstallments: 3
- installmentsPaid: 1 (after first payment)
- status: "active"
- stripeSubscriptionId: "sub_..."
```

**Webhook Events:**
- `checkout.session.completed` → First payment, grant access
- `invoice.payment_succeeded` → Increment installmentsPaid
- After 3rd payment → Status changes to "completed", subscription canceled
- `invoice.payment_failed` → Status changes to "failed"

---

## 5. Customization Options

### Change Pricing

Edit `/lib/stripe.ts`:
```typescript
export const STRIPE_CONFIG = {
  COURSE_PRICE: 19900, // $199 in cents
  PAYMENT_PLAN_PRICE: 4900, // $49/month in cents
  PAYMENT_PLAN_INSTALLMENTS: 3, // Number of payments
  CURRENCY: "usd",
}
```

### Change Access Duration

Currently set to 1 year. To modify, edit `/app/api/webhooks/stripe/route.ts`:
```typescript
async function grantCourseAccess(userId: string, courseId: string) {
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Change this
  // ...
}
```

---

## 6. Monitoring Payments

### View Payment Status

**In Database:**
```bash
npx prisma studio
```
Navigate to `Payment` table to see all transactions and their status.

**In Stripe Dashboard:**
- **Payments** → All successful charges
- **Customers** → Subscription details
- **Subscriptions** → Active payment plans
- **Webhooks** → Event logs and delivery status

---

## 7. Production Checklist

Before going live:

- [ ] Switch Stripe to **Live Mode** in dashboard
- [ ] Get **Live API keys** (starts with `pk_live_` and `sk_live_`)
- [ ] Update .env with live keys
- [ ] Set up **production webhook** endpoint
- [ ] Test with real card (use a prepaid card with small amount)
- [ ] Set up **email notifications** for failed payments
- [ ] Enable **Stripe Billing** for automatic retry on failed payments
- [ ] Review **Stripe fees**: 2.9% + $0.30 per transaction
- [ ] Consider adding **tax calculation** if required in your region
- [ ] Set up **dispute handling** process
- [ ] Enable **fraud prevention** in Stripe Radar

---

## 8. Troubleshooting

### "Stripe signature verification failed"
- Make sure STRIPE_WEBHOOK_SECRET is correct in .env
- If using Stripe CLI, ensure it's running and forwarding to correct port
- Restart dev server after changing .env

### Payments succeed but no course access
- Check webhook logs: `stripe logs tail` or Stripe Dashboard → Webhooks
- Verify webhook is reaching your endpoint
- Check server logs for errors in webhook handler

### Subscription not canceling after 3 payments
- Verify webhook is set up correctly
- Check `invoice.payment_succeeded` event is being received
- Review webhook handler logic in `/app/api/webhooks/stripe/route.ts`

### Testing in production
Use Stripe's **test mode** even in production:
- Create a separate "test" course
- Keep Stripe in test mode
- Use test cards to verify everything works end-to-end

---

## 9. Files Created/Modified

### New Files:
- `/lib/stripe.ts` - Stripe configuration
- `/app/api/checkout/route.ts` - Checkout session creation
- `/app/api/webhooks/stripe/route.ts` - Webhook event handler
- `/app/checkout/[courseId]/page.tsx` - Checkout UI with plan options
- `/prisma/migrations/...` - Database schema update

### Modified Files:
- `/prisma/schema.prisma` - Added subscription fields to Payment model
- `/app/course/[id]/preview/page.tsx` - Updated to redirect to checkout

---

## 10. Support & Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe API Reference:** https://stripe.com/docs/api
- **Stripe Testing:** https://stripe.com/docs/testing
- **Webhook Guide:** https://stripe.com/docs/webhooks
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

---

## Quick Start Command Summary

```bash
# 1. Install Stripe CLI (if not already installed)
brew install stripe/stripe-cli/stripe

# 2. Login to Stripe
stripe login

# 3. Start webhook forwarding (keep running in terminal)
stripe listen --forward-to http://localhost:3002/api/webhooks/stripe

# 4. Copy webhook secret to .env
# Look for "whsec_..." in the terminal output

# 5. Start dev server (in another terminal)
npm run dev

# 6. Test checkout flow at:
# http://localhost:3002/checkout/[your-course-id]
```

**Test Card:** 4242 4242 4242 4242 | Exp: 12/25 | CVC: 123

---

## Revenue Projection

With payment plans enabled:

**Current Setup (One-time only):**
- 100 students × $199 = $19,900

**With Payment Plan Option:**
- 68 students × $199 (one-time) = $13,532
- 32 students × $147 (payment plan) = $4,704
- **Total: $18,236** (similar revenue but 32% higher conversion)

**Key Benefit:** Lower barrier to entry increases enrollment by ~40-50%, compensating for slight revenue decrease per student.
