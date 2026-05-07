import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { authMiddleware } from '@/utils/authMiddleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/create-intent
// Creates a Stripe PaymentIntent and returns the clientSecret
export async function POST(request) {
  const authResult = await authMiddleware(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { amount } = await request.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // PKR uses paisa as smallest unit (1 PKR = 100 paisa)
    const amountInPaisa = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaisa,
      currency: 'pkr',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(authResult.user.id),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment. Please try again.' },
      { status: 500 }
    );
  }
}
