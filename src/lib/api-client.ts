import axios, { AxiosError } from "axios";
import { getSession } from "next-auth/react";
import type { ApiError, ApiResponse } from "@/types/api";
import type {
  Server,
  ServerMember,
  PaginatedMembers,
  ServerConfig,
} from "@/types/server";
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
  ModalTemplate,
  ScheduledMessage,
  MessageSend,
} from "@/types/template";
import type { ElementCatalogItem, ResolveElementsResponse } from "@/types/element";
import type { ServerStats, DailyStats, LeaderboardEntry } from "@/types/stats";
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

  // ── Servers ──
  servers: {
    byGuildIds: async (guildIds: string[], opts?: RequestOptions): Promise<Server[]> => {
      if (guildIds.length === 0) return [];
      const result = await apiClient.get<{ servers: Server[] }>(
        "/servers/by-guild-ids",
        { guildIds: guildIds.join(",") },
        opts
      );
      return result.servers ?? [];
    },
    list: async (opts?: RequestOptions) => {
      // Backend returns { items: [{ server, rankId }] } for the
      // authenticated user's servers. Normalize to a plain Server[]
      // for frontend consumers.
      const view = await apiClient.get<{
        items: { server: Server }[];
      }>(API_ROUTES.servers.list, undefined, opts);
      return view.items.map((item) => item.server);
    },
    get: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<Server>(API_ROUTES.servers.get(serverId), undefined, opts),
    create: (data: Partial<Server>, opts?: RequestOptions) =>
      apiClient.post<Server>(API_ROUTES.servers.create, data, opts),
    update: (
      serverId: string,
      data: Partial<Pick<Server, "name" | "description" | "iconUrl">>,
      opts?: RequestOptions
    ) => apiClient.patch<Server>(API_ROUTES.servers.update(serverId), data, opts),
    delete: (serverId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(API_ROUTES.servers.delete(serverId), opts),
  },

  // ── Members ──
  members: {
    list: (
      serverId: string,
      params?: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.get<PaginatedMembers>(
        API_ROUTES.servers.members.list(serverId),
        params,
        opts
      ),
    kick: (
      serverId: string,
      data: { serverUserId: string; reason?: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(API_ROUTES.servers.members.kick(serverId), data, opts),
  },

  // ── Permissions ──
  permissions: {
    get: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<{ permissions: string[] }>(
        API_ROUTES.servers.permissions(serverId),
        undefined,
        opts
      ),
  },

  // ── Ranks ──
  ranks: {
    list: async (serverId: string, opts?: RequestOptions) => {
      const result = await apiClient.get<{ ranks: RankWithDetails[] }>(
        API_ROUTES.servers.ranks(serverId),
        undefined,
        opts
      );
      return result.ranks ?? [];
    },
    get: (serverId: string, rankId: string, opts?: RequestOptions) =>
      apiClient.get<RankWithDetails>(
        API_ROUTES.servers.rank(serverId, rankId),
        undefined,
        opts
      ),
    create: (serverId: string, data: RankPayload, opts?: RequestOptions) =>
      apiClient.post<Rank>(API_ROUTES.servers.ranks(serverId), data, opts),
    update: (
      serverId: string,
      rankId: string,
      data: RankPayload,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Rank>(
        API_ROUTES.servers.rank(serverId, rankId),
        data,
        opts
      ),
    delete: (serverId: string, rankId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(API_ROUTES.servers.rank(serverId, rankId), opts),
    reorder: (
      serverId: string,
      data: ReorderRanksPayload,
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.servers.reorderRanks(serverId),
        data,
        opts
      ),
    promote: (
      serverId: string,
      data: { serverUserId: string; reason?: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(API_ROUTES.servers.promote(serverId), data, opts),
    demote: (
      serverId: string,
      data: { serverUserId: string; reason?: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(API_ROUTES.servers.demote(serverId), data, opts),
    getPermissions: (
      serverId: string,
      rankId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<Permission[]>(
        API_ROUTES.servers.rankPermissions(serverId, rankId),
        undefined,
        opts
      ),
    setPermissions: (
      serverId: string,
      rankId: string,
      permissionIds: string[],
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.servers.rankPermissions(serverId, rankId),
        { permissionIds },
        opts
      ),
  },

  // ── Promotion Paths ──
  promotionPaths: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<PromotionPath[]>(
        API_ROUTES.servers.promotionPaths(serverId),
        undefined,
        opts
      ),
    create: (
      serverId: string,
      data: PromotionPathPayload,
      opts?: RequestOptions
    ) =>
      apiClient.post<PromotionPath>(
        API_ROUTES.servers.promotionPaths(serverId),
        data,
        opts
      ),
    update: (
      serverId: string,
      pathId: string,
      data: PromotionPathPayload,
      opts?: RequestOptions
    ) =>
      apiClient.patch<PromotionPath>(
        API_ROUTES.servers.promotionPath(serverId, pathId),
        data,
        opts
      ),
    delete: (serverId: string, pathId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        API_ROUTES.servers.promotionPath(serverId, pathId),
        opts
      ),
  },

  // ── Events ──
  events: {
    list: (serverId: string, params?: Record<string, unknown>, opts?: RequestOptions) =>
      apiClient.get<Event[]>(
        API_ROUTES.servers.events.list(serverId),
        params,
        opts
      ),
    create: (serverId: string, data: Partial<Event>, opts?: RequestOptions) =>
      apiClient.post<Event>(
        API_ROUTES.servers.events.create(serverId),
        data,
        opts
      ),
    update: (
      serverId: string,
      eventId: string,
      data: Partial<Event>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Event>(
        API_ROUTES.servers.events.update(serverId, eventId),
        data,
        opts
      ),
    start: (serverId: string, eventId: string, opts?: RequestOptions) =>
      apiClient.post<Event>(
        API_ROUTES.servers.events.start(serverId, eventId),
        undefined,
        opts
      ),
    cancel: (serverId: string, eventId: string, opts?: RequestOptions) =>
      apiClient.post<Event>(
        API_ROUTES.servers.events.cancel(serverId, eventId),
        undefined,
        opts
      ),
    upcoming: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<Event[]>(
        API_ROUTES.servers.events.upcoming(serverId),
        undefined,
        opts
      ),
    active: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<Event[]>(
        API_ROUTES.servers.events.active(serverId),
        undefined,
        opts
      ),
  },

  // ── Event Requests ──
  eventRequests: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<EventRequest[]>(
        API_ROUTES.servers.eventRequests.list(serverId),
        undefined,
        opts
      ),
    create: (
      serverId: string,
      data: Partial<EventRequest>,
      opts?: RequestOptions
    ) =>
      apiClient.post<EventRequest>(
        API_ROUTES.servers.eventRequests.create(serverId),
        data,
        opts
      ),
    approve: (
      serverId: string,
      requestId: string,
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.servers.eventRequests.approve(serverId, requestId),
        undefined,
        opts
      ),
    deny: (serverId: string, requestId: string, opts?: RequestOptions) =>
      apiClient.post<void>(
        API_ROUTES.servers.eventRequests.deny(serverId, requestId),
        undefined,
        opts
      ),
  },

  // ── Templates ──
  templates: {
    listEmbeds: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<EmbedTemplate[]>(
        API_ROUTES.servers.templates.embeds(serverId),
        undefined,
        opts
      ),
    getEmbed: (serverId: string, templateId: string, opts?: RequestOptions) =>
      apiClient.get<EmbedTemplate>(
        API_ROUTES.servers.templates.embed(serverId, templateId),
        undefined,
        opts
      ),
    createEmbed: (
      serverId: string,
      data: Partial<EmbedTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.post<EmbedTemplate>(
        API_ROUTES.servers.templates.embeds(serverId),
        data,
        opts
      ),
    updateEmbed: (
      serverId: string,
      templateId: string,
      data: Partial<EmbedTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<EmbedTemplate>(
        API_ROUTES.servers.templates.embed(serverId, templateId),
        data,
        opts
      ),
    deleteEmbed: (
      serverId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.servers.templates.embed(serverId, templateId),
        opts
      ),
    listContainers: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<ContainerTemplate[]>(
        API_ROUTES.servers.templates.containers(serverId),
        undefined,
        opts
      ),
    getContainer: (
      serverId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<ContainerTemplate>(
        API_ROUTES.servers.templates.container(serverId, templateId),
        undefined,
        opts
      ),
    createContainer: (
      serverId: string,
      data: Partial<ContainerTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.post<ContainerTemplate>(
        API_ROUTES.servers.templates.containers(serverId),
        data,
        opts
      ),
    updateContainer: (
      serverId: string,
      templateId: string,
      data: Partial<ContainerTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<ContainerTemplate>(
        API_ROUTES.servers.templates.container(serverId, templateId),
        data,
        opts
      ),
    deleteContainer: (
      serverId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.servers.templates.container(serverId, templateId),
        opts
      ),
    listTexts: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<TextTemplate[]>(
        API_ROUTES.servers.templates.texts(serverId),
        undefined,
        opts
      ),
    getText: (
      serverId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<TextTemplate>(
        API_ROUTES.servers.templates.text(serverId, templateId),
        undefined,
        opts
      ),
    createText: (
      serverId: string,
      data: Partial<TextTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.post<TextTemplate>(
        API_ROUTES.servers.templates.texts(serverId),
        data,
        opts
      ),
    updateText: (
      serverId: string,
      templateId: string,
      data: Partial<TextTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<TextTemplate>(
        API_ROUTES.servers.templates.text(serverId, templateId),
        data,
        opts
      ),
    deleteText: (
      serverId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.servers.templates.text(serverId, templateId),
        opts
      ),
    listModals: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<ModalTemplate[]>(
        API_ROUTES.servers.templates.modals(serverId),
        undefined,
        opts
      ),
    getModal: (serverId: string, templateId: string, opts?: RequestOptions) =>
      apiClient.get<ModalTemplate>(
        API_ROUTES.servers.templates.modal(serverId, templateId),
        undefined,
        opts
      ),
    createModal: (
      serverId: string,
      data: Partial<ModalTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.post<ModalTemplate>(
        API_ROUTES.servers.templates.modals(serverId),
        data,
        opts
      ),
    updateModal: (
      serverId: string,
      templateId: string,
      data: Partial<ModalTemplate>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<ModalTemplate>(
        API_ROUTES.servers.templates.modal(serverId, templateId),
        data,
        opts
      ),
    deleteModal: (
      serverId: string,
      templateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.servers.templates.modal(serverId, templateId),
        opts
      ),
  },

  // ── Elements ──
  elements: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<ElementCatalogItem[]>(
        API_ROUTES.servers.elements.list(serverId),
        undefined,
        opts
      ),
    create: (
      serverId: string,
      data: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.post<ElementCatalogItem>(
        API_ROUTES.servers.elements.create(serverId),
        data,
        opts
      ),
    resolve: (
      serverId: string,
      input: string,
      opts?: RequestOptions
    ) =>
      apiClient.post<ResolveElementsResponse>(
        API_ROUTES.servers.elements.resolve(serverId),
        { input },
        opts
      ),
  },

  // ── Stats ──
  stats: {
    overview: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<ServerStats>(
        API_ROUTES.servers.stats.overview(serverId),
        undefined,
        opts
      ),
    daily: (
      serverId: string,
      params?: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.get<DailyStats[]>(
        API_ROUTES.servers.stats.daily(serverId),
        params,
        opts
      ),
    leaderboard: (
      serverId: string,
      params?: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.get<LeaderboardEntry[]>(
        API_ROUTES.servers.stats.leaderboard(serverId),
        params,
        opts
      ),
  },

  // ── Moderation ──
  moderation: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<Punishment[]>(
        API_ROUTES.servers.moderation.punish(serverId),
        undefined,
        opts
      ),
    punish: (
      serverId: string,
      data: Partial<Punishment>,
      opts?: RequestOptions
    ) =>
      apiClient.post<Punishment>(
        API_ROUTES.servers.moderation.punish(serverId),
        data,
        opts
      ),
    revoke: (
      serverId: string,
      punishmentId: string,
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.servers.moderation.revoke(serverId, punishmentId),
        undefined,
        opts
      ),
    appeal: (
      serverId: string,
      punishmentId: string,
      data: { appealText: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<PunishmentAppeal>(
        API_ROUTES.servers.moderation.appeal(serverId, punishmentId),
        data,
        opts
      ),
    listAppeals: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<PunishmentAppeal[]>(
        API_ROUTES.servers.moderation.appeals(serverId),
        undefined,
        opts
      ),
    reviewAppeal: (
      serverId: string,
      appealId: string,
      data: { status: string; reviewNote?: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.servers.moderation.reviewAppeal(serverId, appealId),
        data,
        opts
      ),
    getBlacklistConfig: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<BlacklistConfig>(
        API_ROUTES.servers.moderation.blacklistConfig(serverId),
        undefined,
        opts
      ),
    updateBlacklistConfig: (
      serverId: string,
      data: Partial<BlacklistConfig>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<BlacklistConfig>(
        API_ROUTES.servers.moderation.blacklistConfig(serverId),
        data,
        opts
      ),
    listNotifications: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<unknown[]>(
        API_ROUTES.servers.moderation.notifications(serverId),
        undefined,
        opts
      ),
    reviewNotification: (
      serverId: string,
      notificationId: string,
      data: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.servers.moderation.reviewNotification(
          serverId,
          notificationId
        ),
        data,
        opts
      ),
  },

  // ── Points ──
  points: {
    get: (
      serverId: string,
      serverUserId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<UserPoints>(
        API_ROUTES.servers.points.get(serverId, serverUserId),
        undefined,
        opts
      ),
    award: (
      serverId: string,
      data: { serverUserId: string; amount: number; reason: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.servers.points.award(serverId),
        data,
        opts
      ),
    deduct: (
      serverId: string,
      data: { serverUserId: string; amount: number; reason: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<void>(
        API_ROUTES.servers.points.deduct(serverId),
        data,
        opts
      ),
    promotionFlags: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<PromotionFlag[]>(
        API_ROUTES.servers.points.promotionFlags(serverId),
        undefined,
        opts
      ),
    processFlags: (serverId: string, opts?: RequestOptions) =>
      apiClient.post<void>(
        API_ROUTES.servers.points.processFlags(serverId),
        undefined,
        opts
      ),
  },

  // ── Units ──
  units: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<Unit[]>(
        API_ROUTES.servers.units.list(serverId),
        undefined,
        opts
      ),
    create: (
      serverId: string,
      data: Partial<Unit>,
      opts?: RequestOptions
    ) =>
      apiClient.post<Unit>(
        API_ROUTES.servers.units.create(serverId),
        data,
        opts
      ),
    update: (
      serverId: string,
      unitId: string,
      data: Partial<Unit>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Unit>(
        API_ROUTES.servers.units.update(serverId, unitId),
        data,
        opts
      ),
    delete: (serverId: string, unitId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        API_ROUTES.servers.units.delete(serverId, unitId),
        opts
      ),
    listMembers: (
      serverId: string,
      unitId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<UnitMember[]>(
        API_ROUTES.servers.units.members(serverId, unitId),
        undefined,
        opts
      ),
    addMember: (
      serverId: string,
      unitId: string,
      data: { serverUserId: string },
      opts?: RequestOptions
    ) =>
      apiClient.post<UnitMember>(
        API_ROUTES.servers.units.addMember(serverId, unitId),
        data,
        opts
      ),
    removeMember: (
      serverId: string,
      unitId: string,
      serverUserId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.servers.units.removeMember(serverId, unitId, serverUserId),
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
      data: { priceId: string; serverId?: string },
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

  // ── Messages (send to Discord) ──
  messages: {
    send: (
      serverId: string,
      data: {
        channel_id?: string;
        webhook_urls?: string[];
        webhook_username?: string;
        webhook_avatar_url?: string;
        template_type: string;
        template_id: string;
      },
      opts?: RequestOptions
    ) =>
      apiClient.post<MessageSend>(
        API_ROUTES.servers.messageSend(serverId),
        data,
        opts
      ),
    history: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<MessageSend[]>(
        API_ROUTES.servers.messageHistory(serverId),
        undefined,
        opts
      ),
  },

  // ── Schedule ──
  schedule: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<ScheduledMessage[]>(
        API_ROUTES.servers.schedule.list(serverId),
        undefined,
        opts
      ),
    create: (serverId: string, data: Partial<ScheduledMessage>, opts?: RequestOptions) =>
      apiClient.post<ScheduledMessage>(
        API_ROUTES.servers.schedule.list(serverId),
        data,
        opts
      ),
    delete: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        API_ROUTES.servers.schedule.detail(serverId, id),
        opts
      ),
  },

  // ── Config ──
  config: {
    get: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<ServerConfig>(
        API_ROUTES.servers.config(serverId),
        undefined,
        opts
      ),
    update: (
      serverId: string,
      data: Partial<ServerConfig>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<ServerConfig>(
        API_ROUTES.servers.config(serverId),
        data,
        opts
      ),
    getWelcome: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<Record<string, unknown>>(
        API_ROUTES.servers.welcomeConfig(serverId),
        undefined,
        opts
      ),
    updateWelcome: (
      serverId: string,
      data: Record<string, unknown>,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Record<string, unknown>>(
        API_ROUTES.servers.welcomeConfig(serverId),
        data,
        opts
      ),
    getEventTypes: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<EventType[]>(
        API_ROUTES.servers.eventTypes(serverId),
        undefined,
        opts
      ),
  },
};
