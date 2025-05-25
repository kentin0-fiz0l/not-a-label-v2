import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  stripe,
  constructWebhookEvent,
  StripeWebhookEvent,
  SUBSCRIPTION_PLANS,
  type PlanId,
} from '@/packages/shared/src/lib/stripe';
import { analytics } from '@/packages/shared/src/lib/analytics';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case StripeWebhookEvent.CHECKOUT_COMPLETED: {
        const session = event.data.object as any;
        await handleCheckoutCompleted(session);
        break;
      }

      case StripeWebhookEvent.SUBSCRIPTION_CREATED:
      case StripeWebhookEvent.SUBSCRIPTION_UPDATED: {
        const subscription = event.data.object as any;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case StripeWebhookEvent.SUBSCRIPTION_DELETED: {
        const subscription = event.data.object as any;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case StripeWebhookEvent.INVOICE_PAID: {
        const invoice = event.data.object as any;
        await handleInvoicePaid(invoice);
        break;
      }

      case StripeWebhookEvent.INVOICE_FAILED: {
        const invoice = event.data.object as any;
        await handleInvoiceFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata.userId;
  const planId = session.metadata.planId as PlanId;

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Create or update user subscription
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      stripePriceId: SUBSCRIPTION_PLANS[planId].priceId!,
      planId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    update: {
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      stripePriceId: SUBSCRIPTION_PLANS[planId].priceId!,
      planId,
      status: 'active',
    },
  });

  // Update user role if upgrading to label plan
  if (planId === 'LABEL') {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'label' },
    });
  }

  // Track conversion
  analytics.track('subscription_created', {
    userId,
    planId,
    revenue: SUBSCRIPTION_PLANS[planId].price,
  });
}

async function handleSubscriptionUpdate(subscription: any) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  const planId = Object.entries(SUBSCRIPTION_PLANS).find(
    ([_, plan]) => plan.priceId === subscription.items.data[0].price.id
  )?.[0] as PlanId | undefined;

  if (!planId) {
    console.error('Unknown price ID:', subscription.items.data[0].price.id);
    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      planId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  analytics.track('subscription_updated', {
    userId,
    planId,
    status: subscription.status,
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  // Downgrade to free plan
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      planId: 'FREE',
      status: 'canceled',
      canceledAt: new Date(),
    },
  });

  // Update user role if was label
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'artist' },
  });

  analytics.track('subscription_canceled', {
    userId,
    previousPlan: subscription.metadata.planId,
  });
}

async function handleInvoicePaid(invoice: any) {
  // Record payment
  await prisma.payment.create({
    data: {
      userId: invoice.metadata.userId,
      stripePaymentIntentId: invoice.payment_intent,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: 'succeeded',
      description: `Subscription payment for ${invoice.period_end}`,
    },
  });

  analytics.trackRevenue(
    invoice.amount_paid / 100,
    invoice.currency,
    'subscription'
  );
}

async function handleInvoiceFailed(invoice: any) {
  const userId = invoice.metadata.userId;
  if (!userId) return;

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeCustomerId: invoice.customer },
    data: { status: 'past_due' },
  });

  // Send notification to user
  await prisma.notification.create({
    data: {
      userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Your subscription payment failed. Please update your payment method.',
      actionUrl: '/settings/subscription',
    },
  });

  analytics.track('payment_failed', {
    userId,
    amount: invoice.amount_due / 100,
  });
}