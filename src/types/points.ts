export interface UserPoints {
  id: string;
  serverUserId: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastResetAt?: string;
  updatedAt: string;
}

export interface PointTransaction {
  id: string;
  serverUserId: string;
  amount: number;
  reason: string;
  source: "event" | "manual" | "bonus" | "deduction";
  referenceId?: string;
  createdAt: string;
}

export interface PromotionThreshold {
  id: string;
  rankId: string;
  requiredPoints: number;
  requiredEvents: number;
  requiredDaysActive: number;
  autoPromote: boolean;
}

export interface PromotionFlag {
  id: string;
  serverUserId: string;
  rankId: string;
  status: "pending" | "approved" | "denied";
  flaggedAt: string;
  reviewedById?: string;
  reviewedAt?: string;
}
