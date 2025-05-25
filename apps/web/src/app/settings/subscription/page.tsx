'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, CreditCard, TrendingUp } from 'lucide-react';
import { SUBSCRIPTION_PLANS, type PlanId } from '@/packages/shared/src/lib/stripe';

interface UserSubscription {
  planId: PlanId;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: PlanId) => {
    setUpgrading(planId);
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
      });

      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const currentPlan = subscription?.planId || 'FREE';

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Subscription & Billing
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription and billing preferences
        </p>
      </div>

      {/* Current Plan */}
      {subscription && (
        <Card className="mb-8 border-purple-200 bg-purple-50/50 dark:bg-purple-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xl font-bold">
                    {SUBSCRIPTION_PLANS[currentPlan].name}
                  </span>
                  <Badge
                    variant={subscription.status === 'active' ? 'default' : 'secondary'}
                  >
                    {subscription.status}
                  </Badge>
                </div>
              </div>
              <Button onClick={handleManageSubscription} variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {subscription.cancelAtPeriodEnd && (
              <p className="text-amber-600 dark:text-amber-400 mb-2">
                Your subscription will end on{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              Next billing date:{' '}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => {
          const planId = planKey as PlanId;
          const isCurrentPlan = currentPlan === planId;
          const isUpgrade = plan.price > (SUBSCRIPTION_PLANS[currentPlan]?.price || 0);

          return (
            <Card
              key={planId}
              className={`relative ${
                isCurrentPlan ? 'border-purple-500 shadow-lg' : ''
              }`}
            >
              {plan.id === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{plan.interval}
                      </span>
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled variant="outline">
                      Current Plan
                    </Button>
                  ) : planId === 'FREE' ? (
                    <Button className="w-full" variant="outline" disabled>
                      <X className="h-4 w-4 mr-2" />
                      Downgrade
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(planId)}
                      disabled={upgrading !== null}
                    >
                      {upgrading === planId ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TrendingUp className="h-4 w-4 mr-2" />
                      )}
                      {isUpgrade ? 'Upgrade' : 'Change'} to {plan.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Track Uploads</span>
                <span className="text-sm text-gray-600">
                  {subscription ? '12' : '2'} /{' '}
                  {SUBSCRIPTION_PLANS[currentPlan].limits.tracksPerMonth === -1
                    ? 'Unlimited'
                    : SUBSCRIPTION_PLANS[currentPlan].limits.tracksPerMonth}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width:
                      SUBSCRIPTION_PLANS[currentPlan].limits.tracksPerMonth === -1
                        ? '0%'
                        : '40%',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Storage Used</span>
                <span className="text-sm text-gray-600">
                  2.3 GB /{' '}
                  {SUBSCRIPTION_PLANS[currentPlan].limits.storage === -1
                    ? 'Unlimited'
                    : `${
                        SUBSCRIPTION_PLANS[currentPlan].limits.storage /
                        (1024 * 1024 * 1024)
                      } GB`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: '23%' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}