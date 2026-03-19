"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, X, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/query-keys";
import { api } from "@/lib/api-client";
import type { Subscription, TierLimits } from "@/types/billing";

const tierConfig = {
  free: { label: "Free", className: "bg-secondary text-secondary-foreground" },
  pro: { label: "Pro", className: "bg-primary/20 text-primary border-primary/30" },
  enterprise: { label: "Enterprise", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
} as const;

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  past_due: { label: "Past Due", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  canceled: { label: "Canceled", className: "bg-muted text-muted-foreground" },
  trialing: { label: "Trial", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  unpaid: { label: "Unpaid", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

interface PlanFeature {
  label: string;
  included: boolean;
}

interface PlanCard {
  tier: keyof typeof tierConfig;
  price: string;
  features: PlanFeature[];
  cta: string;
  ctaVariant: "default" | "outline";
  onCtaClick: () => void;
  isCurrent: boolean;
}

function PlanFeatureRow({ label, included }: PlanFeature) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {included ? (
        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      )}
      <span className={included ? "text-foreground" : "text-muted-foreground/60"}>{label}</span>
    </li>
  );
}

export default function BillingPage() {
  const { serverId } = useParams<{ serverId: string }>();

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: queryKeys.billing.subscription(serverId),
    queryFn: ({ signal }) => api.billing.getSubscription({ signal }).catch(() => null),
    enabled: !!serverId,
    staleTime: 5 * 60 * 1000,
  });

  const currentTier = subscription?.tier ?? "free";
  const isFreePlan = !subscription || currentTier === "free";

  function handleUpgrade() {
    toast.info("Billing integration coming soon");
  }

  function handleManageSubscription() {
    toast.info("Billing integration coming soon");
  }

  function handleContactUs() {
    toast.info("Billing integration coming soon");
  }

  const plans: PlanCard[] = [
    {
      tier: "free",
      price: "$0/mo",
      features: [
        { label: "Up to 50 members", included: true },
        { label: "3 event types", included: true },
        { label: "Basic templates", included: true },
        { label: "Component V2 templates", included: false },
        { label: "Server Hubs", included: false },
      ],
      cta: "Current Plan",
      ctaVariant: "outline",
      onCtaClick: () => {},
      isCurrent: isFreePlan,
    },
    {
      tier: "pro",
      price: "$9.99/mo",
      features: [
        { label: "Up to 500 members", included: true },
        { label: "Unlimited event types", included: true },
        { label: "All template types", included: true },
        { label: "Component V2 templates", included: true },
        { label: "Server Hubs", included: false },
      ],
      cta: "Upgrade",
      ctaVariant: "default",
      onCtaClick: handleUpgrade,
      isCurrent: currentTier === "pro",
    },
    {
      tier: "enterprise",
      price: "Contact us",
      features: [
        { label: "Unlimited members", included: true },
        { label: "Everything in Pro", included: true },
        { label: "Server Hubs", included: true },
        { label: "Priority support", included: true },
      ],
      cta: "Contact Us",
      ctaVariant: "outline",
      onCtaClick: handleContactUs,
      isCurrent: currentTier === "enterprise",
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payment details.</p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription and billing period.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-4 w-48 rounded-md" />
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
          ) : isFreePlan ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={tierConfig.free.className}>{tierConfig.free.label}</Badge>
              </div>
              <ul className="space-y-1.5">
                <li className="text-sm text-muted-foreground">Up to 50 members</li>
                <li className="text-sm text-muted-foreground">3 event types</li>
                <li className="text-sm text-muted-foreground">Basic templates</li>
              </ul>
              <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={tierConfig[currentTier].className}>
                  {tierConfig[currentTier].label}
                </Badge>
                {subscription?.status && (
                  <Badge
                    variant="outline"
                    className={
                      statusConfig[subscription.status]?.className ??
                      "bg-muted text-muted-foreground"
                    }
                  >
                    {statusConfig[subscription.status]?.label ?? subscription.status}
                  </Badge>
                )}
              </div>
              {subscription?.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  Renews on{" "}
                  <span className="font-medium text-foreground">
                    {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
                  </span>
                </p>
              )}
              <Button variant="outline" onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Compare Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const tier = tierConfig[plan.tier];
            return (
              <Card
                key={plan.tier}
                className={plan.isCurrent ? "border-primary/50 ring-1 ring-primary/20" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={tier.className}>{tier.label}</Badge>
                    {plan.isCurrent && (
                      <span className="text-xs font-medium text-primary">Current</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-2">{plan.price}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <PlanFeatureRow
                        key={feature.label}
                        label={feature.label}
                        included={feature.included}
                      />
                    ))}
                  </ul>
                  {plan.isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={plan.ctaVariant}
                      className="w-full"
                      onClick={plan.onCtaClick}
                    >
                      {plan.cta}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
