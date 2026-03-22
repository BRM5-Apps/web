export interface Subscription {
  id: string;
  serverId?: string;
  serverHubId?: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  tier: "free" | "pro" | "enterprise";
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface TierLimits {
  maxMembers: number;
  maxEventTypes: number;
  maxHubs: number;
  templateAccess: boolean;
  hubAccess: boolean;
  prioritySupport: boolean;
}
