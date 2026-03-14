import axios, { AxiosError } from "axios";
import { getSession } from "next-auth/react";
import type { ApiError, ApiResponse } from "@/types/api";
import type {
  Faction,
  FactionMember,
  PaginatedMembers,
  FactionConfig,
} from "@/types/faction";
import type {
  Rank,
  RankWithDetails,
  RankPayload,
  ReorderRanksPayload,
  Permission,
  PromotionPath,
  PromotionPathPayload,
} from "@/types/rank";
import type { Event, EventType, EventRequest } from "@/types/event";
import type {
  EmbedTemplate,
  ContainerTemplate,
  TextTemplate,
} from "@/types/template";
import type { FactionStats, DailyStats, LeaderboardEntry } from "@/types/stats";
import type {
  Punishment,
  PunishmentAppeal,
  BlacklistEntry,
  BlacklistConfig,
  PromoLock,
} from "@/types/moderation";
import type {
  UserPoints,
  PromotionFlag,
} from "@/types/points";
import type { Unit, UnitMember } from "@/types/unit";
import type { Subscription, CheckoutSession } from "@/types/billing";
import type { User, UserProfile } from "@/types/user";
import { API_ROUTES } from "@/lib/constants";

// ── Request options for signal/cancellation support ──

export interface RequestOptions {
  signal?: AbortSignal;
}

// ── Axios instance ──

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from NextAuth session
axiosInstance.interceptors.request.use(async (config) => {
  let token: string | undefined;

  // Prefer the readable cookie to avoid triggering NextAuth session fetches unnecessarily
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )backendToken=([^;]+)/);
    token = match ? decodeURIComponent(match[1]) : undefined;
  }

  if (!token) {
    const session = await getSession();
    token = session?.backendToken;
  }

  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap { success, data, error } envelope and handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }

    const apiError: ApiError = error.response?.data?.error ?? {
      code: "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred",
    };

    return Promise.reject(apiError);
  }
);

// ── Generic API client (preserved for backward compatibility) ──

/** Typed API client that unwraps the { success, data } envelope */
export const apiClient = {
  async get<T>(
    url: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    const res = await axiosInstance.get<ApiResponse<T>>(url, {
      params,
      signal: options?.signal,
    });
    return res.data.data;
  },

  async post<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const res = await axiosInstance.post<ApiResponse<T>>(url, body, {
      signal: options?.signal,
    });
    return res.data.data;
  },

  async patch<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const res = await axiosInstance.patch<ApiResponse<T>>(url, body, {
      signal: options?.signal,
    });
    return res.data.data;
  },

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    const res = await axiosInstance.delete<ApiResponse<T>>(url, {
      signal: options?.signal,
    });
    return res.data.data;
  },
};

// ── Typed domain API ──

