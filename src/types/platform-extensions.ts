/**
 * Platform Extensions Types
 * Webhook Triggers, Scheduled Sequences, Multi-Step Modules, Analytics, Marketplace
 */

// ═════════════════════════════════════════════════════════════════════════════
// Webhook Triggers
// ═════════════════════════════════════════════════════════════════════════════

export interface WebhookTrigger {
  id: string;
  name: string;
  description?: string;
  serverId: string;
  actionSequenceId: string;
  webhookPath: string;
  hmacSecret?: string;
  requireAuth: boolean;
  allowedIPs?: string[];
  rateLimitPerMin: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookTriggerExecution {
  id: string;
  webhookTriggerId: string;
  requestMethod: string;
  requestHeaders: Record<string, unknown>;
  requestBody: string;
  responseStatus: number;
  responseBody: string;
  clientIP: string;
  executedAt: string;
  executionTimeMs?: number;
  errorMessage?: string;
}

export interface CreateWebhookTriggerPayload {
  name: string;
  description?: string;
  actionSequenceId: string;
  hmacSecret?: string;
  requireAuth?: boolean;
  allowedIPs?: string[];
  rateLimitPerMin?: number;
}

export interface UpdateWebhookTriggerPayload {
  name?: string;
  description?: string;
  actionSequenceId?: string;
  hmacSecret?: string;
  requireAuth?: boolean;
  allowedIPs?: string[];
  rateLimitPerMin?: number;
  isActive?: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
// Scheduled Sequences
// ═════════════════════════════════════════════════════════════════════════════

export interface ScheduledSequence {
  id: string;
  name: string;
  description?: string;
  serverId: string;
  cronExpression: string;
  timezone: string;
  actionSequenceId: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  runCount: number;
  maxRuns?: number;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledSequenceExecution {
  id: string;
  scheduledSequenceId: string;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  errorMessage?: string;
}

export interface CreateScheduledSequencePayload {
  name: string;
  description?: string;
  cronExpression: string;
  timezone?: string;
  actionSequenceId: string;
  maxRuns?: number;
  endDate?: string;
}

export interface UpdateScheduledSequencePayload {
  name?: string;
  description?: string;
  cronExpression?: string;
  timezone?: string;
  actionSequenceId?: string;
  isActive?: boolean;
  maxRuns?: number;
  endDate?: string;
}

export interface CronValidationResult {
  valid: boolean;
  nextRun: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// Multi-Step Modules
// ═════════════════════════════════════════════════════════════════════════════

export interface MultiStepModule {
  id: string;
  name: string;
  description?: string;
  serverId: string;
  triggerType: "command" | "button" | "reaction" | "join" | "scheduled";
  triggerConfig: Record<string, unknown>;
  completionActionSequenceId?: string;
  allowMultipleSessions: boolean;
  sessionTimeoutMinutes: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  steps?: ModuleStep[];
}

export interface ModuleStep {
  id: string;
  moduleId: string;
  name: string;
  description?: string;
  stepType: "text_input" | "number_input" | "select" | "multi_select" | "confirm" | "date_picker" | "user_mention" | "role_select" | "channel_select";
  config: Record<string, unknown>;
  validationRules?: Record<string, unknown>;
  isRequired: boolean;
  orderIndex: number;
  condition?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleSession {
  id: string;
  moduleId: string;
  userId: string;
  currentStepId?: string;
  status: "active" | "completed" | "cancelled" | "expired";
  responses: ModuleStepResponse[];
  startedAt: string;
  completedAt?: string;
  expiresAt: string;
}

export interface ModuleStepResponse {
  id: string;
  sessionId: string;
  stepId: string;
  responseData: Record<string, unknown>;
  respondedAt: string;
}

export interface CreateMultiStepModulePayload {
  name: string;
  description?: string;
  triggerType?: string;
  triggerConfig?: Record<string, unknown>;
  completionActionSequenceId?: string;
  allowMultipleSessions?: boolean;
  sessionTimeoutMinutes?: number;
}

export interface UpdateMultiStepModulePayload {
  name?: string;
  description?: string;
  triggerType?: string;
  triggerConfig?: Record<string, unknown>;
  completionActionSequenceId?: string;
  allowMultipleSessions?: boolean;
  sessionTimeoutMinutes?: number;
  isActive?: boolean;
}

export interface AddModuleStepPayload {
  name: string;
  description?: string;
  stepType: string;
  config: Record<string, unknown>;
  validationRules?: Record<string, unknown>;
  isRequired?: boolean;
  condition?: Record<string, unknown>;
}

export interface SubmitStepPayload {
  responseData: Record<string, unknown>;
}

// ═════════════════════════════════════════════════════════════════════════════
// Analytics
// ═════════════════════════════════════════════════════════════════════════════

export interface AnalyticsEvent {
  id: string;
  serverId?: string;
  userId?: string;
  eventType: string;
  category: string;
  properties?: Record<string, unknown>;
  sessionId?: string;
  createdAt: string;
}

export interface AnalyticsMetric {
  id: string;
  serverId?: string;
  metricType: string;
  value: number;
  dimensions?: Record<string, unknown>;
  bucketTime: string;
}

export interface DashboardStats {
  totalEvents: number;
  uniqueUsers: number;
  eventsByType: Record<string, number>;
  eventsByCategory: Record<string, number>;
  topEvents: Array<{ eventType: string; count: number }>;
}

export interface EventSummary {
  period: string;
  totalEvents: number;
  uniqueUsers: number;
  eventsByType: Record<string, number>;
}

export interface UserActivity {
  userId: string;
  totalEvents: number;
  eventsByType: Record<string, number>;
  lastActive: string;
}

export interface TrackEventPayload {
  eventType: string;
  category?: string;
  properties?: Record<string, unknown>;
}

// ═════════════════════════════════════════════════════════════════════════════
// Marketplace
// ═════════════════════════════════════════════════════════════════════════════

export interface MarketplaceTemplate {
  id: string;
  originalTemplateId?: string;
  authorId: string;
  templateType: "embed" | "text" | "container";
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  content: Record<string, unknown>;
  isPublic: boolean;
  downloadCount: number;
  ratingCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface MarketplaceRating {
  id: string;
  templateId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface MarketplaceImport {
  id: string;
  templateId: string;
  userId: string;
  targetServerId: string;
  importType: "copy" | "reference" | "fork";
  customizations?: Record<string, unknown>;
  newTemplateId?: string;
  importedAt: string;
  template?: MarketplaceTemplate;
}

export interface TemplateStats {
  downloadCount: number;
  ratingCount: number;
  averageRating: number;
  importCount: number;
}

export interface PublishTemplatePayload {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  content: Record<string, unknown>;
}

export interface UpdateMarketplaceTemplatePayload {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface RateTemplatePayload {
  rating: number;
  review?: string;
}

export interface ImportTemplatePayload {
  importType?: "copy" | "reference" | "fork";
  customizations?: Record<string, unknown>;
}

export interface TemplateDiscoveryFilters {
  templateType?: string;
  category?: string;
  sortBy?: "rating" | "downloads" | "newest";
  limit?: number;
  offset?: number;
}
