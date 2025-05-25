import Stripe from 'stripe';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: null,
    features: [
      'Upload up to 3 tracks per month',
      'Basic analytics',
      'Standard support',
      '70% revenue share',
    ],
    limits: {
      tracksPerMonth: 3,
      storage: 500 * 1024 * 1024, // 500MB
      distributionChannels: 5,
    },
  },
  ARTIST: {
    id: 'artist',
    name: 'Artist',
    price: 9.99,
    priceId: process.env.STRIPE_ARTIST_PRICE_ID,
    interval: 'month',
    features: [
      'Unlimited track uploads',
      'Advanced analytics & insights',
      'Priority support',
      '85% revenue share',
      'Custom artist page',
      'Collaboration tools',
    ],
    limits: {
      tracksPerMonth: -1, // Unlimited
      storage: 10 * 1024 * 1024 * 1024, // 10GB
      distributionChannels: 50,
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    interval: 'month',
    features: [
      'Everything in Artist',
      'White-label distribution',
      'API access',
      '90% revenue share',
      'Advanced marketing tools',
      'Multiple artist profiles',
      'Team collaboration',
      'Priority distribution',
    ],
    limits: {
      tracksPerMonth: -1, // Unlimited
      storage: 100 * 1024 * 1024 * 1024, // 100GB
      distributionChannels: -1, // All channels
    },
  },
  LABEL: {
    id: 'label',
    name: 'Label',
    price: 99.99,
    priceId: process.env.STRIPE_LABEL_PRICE_ID,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited artist accounts',
      'Advanced royalty splitting',
      '95% revenue share',
      'Custom contracts',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    limits: {
      tracksPerMonth: -1, // Unlimited
      storage: -1, // Unlimited
      distributionChannels: -1, // All channels
      artists: -1, // Unlimited
    },
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

// Stripe webhook events we handle
export enum StripeWebhookEvent {
  CHECKOUT_COMPLETED = 'checkout.session.completed',
  SUBSCRIPTION_CREATED = 'customer.subscription.created',
  SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
  INVOICE_PAID = 'invoice.paid',
  INVOICE_FAILED = 'invoice.payment_failed',
  PAYMENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_FAILED = 'payment_intent.payment_failed',
}

// Helper functions
export async function createCheckoutSession({
  userId,
  planId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  planId: PlanId;
  successUrl: string;
  cancelUrl: string;
}) {
  const plan = SUBSCRIPTION_PLANS[planId];
  
  if (!plan.priceId) {
    throw new Error('Invalid plan selected');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
    allow_promotion_codes: true,
  });

  return session;
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

export async function resumeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

// Revenue sharing and payouts
export async function createConnectedAccount({
  email,
  country,
  type = 'express',
}: {
  email: string;
  country: string;
  type?: 'express' | 'standard';
}) {
  const account = await stripe.accounts.create({
    type,
    country,
    email,
    capabilities: {
      transfers: { requested: true },
    },
    business_type: 'individual',
  });

  return account;
}

export async function createAccountLink(accountId: string, returnUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${returnUrl}?refresh=true`,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}

export async function createPayout({
  accountId,
  amount,
  currency = 'usd',
  description,
}: {
  accountId: string;
  amount: number;
  currency?: string;
  description?: string;
}) {
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    destination: accountId,
    description,
  });

  return transfer;
}

// Usage-based billing for additional services
export async function recordUsage({
  subscriptionItemId,
  quantity,
  timestamp = Math.floor(Date.now() / 1000),
}: {
  subscriptionItemId: string;
  quantity: number;
  timestamp?: number;
}) {
  const usageRecord = await stripe.subscriptionItems.createUsageRecord(
    subscriptionItemId,
    {
      quantity,
      timestamp,
      action: 'increment',
    }
  );

  return usageRecord;
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}