export const api = {
  // ── Auth ──
  auth: {
    me: (opts?: RequestOptions) =>
      apiClient.get<User>(API_ROUTES.auth.me, undefined, opts),
    discord: (data: { accessToken: string }, opts?: RequestOptions) =>
      apiClient.post<{ token: string }>(API_ROUTES.auth.discord, data, opts),
    refresh: (opts?: RequestOptions) =>
      apiClient.post<{ token: string }>(API_ROUTES.auth.refresh, undefined, opts),
  },

  // ── Users ──
  users: {
    get: (userId: string, opts?: RequestOptions) =>
      apiClient.get<UserProfile>(API_ROUTES.users.get(userId), undefined, opts),
    update: (userId: string, data: Partial<User>, opts?: RequestOptions) =>
      apiClient.patch<User>(API_ROUTES.users.update(userId), data, opts),
  },

  // ── Factions ──
  factions: {
    byGuildIds: async (guildIds: string[], opts?: RequestOptions): Promise<Faction[]> => {
      if (guildIds.length === 0) return [];
      const result = await apiClient.get<{ factions: Faction[] }>(
        "/factions/by-guild-ids",
        { guildIds: guildIds.join(",") },
        opts
      );
      return result.factions ?? [];
    },
    list: async (opts?: RequestOptions) => {
      // Backend returns { items: [{ faction, rankId }] } for the
      // authenticated user's factions. Normalize to a plain Faction[]
      // for frontend consumers.
      const view = await apiClient.get<{
        items: { faction: Faction }[];
      }>(API_ROUTES.factions.list, undefined, opts);
      return view.items.map((item) => item.faction);
    },
    get: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<Faction>(API_ROUTES.factions.get(factionId), undefined, opts),
    create: (data: Partial<Faction>, opts?: RequestOptions) =>
      apiClient.post<Faction>(API_ROUTES.factions.create, data, opts),
    update: (
      factionId: string,
      data: Partial<Pick<Faction, "name" | "description" | "iconUrl">>,
      opts?: RequestOptions
    ) => apiClient.patch<Faction>(API_ROUTES.factions.update(factionId), data, opts),
    delete: (factionId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(API_ROUTES.factions.delete(factionId), opts),
  },

  // ── Members ──
  members: {
    list: (
      factionId: string,
      params?: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.get<PaginatedMembers>(
        API_ROUTES.factions.members.list(factionId),
        params,
        opts
      ),
    kick: (
      factionId: string,
      data: { factionUserId: string; reason?: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(API_ROUTES.factions.members.kick(factionId), data, opts),
  },

  // ── Permissions ──
  permissions: {
    get: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<{ permissions: string[] }>(
        API_ROUTES.factions.permissions(factionId),
        undefined,
        opts
      ),
  },

  // ── Ranks ──
  ranks: {
    list: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<RankWithDetails[]>(
        API_ROUTES.factions.ranks(factionId),
        undefined,
        opts
      ),
    get: (factionId: string, rankId: string, opts?: RequestOptions) =>
      apiClient.get<RankWithDetails>(
        API_ROUTES.factions.rank(factionId, rankId),
        undefined,
        opts
      ),
    create: (factionId: string, data: RankPayload, opts?: RequestOptions) =>
      apiClient.post<Rank>(API_ROUTES.factions.ranks(factionId), data, opts),
    update: (
      factionId: string,
      rankId: string,
      data: RankPayload,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Rank>(
        API_ROUTES.factions.rank(factionId, rankId),
        data,
        opts
      ),
    delete: (factionId: string, rankId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(API_ROUTES.factions.rank(factionId, rankId), opts),
    reorder: (
      factionId: string,
      data: ReorderRanksPayload,
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.factions.reorderRanks(factionId),
        data,
        opts
      ),
    promote: (
      factionId: string,
      data: { factionUserId: string; reason?: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(API_ROUTES.factions.promote(factionId), data, opts),
    demote: (
      factionId: string,
      data: { factionUserId: string; reason?: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(API_ROUTES.factions.demote(factionId), data, opts),
    getPermissions: (
      factionId: string,
      rankId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<Permission[]>(
        API_ROUTES.factions.rankPermissions(factionId, rankId),
        undefined,
        opts
      ),
    setPermissions: (
      factionId: string,
      rankId: string,
      permissionIds: string[],
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.factions.rankPermissions(factionId, rankId),
        { permissionIds },
        opts
      ),
  },

  // ── Promotion Paths ──
  promotionPaths: {
    list: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<PromotionPath[]>(
        API_ROUTES.factions.promotionPaths(factionId),
        undefined,
        opts
      ),
    create: (
      factionId: string,
      data: PromotionPathPayload,
      opts?: RequestOptions
    ) =>
      apiClient.post<PromotionPath>(
        API_ROUTES.factions.promotionPaths(factionId),
        data,
        opts
      ),
    update: (
      factionId: string,
      pathId: string,
      data: PromotionPathPayload,
      opts?: RequestOptions
    ) =>
      apiClient.patch<PromotionPath>(
        API_ROUTES.factions.promotionPath(factionId, pathId),
        data,
        opts
      ),
    delete: (factionId: string, pathId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        API_ROUTES.factions.promotionPath(factionId, pathId),
        opts
      ),
  },

  // ── Events ──
  events: {
    list: (factionId: string, params?: Record<string, unknown>, opts?: RequestOptions) =>
      apiClient.get<Event[]>(
        API_ROUTES.factions.events.list(factionId),
        params,
        opts
      ),
    create: (factionId: string, data: Partial<Event>, opts?: RequestOptions) =>
      apiClient.post<Event>(
        API_ROUTES.factions.events.create(factionId),
        data,
        opts
      ),
    update: (
      factionId: string,
      eventId: string,
      data: Partial<Event>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Event>(
        API_ROUTES.factions.events.update(factionId, eventId),
        data,
        opts
      ),
    start: (factionId: string, eventId: string, opts?: RequestOptions) =>
      apiClient.post<Event>(
        API_ROUTES.factions.events.start(factionId, eventId),
        undefined,
        opts
      ),
    cancel: (factionId: string, eventId: string, opts?: RequestOptions) =>
      apiClient.post<Event>(
        API_ROUTES.factions.events.cancel(factionId, eventId),
        undefined,
        opts
      ),
    upcoming: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<Event[]>(
        API_ROUTES.factions.events.upcoming(factionId),
        undefined,
        opts
      ),
    active: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<Event[]>(
        API_ROUTES.factions.events.active(factionId),
        undefined,
        opts
      ),
  },

  // ── Event Requests ──
  eventRequests: {
    list: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<EventRequest[]>(
        API_ROUTES.factions.eventRequests.list(factionId),
        undefined,
        opts
      ),
    create: (
      factionId: string,
      data: Partial<EventRequest>,
      opts?: RequestOptions
    ) =>
      apiClient.post<EventRequest>(
        API_ROUTES.factions.eventRequests.create(factionId),
        data,
        opts
      ),
    approve: (
      factionId: string,
      requestId: string,
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.factions.eventRequests.approve(factionId, requestId),
        undefined,
        opts
      ),
    deny: (factionId: string, requestId: string, opts?: RequestOptions) =>
      apiClient.post<void>(
        API_ROUTES.factions.eventRequests.deny(factionId, requestId),
        undefined,
        opts
      ),
  },

  // ── Templates ──
  templates: {
    listEmbeds: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<EmbedTemplate[]>(
        API_ROUTES.factions.templates.embeds(factionId),
        undefined,
        opts
      ),
    getEmbed: (factionId: string, templateId: string, opts?: RequestOptions) =>
      apiClient.get<EmbedTemplate>(
        API_ROUTES.factions.templates.embed(factionId, templateId),
        undefined,
        opts
      ),
    createEmbed: (
      factionId: string,
      data: Partial<EmbedTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.post<EmbedTemplate>(
        API_ROUTES.factions.templates.embeds(factionId),
        data,
        opts
      ),
    updateEmbed: (
      factionId: string,
      templateId: string,
      data: Partial<EmbedTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<EmbedTemplate>(
        API_ROUTES.factions.templates.embed(factionId, templateId),
        data,
        opts
      ),
    deleteEmbed: (
      factionId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.factions.templates.embed(factionId, templateId),
        opts
      ),
    listContainers: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<ContainerTemplate[]>(
        API_ROUTES.factions.templates.containers(factionId),
        undefined,
        opts
      ),
    getContainer: (
      factionId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<ContainerTemplate>(
        API_ROUTES.factions.templates.container(factionId, templateId),
        undefined,
        opts
      ),
    createContainer: (
      factionId: string,
      data: Partial<ContainerTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.post<ContainerTemplate>(
        API_ROUTES.factions.templates.containers(factionId),
        data,
        opts
      ),
    updateContainer: (
      factionId: string,
      templateId: string,
      data: Partial<ContainerTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<ContainerTemplate>(
        API_ROUTES.factions.templates.container(factionId, templateId),
        data,
        opts
      ),
    deleteContainer: (
      factionId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.factions.templates.container(factionId, templateId),
        opts
      ),
    listTexts: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<TextTemplate[]>(
        API_ROUTES.factions.templates.texts(factionId),
        undefined,
        opts
      ),
    getText: (
      factionId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<TextTemplate>(
        API_ROUTES.factions.templates.text(factionId, templateId),
        undefined,
        opts
      ),
    createText: (
      factionId: string,
      data: Partial<TextTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.post<TextTemplate>(
        API_ROUTES.factions.templates.texts(factionId),
        data,
        opts
      ),
    updateText: (
      factionId: string,
      templateId: string,
      data: Partial<TextTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<TextTemplate>(
        API_ROUTES.factions.templates.text(factionId, templateId),
        data,
        opts
      ),
    deleteText: (
      factionId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.factions.templates.text(factionId, templateId),
        opts
      ),
  },

  // ── Stats ──
  stats: {
    overview: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<FactionStats>(
        API_ROUTES.factions.stats.overview(factionId),
        undefined,
        opts
      ),
    daily: (
      factionId: string,
      params?: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.get<DailyStats[]>(
        API_ROUTES.factions.stats.daily(factionId),
        params,
        opts
      ),
    leaderboard: (
      factionId: string,
      params?: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.get<LeaderboardEntry[]>(
        API_ROUTES.factions.stats.leaderboard(factionId),
        params,
        opts
      ),
  },

  // ── Moderation ──
  moderation: {
    punish: (
      factionId: string,
      data: Partial<Punishment>,
      opts?: RequestOptions
    ) =>
      apiClient.post<Punishment>(
        API_ROUTES.factions.moderation.punish(factionId),
        data,
        opts
      ),
    revoke: (
      factionId: string,
      punishmentId: string,
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.factions.moderation.revoke(factionId, punishmentId),
        undefined,
        opts
      ),
    appeal: (
      factionId: string,
      punishmentId: string,
      data: { appealText: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<PunishmentAppeal>(
        API_ROUTES.factions.moderation.appeal(factionId, punishmentId),
        data,
        opts
      ),
    listAppeals: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<PunishmentAppeal[]>(
        API_ROUTES.factions.moderation.appeals(factionId),
        undefined,
        opts
      ),
    reviewAppeal: (
      factionId: string,
      appealId: string,
      data: { status: string; reviewNote?: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.factions.moderation.reviewAppeal(factionId, appealId),
        data,
        opts
      ),
    getBlacklistConfig: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<BlacklistConfig>(
        API_ROUTES.factions.moderation.blacklistConfig(factionId),
        undefined,
        opts
      ),
    updateBlacklistConfig: (
      factionId: string,
      data: Partial<BlacklistConfig>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<BlacklistConfig>(
        API_ROUTES.factions.moderation.blacklistConfig(factionId),
        data,
        opts
      ),
    listNotifications: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<unknown[]>(
        API_ROUTES.factions.moderation.notifications(factionId),
        undefined,
        opts
      ),
    reviewNotification: (
      factionId: string,
      notificationId: string,
      data: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.factions.moderation.reviewNotification(
          factionId,
          notificationId
        ),
        data,
        opts
      ),
  },

  // ── Points ──
  points: {
    get: (
      factionId: string,
      factionUserId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<UserPoints>(
        API_ROUTES.factions.points.get(factionId, factionUserId),
        undefined,
        opts
      ),
    award: (
      factionId: string,
      data: { factionUserId: string; amount: number; reason: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.factions.points.award(factionId),
        data,
        opts
      ),
    deduct: (
      factionId: string,
      data: { factionUserId: string; amount: number; reason: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.factions.points.deduct(factionId),
        data,
        opts
      ),
    promotionFlags: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<PromotionFlag[]>(
        API_ROUTES.factions.points.promotionFlags(factionId),
        undefined,
        opts
      ),
    processFlags: (factionId: string, opts?: RequestOptions) =>
      apiClient.post<void>(
        API_ROUTES.factions.points.processFlags(factionId),
        undefined,
        opts
      ),
  },

  // ── Units ──
  units: {
    list: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<Unit[]>(
        API_ROUTES.factions.units.list(factionId),
        undefined,
        opts
      ),
    create: (
      factionId: string,
      data: Partial<Unit>,
      opts?: RequestOptions
    ) =>
      apiClient.post<Unit>(
        API_ROUTES.factions.units.create(factionId),
        data,
        opts
      ),
    update: (
      factionId: string,
      unitId: string,
      data: Partial<Unit>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Unit>(
        API_ROUTES.factions.units.update(factionId, unitId),
        data,
        opts
      ),
    delete: (factionId: string, unitId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        API_ROUTES.factions.units.delete(factionId, unitId),
        opts
      ),
    listMembers: (
      factionId: string,
      unitId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<UnitMember[]>(
        API_ROUTES.factions.units.members(factionId, unitId),
        undefined,
        opts
      ),
    addMember: (
      factionId: string,
      unitId: string,
      data: { factionUserId: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<UnitMember>(
        API_ROUTES.factions.units.addMember(factionId, unitId),
        data,
        opts
      ),
    removeMember: (
      factionId: string,
      unitId: string,
      factionUserId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.factions.units.removeMember(factionId, unitId, factionUserId),
        opts
      ),
  },

  // ── Billing ──
  billing: {
    getSubscription: (opts?: RequestOptions) =>
      apiClient.get<Subscription>(
        API_ROUTES.billing.subscription,
        undefined,
        opts
      ),
    createCheckout: (
      data: { priceId: string; factionId?: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<CheckoutSession>(
        API_ROUTES.billing.checkout,
        data,
        opts
      ),
  },

  // ── Blacklist ──
  blacklist: {
    get: (discordId: string, opts?: RequestOptions) =>
      apiClient.get<BlacklistEntry>(
        API_ROUTES.blacklist.get(discordId),
        undefined,
        opts
      ),
    create: (data: { discordId: string; reason: string }, opts?: RequestOptions) =>
      apiClient.post<BlacklistEntry>(API_ROUTES.blacklist.create, data, opts),
    delete: (discordId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(API_ROUTES.blacklist.delete(discordId), opts),
  },

  // ── Config ──
  config: {
    get: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<FactionConfig>(
        API_ROUTES.factions.config(factionId),
        undefined,
        opts
      ),
    update: (
      factionId: string,
      data: Partial<FactionConfig>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<FactionConfig>(
        API_ROUTES.factions.config(factionId),
        data,
        opts
      ),
    getWelcome: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<Record<string, unknown>>(
        API_ROUTES.factions.welcomeConfig(factionId),
        undefined,
        opts
      ),
    updateWelcome: (
      factionId: string,
      data: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Record<string, unknown>>(
        API_ROUTES.factions.welcomeConfig(factionId),
        data,
        opts
      ),
    getEventTypes: (factionId: string, opts?: RequestOptions) =>
      apiClient.get<EventType[]>(
        API_ROUTES.factions.eventTypes(factionId),
        undefined,
        opts
      ),
  },
};
