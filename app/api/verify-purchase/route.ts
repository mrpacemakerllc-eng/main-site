import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, productId } = await req.json();

    if (!email || !productId) {
      return NextResponse.json({ error: 'Email and product required' }, { status: 400 });
    }

    // First check our database
    const purchase = await prisma.purchase.findFirst({
      where: {
        email: email.toLowerCase(),
        productId: productId,
        status: 'completed',
      },
    });

    if (purchase) {
      return NextResponse.json({
        verified: true,
        email: purchase.email,
        purchaseDate: purchase.createdAt,
      });
    }

    // If not in database, check Stripe directly
    const sessions = await stripe.checkout.sessions.list({
      customer_details: { email: email.toLowerCase() },
      limit: 100,
    });

    const validPurchase = sessions.data.find(
      (session) =>
        session.payment_status === 'paid' &&
        session.metadata?.productId === productId
    );

    if (validPurchase) {
      // Save to our database for faster lookup next time
      await prisma.purchase.create({
        data: {
          email: email.toLowerCase(),
          productId: productId,
          productName: productId === 'paced_ecg_booklet' ? 'How to Read a Paced ECG' : 'ECG Rhythm Library',
          amount: validPurchase.amount_total || 0,
          stripeSessionId: validPurchase.id,
          stripePaymentId: validPurchase.payment_intent as string || null,
          status: 'completed',
        },
      });

      return NextResponse.json({
        verified: true,
        email: email,
        purchaseDate: new Date(validPurchase.created * 1000),
      });
    }

    return NextResponse.json({ verified: false });
  } catch (error: any) {
    console.error('Verify purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to verify purchase' },
      { status: 500 }
    );
  }
}
