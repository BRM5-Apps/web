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
  ModalElementRegistration,
  CreateScheduledMessageRequest,
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
import type { Unit, UnitMember, UnitTreeNode, UnitCapPayload, MoveUnitPayload } from "@/types/unit";
import type { Position, PositionWithHolders, PositionAssignment, PositionPayload, AssignPositionPayload } from "@/types/position";
import type { RankBranch, MemberBranchProgress, BranchPayload, PathOrderPayload } from "@/types/branch";
import type { Notification, NotificationListResponse } from "@/types/notification";
import type { Subscription, CheckoutSession } from "@/types/billing";
import type { User, UserProfile } from "@/types/user";
import type {
  ContentFolder,
  ContentFolderItem,
  ContentFolderRating,
  ContentFolderImport,
  CreateContentFolderRequest,
  UpdateContentFolderRequest,
  AddItemToFolderRequest,
  MoveContentFolderItemRequest,
  CreateContentFolderRatingRequest,
} from "@/types/content-folder";
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

  async put<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const res = await axiosInstance.put<ApiResponse<T>>(url, body, {
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
    get: (serverId: string, opts?: RequestOptions) => {
      // Backend returns ServerWithMeta { server: Server, member_count }
      return apiClient.get<{ server: Server; member_count: number }>(API_ROUTES.servers.get(serverId), undefined, opts);
    },
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

  // ── Modal Elements ──
  modalElements: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<ModalElementRegistration[]>(
        API_ROUTES.servers.modalElements.list(serverId),
        undefined,
        opts
      ),
    listByModal: (
      serverId: string,
      modalTemplateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<ModalElementRegistration[]>(
        API_ROUTES.servers.modalElements.listByModal(serverId, modalTemplateId),
        undefined,
        opts
      ),
    sync: (
      serverId: string,
      data: {
        modal_template_id: string;
        modal_name: string;
        fields: Array<{
          field_id: string;
          field_type: string;
          field_label: string;
          is_required: boolean;
        }>;
      },
      opts?: RequestOptions
    ) =>
      apiClient.post<ModalElementRegistration[]>(
        API_ROUTES.servers.modalElements.sync(serverId),
        data,
        opts
      ),
    deleteByModal: (
      serverId: string,
      modalTemplateId: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        API_ROUTES.servers.modalElements.deleteByModal(serverId, modalTemplateId),
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
    getTree: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<UnitTreeNode[]>(
        API_ROUTES.servers.units.tree(serverId),
        undefined,
        opts
      ),
    setCap: (
      serverId: string,
      unitId: string,
      data: UnitCapPayload,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Unit>(
        API_ROUTES.servers.units.setCap(serverId, unitId),
        data,
        opts
      ),
    move: (
      serverId: string,
      unitId: string,
      data: MoveUnitPayload,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Unit>(
        API_ROUTES.servers.units.move(serverId, unitId),
        data,
        opts
      ),
  },

  // ── Positions ──
  positions: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<PositionWithHolders[]>(
        API_ROUTES.servers.positions.list(serverId),
        undefined,
        opts
      ),
    get: (serverId: string, positionId: string, opts?: RequestOptions) =>
      apiClient.get<PositionWithHolders>(
        API_ROUTES.servers.positions.get(serverId, positionId),
        undefined,
        opts
      ),
    create: (serverId: string, data: PositionPayload, opts?: RequestOptions) =>
      apiClient.post<Position>(
        API_ROUTES.servers.positions.create(serverId),
        data,
        opts
      ),
    update: (
      serverId: string,
      positionId: string,
      data: PositionPayload,
      opts?: RequestOptions
    ) =>
      apiClient.patch<Position>(
        API_ROUTES.servers.positions.update(serverId, positionId),
        data,
        opts
      ),
    delete: (serverId: string, positionId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        API_ROUTES.servers.positions.delete(serverId, positionId),
        opts
      ),
    assign: (
      serverId: string,
      positionId: string,
      data: AssignPositionPayload,
      opts?: RequestOptions
    ) =>
      apiClient.post<PositionAssignment>(
        API_ROUTES.servers.positions.assign(serverId, positionId),
        data,
        opts
      ),
    unassign: (serverId: string, assignmentId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        API_ROUTES.servers.positions.unassign(serverId, assignmentId),
        opts
      ),
    getHolders: (
      serverId: string,
      positionId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<PositionAssignment[]>(
        API_ROUTES.servers.positions.holders(serverId, positionId),
        undefined,
        opts
      ),
    getMemberPositions: (
      serverId: string,
      serverUserId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<PositionAssignment[]>(
        API_ROUTES.servers.positions.memberPositions(serverId, serverUserId),
        undefined,
        opts
      ),
  },

  // ── Branches (RankBranch) ──
  branches: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<RankBranch[]>(
        API_ROUTES.servers.branches.list(serverId),
        undefined,
        opts
      ),
    get: (serverId: string, branchId: string, opts?: RequestOptions) =>
      apiClient.get<RankBranch>(
        API_ROUTES.servers.branches.get(serverId, branchId),
        undefined,
        opts
      ),
    create: (serverId: string, data: BranchPayload, opts?: RequestOptions) =>
      apiClient.post<RankBranch>(
        API_ROUTES.servers.branches.create(serverId),
        data,
        opts
      ),
    update: (
      serverId: string,
      branchId: string,
      data: BranchPayload,
      opts?: RequestOptions
    ) =>
      apiClient.patch<RankBranch>(
        API_ROUTES.servers.branches.update(serverId, branchId),
        data,
        opts
      ),
    delete: (serverId: string, branchId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        API_ROUTES.servers.branches.delete(serverId, branchId),
        opts
      ),
    updatePathOrder: (
      serverId: string,
      branchId: string,
      data: PathOrderPayload,
      opts?: RequestOptions
    ) =>
      apiClient.patch<RankBranch>(
        API_ROUTES.servers.branches.updatePathOrder(serverId, branchId),
        data,
        opts
      ),
    getMemberProgress: (
      serverId: string,
      serverUserId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<MemberBranchProgress[]>(
        API_ROUTES.servers.branches.memberProgress(serverId, serverUserId),
        undefined,
        opts
      ),
  },

  // ── Notifications ──
  notifications: {
    list: (
      serverId: string,
      params?: { page?: number; limit?: number; unreadOnly?: boolean },
      opts?: RequestOptions
    ) =>
      apiClient.get<NotificationListResponse>(
        API_ROUTES.servers.notifications.list(serverId),
        params,
        opts
      ),
    markRead: (serverId: string, notificationId: string, opts?: RequestOptions) =>
      apiClient.patch<Notification>(
        API_ROUTES.servers.notifications.markRead(serverId, notificationId),
        undefined,
        opts
      ),
    markAllRead: (serverId: string, opts?: RequestOptions) =>
      apiClient.post<void>(
        API_ROUTES.servers.notifications.markAllRead(serverId),
        undefined,
        opts
      ),
  },

  // ── Member Profile ──
  memberProfile: {
    get: (serverId: string, serverUserId: string, opts?: RequestOptions) =>
      apiClient.get<{
        member: ServerMember;
        profile: {
          joinedAt: string;
          lastActiveAt?: string;
          totalPoints: number;
          currentRankId?: string;
          currentRank?: { id: string; name: string };
          primaryUnitId?: string;
          primaryUnit?: { id: string; name: string };
        };
      }>(
        API_ROUTES.servers.memberProfile.get(serverId, serverUserId),
        undefined,
        opts
      ),
    getRankHistory: (
      serverId: string,
      serverUserId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<
        Array<{
          id: string;
          fromRankId?: string;
          toRankId: string;
          fromRank?: { id: string; name: string };
          toRank: { id: string; name: string };
          reason?: string;
          changedBy: string;
          changedByUser?: { id: string; username: string };
          createdAt: string;
        }>
      >(
        API_ROUTES.servers.memberProfile.rankHistory(serverId, serverUserId),
        undefined,
        opts
      ),
    getUnitHistory: (
      serverId: string,
      serverUserId: string,
      opts?: RequestOptions
    ) =>
      apiClient.get<
        Array<{
          id: string;
          fromUnitId?: string;
          toUnitId: string;
          fromUnit?: { id: string; name: string };
          toUnit: { id: string; name: string };
          reason?: string;
          changedBy: string;
          changedByUser?: { id: string; username: string };
          createdAt: string;
        }>
      >(
        API_ROUTES.servers.memberProfile.unitHistory(serverId, serverUserId),
        undefined,
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
    quickSend: (
      serverId: string,
      data: {
        channel_id?: string;
        webhook_urls?: string[];
        webhook_username?: string;
        webhook_avatar_url?: string;
        message_type: string;
        content: unknown;
      },
      opts?: RequestOptions
    ) =>
      apiClient.post<MessageSend>(
        API_ROUTES.servers.messageQuickSend(serverId),
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
    create: (serverId: string, data: CreateScheduledMessageRequest, opts?: RequestOptions) =>
      apiClient.post<ScheduledMessage>(
        API_ROUTES.servers.schedule.list(serverId),
        data,
        opts
      ),
    update: (serverId: string, id: string, data: Partial<CreateScheduledMessageRequest>, opts?: RequestOptions) =>
      apiClient.patch<ScheduledMessage>(
        API_ROUTES.servers.schedule.detail(serverId, id),
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

  // ── Platform Extensions ──
  webhookTriggers: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").WebhookTrigger[]>(
        `/servers/${serverId}/webhook-triggers`,
        undefined,
        opts
      ),
    get: (serverId: string, triggerId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").WebhookTrigger>(
        `/servers/${serverId}/webhook-triggers/${triggerId}`,
        undefined,
        opts
      ),
    create: (serverId: string, data: import("@/types/platform-extensions").CreateWebhookTriggerPayload, opts?: RequestOptions) =>
      apiClient.post<import("@/types/platform-extensions").WebhookTrigger>(
        `/servers/${serverId}/webhook-triggers`,
        data,
        opts
      ),
    update: (serverId: string, triggerId: string, data: import("@/types/platform-extensions").UpdateWebhookTriggerPayload, opts?: RequestOptions) =>
      apiClient.patch<import("@/types/platform-extensions").WebhookTrigger>(
        `/servers/${serverId}/webhook-triggers/${triggerId}`,
        data,
        opts
      ),
    delete: (serverId: string, triggerId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/webhook-triggers/${triggerId}`, opts),
    history: (serverId: string, triggerId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").WebhookTriggerExecution[]>(
        `/servers/${serverId}/webhook-triggers/${triggerId}/history`,
        undefined,
        opts
      ),
  },

  scheduledSequences: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").ScheduledSequence[]>(
        `/servers/${serverId}/scheduled-sequences`,
        undefined,
        opts
      ),
    get: (serverId: string, sequenceId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").ScheduledSequence>(
        `/servers/${serverId}/scheduled-sequences/${sequenceId}`,
        undefined,
        opts
      ),
    create: (serverId: string, data: import("@/types/platform-extensions").CreateScheduledSequencePayload, opts?: RequestOptions) =>
      apiClient.post<import("@/types/platform-extensions").ScheduledSequence>(
        `/servers/${serverId}/scheduled-sequences`,
        data,
        opts
      ),
    update: (serverId: string, sequenceId: string, data: import("@/types/platform-extensions").UpdateScheduledSequencePayload, opts?: RequestOptions) =>
      apiClient.patch<import("@/types/platform-extensions").ScheduledSequence>(
        `/servers/${serverId}/scheduled-sequences/${sequenceId}`,
        data,
        opts
      ),
    delete: (serverId: string, sequenceId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/scheduled-sequences/${sequenceId}`, opts),
    duplicate: (serverId: string, sequenceId: string, opts?: RequestOptions) =>
      apiClient.post<import("@/types/platform-extensions").ScheduledSequence>(
        `/servers/${serverId}/scheduled-sequences/${sequenceId}/duplicate`,
        undefined,
        opts
      ),
    execute: (serverId: string, sequenceId: string, opts?: RequestOptions) =>
      apiClient.post<void>(`/servers/${serverId}/scheduled-sequences/${sequenceId}/execute`, undefined, opts),
    history: (serverId: string, sequenceId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").ScheduledSequenceExecution[]>(
        `/servers/${serverId}/scheduled-sequences/${sequenceId}/history`,
        undefined,
        opts
      ),
    validateCron: (data: { cron_expression: string; timezone?: string }, opts?: RequestOptions) =>
      apiClient.post<import("@/types/platform-extensions").CronValidationResult>(
        `/scheduled-sequences/validate-cron`,
        data,
        opts
      ),
  },

  multiStepModules: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MultiStepModule[]>(
        `/servers/${serverId}/multi-step-modules`,
        undefined,
        opts
      ),
    get: (serverId: string, moduleId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MultiStepModule>(
        `/servers/${serverId}/multi-step-modules/${moduleId}`,
        undefined,
        opts
      ),
    create: (serverId: string, data: import("@/types/platform-extensions").CreateMultiStepModulePayload, opts?: RequestOptions) =>
      apiClient.post<import("@/types/platform-extensions").MultiStepModule>(
        `/servers/${serverId}/multi-step-modules`,
        data,
        opts
      ),
    update: (serverId: string, moduleId: string, data: import("@/types/platform-extensions").UpdateMultiStepModulePayload, opts?: RequestOptions) =>
      apiClient.patch<import("@/types/platform-extensions").MultiStepModule>(
        `/servers/${serverId}/multi-step-modules/${moduleId}`,
        data,
        opts
      ),
    delete: (serverId: string, moduleId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/multi-step-modules/${moduleId}`, opts),
    addStep: (serverId: string, moduleId: string, data: import("@/types/platform-extensions").AddModuleStepPayload, opts?: RequestOptions) =>
      apiClient.post<import("@/types/platform-extensions").ModuleStep>(
        `/servers/${serverId}/multi-step-modules/${moduleId}/steps`,
        data,
        opts
      ),
    updateStep: (serverId: string, moduleId: string, stepId: string, data: import("@/types/platform-extensions").AddModuleStepPayload, opts?: RequestOptions) =>
      apiClient.patch<import("@/types/platform-extensions").ModuleStep>(
        `/servers/${serverId}/multi-step-modules/${moduleId}/steps/${stepId}`,
        data,
        opts
      ),
    deleteStep: (serverId: string, moduleId: string, stepId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/multi-step-modules/${moduleId}/steps/${stepId}`, opts),
  },

  analytics: {
    trackEvent: (serverId: string, data: import("@/types/platform-extensions").TrackEventPayload, opts?: RequestOptions) =>
      apiClient.post<void>(`/servers/${serverId}/analytics-events/track`, data, opts),
    getEvents: (serverId: string, filters?: Record<string, unknown>, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").AnalyticsEvent[]>(
        `/servers/${serverId}/analytics-events/events`,
        filters,
        opts
      ),
    getDashboard: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").DashboardStats>(
        `/servers/${serverId}/analytics-events/dashboard`,
        undefined,
        opts
      ),
    getSummary: (serverId: string, dateRange?: Record<string, unknown>, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").EventSummary>(
        `/servers/${serverId}/analytics-events/summary`,
        dateRange,
        opts
      ),
    getUserActivity: (serverId: string, userId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").UserActivity>(
        `/servers/${serverId}/analytics-events/users/${userId}/activity`,
        undefined,
        opts
      ),
    getTopEvents: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<Array<{ eventType: string; count: number }>>(
        `/servers/${serverId}/analytics-events/top-events`,
        undefined,
        opts
      ),
    getMetrics: (serverId: string, metricType: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").AnalyticsMetric[]>(
        `/servers/${serverId}/analytics-events/metrics/${metricType}`,
        undefined,
        opts
      ),
  },

  marketplace: {
    listTemplates: (filters?: Record<string, unknown>, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MarketplaceTemplate[]>(
        `/marketplace/templates`,
        filters,
        opts
      ),
    searchTemplates: (query: string, filters?: Record<string, unknown>, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MarketplaceTemplate[]>(
        `/marketplace/templates/search`,
        { q: query, ...filters },
        opts
      ),
    getFeatured: (limit?: number, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MarketplaceTemplate[]>(
        `/marketplace/templates/featured`,
        limit ? { limit } : undefined,
        opts
      ),
    getTemplate: (templateId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MarketplaceTemplate>(
        `/marketplace/templates/${templateId}`,
        undefined,
        opts
      ),
    getTemplateStats: (templateId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").TemplateStats>(
        `/marketplace/templates/${templateId}/stats`,
        undefined,
        opts
      ),
    publishTemplate: (templateId: string, data: import("@/types/platform-extensions").PublishTemplatePayload, opts?: RequestOptions) =>
      apiClient.post<import("@/types/platform-extensions").MarketplaceTemplate>(
        `/marketplace/templates/${templateId}/publish`,
        data,
        opts
      ),
    updateTemplate: (templateId: string, data: import("@/types/platform-extensions").UpdateMarketplaceTemplatePayload, opts?: RequestOptions) =>
      apiClient.patch<import("@/types/platform-extensions").MarketplaceTemplate>(
        `/marketplace/templates/${templateId}`,
        data,
        opts
      ),
    unpublishTemplate: (templateId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/marketplace/templates/${templateId}`, opts),
    rateTemplate: (templateId: string, data: import("@/types/platform-extensions").RateTemplatePayload, opts?: RequestOptions) =>
      apiClient.post<void>(`/marketplace/templates/${templateId}/rate`, data, opts),
    getRatings: (templateId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MarketplaceRating[]>(
        `/marketplace/templates/${templateId}/ratings`,
        undefined,
        opts
      ),
    getMyRating: (templateId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MarketplaceRating>(
        `/marketplace/templates/${templateId}/my-rating`,
        undefined,
        opts
      ),
    importTemplate: (serverId: string, templateId: string, data?: import("@/types/platform-extensions").ImportTemplatePayload, opts?: RequestOptions) =>
      apiClient.post<import("@/types/platform-extensions").MarketplaceImport>(
        `/marketplace/templates/${templateId}/import`,
        { serverId, ...data },
        opts
      ),
    getImportHistory: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MarketplaceImport[]>(
        `/servers/${serverId}/marketplace/import-history`,
        undefined,
        opts
      ),
    getMyTemplates: (opts?: RequestOptions) =>
      apiClient.get<import("@/types/platform-extensions").MarketplaceTemplate[]>(
        `/marketplace/my-templates`,
        undefined,
        opts
      ),
  },

  // ── Components (Buttons & Select Menus) ──
  components: {
    // Button Templates
    listButtons: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/component").ButtonTemplate[]>(
        `/servers/${serverId}/buttons`,
        undefined,
        opts
      ),
    getButton: (serverId: string, templateId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/component").ButtonTemplate>(
        `/servers/${serverId}/buttons/${templateId}`,
        undefined,
        opts
      ),
    createButton: (
      serverId: string,
      data: import("@/types/component").CreateButtonTemplateRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/component").ButtonTemplate>(
        `/servers/${serverId}/buttons`,
        data,
        opts
      ),
    updateButton: (
      serverId: string,
      templateId: string,
      data: import("@/types/component").UpdateButtonTemplateRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<import("@/types/component").ButtonTemplate>(
        `/servers/${serverId}/buttons/${templateId}`,
        data,
        opts
      ),
    deleteButton: (serverId: string, templateId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/buttons/${templateId}`, opts),

    // Select Menu Templates
    listSelectMenus: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/component").SelectMenuTemplate[]>(
        `/servers/${serverId}/select-menus`,
        undefined,
        opts
      ),
    getSelectMenu: (serverId: string, templateId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/component").SelectMenuTemplate>(
        `/servers/${serverId}/select-menus/${templateId}`,
        undefined,
        opts
      ),
    createSelectMenu: (
      serverId: string,
      data: import("@/types/component").CreateSelectMenuTemplateRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/component").SelectMenuTemplate>(
        `/servers/${serverId}/select-menus`,
        data,
        opts
      ),
    updateSelectMenu: (
      serverId: string,
      templateId: string,
      data: import("@/types/component").UpdateSelectMenuTemplateRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<import("@/types/component").SelectMenuTemplate>(
        `/servers/${serverId}/select-menus/${templateId}`,
        data,
        opts
      ),
    deleteSelectMenu: (serverId: string, templateId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/select-menus/${templateId}`, opts),

    // Component Attachments
    getAttachments: (serverId: string, containerId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/component").ComponentAttachment[]>(
        `/servers/${serverId}/containers/${containerId}/components`,
        undefined,
        opts
      ),
    attachComponent: (
      serverId: string,
      data: import("@/types/component").CreateComponentAttachmentRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/component").ComponentAttachment>(
        `/servers/${serverId}/containers/${data.container_template_id}/components`,
        data,
        opts
      ),
    detachComponent: (serverId: string, attachmentId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/components/${attachmentId}`, opts),
    detachAllComponents: (serverId: string, containerId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        `/servers/${serverId}/containers/${containerId}/components`,
        opts
      ),
    reorderComponents: (
      serverId: string,
      data: import("@/types/component").ReorderComponentsRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<void>(
        `/servers/${serverId}/containers/${data.container_template_id}/components/reorder`,
        data,
        opts
      ),
  },

  // ── Default Messages ──
  defaultMessages: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/default-message").DefaultMessage[]>(
        `/servers/${serverId}/default-messages`,
        undefined,
        opts
      ),
    get: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/default-message").DefaultMessage>(
        `/servers/${serverId}/default-messages/${id}`,
        undefined,
        opts
      ),
    getByKey: (serverId: string, key: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/default-message").DefaultMessage>(
        `/servers/${serverId}/default-messages/by-key/${key}`,
        undefined,
        opts
      ),
    listByCategory: (
      serverId: string,
      category: import("@/types/default-message").MessageCategory,
      opts?: RequestOptions
    ) =>
      apiClient.get<import("@/types/default-message").DefaultMessage[]>(
        `/servers/${serverId}/default-messages/category/${category}`,
        undefined,
        opts
      ),
    create: (
      serverId: string,
      data: import("@/types/default-message").CreateDefaultMessageRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/default-message").DefaultMessage>(
        `/servers/${serverId}/default-messages`,
        data,
        opts
      ),
    update: (
      serverId: string,
      id: string,
      data: import("@/types/default-message").UpdateDefaultMessageRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<import("@/types/default-message").DefaultMessage>(
        `/servers/${serverId}/default-messages/${id}`,
        data,
        opts
      ),
    delete: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/default-messages/${id}`, opts),
  },

  // ── Sticky Messages ──
  stickyMessages: {
    list: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/sticky-message").StickyMessage[]>(
        `/servers/${serverId}/sticky-messages`,
        undefined,
        opts
      ),
    get: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/sticky-message").StickyMessage>(
        `/servers/${serverId}/sticky-messages/${id}`,
        undefined,
        opts
      ),
    listByChannel: (serverId: string, channelId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/sticky-message").StickyMessage[]>(
        `/servers/${serverId}/sticky-messages/channel/${channelId}`,
        undefined,
        opts
      ),
    create: (
      serverId: string,
      data: import("@/types/sticky-message").CreateStickyMessageRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/sticky-message").StickyMessage>(
        `/servers/${serverId}/sticky-messages`,
        data,
        opts
      ),
    update: (
      serverId: string,
      id: string,
      data: import("@/types/sticky-message").UpdateStickyMessageRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<import("@/types/sticky-message").StickyMessage>(
        `/servers/${serverId}/sticky-messages/${id}`,
        data,
        opts
      ),
    delete: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/sticky-messages/${id}`, opts),
    incrementCount: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.post<{ current_count: number; incremented: number }>(
        `/servers/${serverId}/sticky-messages/${id}/increment`,
        undefined,
        opts
      ),
    resetCount: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.post<{ current_count: number }>(
        `/servers/${serverId}/sticky-messages/${id}/reset`,
        undefined,
        opts
      ),
  },

  // ── Message Kits ──
  messageKits: {
    listPublic: (serverId: string, limit = 20, offset = 0, opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").MessageKit[]>(
        `/servers/${serverId}/message-kits`,
        { limit, offset },
        opts
      ),
    listFeatured: (serverId: string, limit = 10, opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").MessageKit[]>(
        `/servers/${serverId}/message-kits/featured`,
        { limit },
        opts
      ),
    search: (serverId: string, query: string, tags?: string[], opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").MessageKit[]>(
        `/servers/${serverId}/message-kits/search`,
        { q: query, tags },
        opts
      ),
    get: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").MessageKit>(
        `/servers/${serverId}/message-kits/${id}`,
        undefined,
        opts
      ),
    getContents: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").MessageKitContent[]>(
        `/servers/${serverId}/message-kits/${id}/contents`,
        undefined,
        opts
      ),
    getRatings: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").MessageKitRating[]>(
        `/servers/${serverId}/message-kits/${id}/ratings`,
        undefined,
        opts
      ),
    getStats: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").KitStats>(
        `/servers/${serverId}/message-kits/${id}/stats`,
        undefined,
        opts
      ),
    getMyTemplates: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").MessageKit[]>(
        `/servers/${serverId}/message-kits/my-templates`,
        undefined,
        opts
      ),
    create: (
      serverId: string,
      data: import("@/types/message-kit").CreateMessageKitRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/message-kit").MessageKit>(
        `/servers/${serverId}/message-kits`,
        data,
        opts
      ),
    update: (
      serverId: string,
      id: string,
      data: import("@/types/message-kit").UpdateMessageKitRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<import("@/types/message-kit").MessageKit>(
        `/servers/${serverId}/message-kits/${id}`,
        data,
        opts
      ),
    delete: (serverId: string, id: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/message-kits/${id}`, opts),
    addContent: (
      serverId: string,
      kitId: string,
      data: import("@/types/message-kit").AddContentRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/message-kit").MessageKitContent>(
        `/servers/${serverId}/message-kits/${kitId}/contents`,
        data,
        opts
      ),
    deleteContent: (serverId: string, contentId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        `/servers/${serverId}/message-kits/contents/${contentId}`,
        opts
      ),
    import: (serverId: string, kitId: string, opts?: RequestOptions) =>
      apiClient.post<import("@/types/message-kit").MessageKitImport>(
        `/servers/${serverId}/message-kits/${kitId}/import`,
        undefined,
        opts
      ),
    getImportHistory: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").MessageKitImport[]>(
        `/servers/${serverId}/message-kits/import-history`,
        undefined,
        opts
      ),
    getMyRating: (serverId: string, kitId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/message-kit").MessageKitRating | null>(
        `/servers/${serverId}/message-kits/${kitId}/ratings/my-rating`,
        undefined,
        opts
      ),
    createRating: (
      serverId: string,
      kitId: string,
      data: import("@/types/message-kit").CreateRatingRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/message-kit").MessageKitRating>(
        `/servers/${serverId}/message-kits/${kitId}/ratings`,
        data,
        opts
      ),
    updateRating: (
      serverId: string,
      kitId: string,
      data: import("@/types/message-kit").UpdateRatingRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<import("@/types/message-kit").MessageKitRating>(
        `/servers/${serverId}/message-kits/${kitId}/ratings`,
        data,
        opts
      ),
  },

  // ── Send Command ──
  sendCommand: {
    // Config
    getConfig: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/send-command").SendCommandConfig | null>(
        `/servers/${serverId}/send-command/config`,
        undefined,
        opts
      ),
    createConfig: (
      serverId: string,
      data: import("@/types/send-command").CreateSendCommandConfigRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/send-command").SendCommandConfig>(
        `/servers/${serverId}/send-command/config`,
        data,
        opts
      ),
    updateConfig: (
      serverId: string,
      data: import("@/types/send-command").UpdateSendCommandConfigRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<import("@/types/send-command").SendCommandConfig>(
        `/servers/${serverId}/send-command/config`,
        data,
        opts
      ),
    deleteConfig: (serverId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/send-command/config`, opts),

    // Permissions
    getPermissions: (serverId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/send-command").SendCommandPermission[]>(
        `/servers/${serverId}/send-command/permissions`,
        undefined,
        opts
      ),
    createPermission: (
      serverId: string,
      data: import("@/types/send-command").CreateSendCommandPermissionRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/send-command").SendCommandPermission>(
        `/servers/${serverId}/send-command/permissions`,
        data,
        opts
      ),
    updatePermission: (
      permissionId: string,
      data: import("@/types/send-command").UpdateSendCommandPermissionRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<import("@/types/send-command").SendCommandPermission>(
        `/servers/send-command/permissions/${permissionId}`,
        data,
        opts
      ),
    deletePermission: (permissionId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        `/servers/send-command/permissions/${permissionId}`,
        opts
      ),
    batchUpdatePermissions: (
      serverId: string,
      permissions: import("@/types/send-command").CreateSendCommandPermissionRequest[],
      opts?: RequestOptions
    ) =>
      apiClient.put<import("@/types/send-command").SendCommandPermission[]>(
        `/servers/${serverId}/send-command/permissions/batch`,
        { permissions },
        opts
      ),

    // Pending Requests
    listPendingRequests: (
      serverId: string,
      status?: import("@/types/send-command").SendCommandStatus,
      limit = 50,
      offset = 0,
      opts?: RequestOptions
    ) =>
      apiClient.get<{
        requests: import("@/types/send-command").PendingSendRequest[];
        total: number;
        limit: number;
        offset: number;
      }>(
        `/servers/${serverId}/send-command/pending`,
        { status, limit, offset },
        opts
      ),
    getPendingRequest: (requestId: string, opts?: RequestOptions) =>
      apiClient.get<import("@/types/send-command").PendingSendRequest>(
        `/servers/send-command/pending/${requestId}`,
        undefined,
        opts
      ),
    createPendingRequest: (
      serverId: string,
      data: import("@/types/send-command").CreatePendingSendRequestRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/send-command").PendingSendRequest>(
        `/servers/${serverId}/send-command/pending`,
        data,
        opts
      ),
    approveRequest: (requestId: string, opts?: RequestOptions) =>
      apiClient.post<import("@/types/send-command").PendingSendRequest>(
        `/servers/send-command/pending/${requestId}/approve`,
        undefined,
        opts
      ),
    denyRequest: (
      requestId: string,
      data?: import("@/types/send-command").DenySendRequestRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/send-command").PendingSendRequest>(
        `/servers/send-command/pending/${requestId}/deny`,
        data,
        opts
      ),
    markAsSent: (
      requestId: string,
      data: import("@/types/send-command").MarkAsSentRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<import("@/types/send-command").PendingSendRequest>(
        `/servers/send-command/pending/${requestId}/sent`,
        data,
        opts
      ),
    deletePendingRequest: (requestId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(
        `/servers/send-command/pending/${requestId}`,
        opts
      ),
  },

  // ── Content Folders ──
  contentFolders: {
    // Server-scoped CRUD
    list: (serverId: string, parentId?: string, opts?: RequestOptions) =>
      apiClient.get<ContentFolder[]>(
        `/servers/${serverId}/content/folders`,
        parentId ? { parentId } : undefined,
        opts
      ),
    get: (serverId: string, folderId: string, opts?: RequestOptions) =>
      apiClient.get<ContentFolder>(
        `/servers/${serverId}/content/folders/${folderId}`,
        undefined,
        opts
      ),
    create: (serverId: string, data: CreateContentFolderRequest, opts?: RequestOptions) =>
      apiClient.post<ContentFolder>(
        `/servers/${serverId}/content/folders`,
        data,
        opts
      ),
    update: (
      serverId: string,
      folderId: string,
      data: UpdateContentFolderRequest,
      opts?: RequestOptions
    ) =>
      apiClient.patch<ContentFolder>(
        `/servers/${serverId}/content/folders/${folderId}`,
        data,
        opts
      ),
    delete: (serverId: string, folderId: string, opts?: RequestOptions) =>
      apiClient.delete<void>(`/servers/${serverId}/content/folders/${folderId}`, opts),

    // Items
    getItems: (serverId: string, folderId: string, opts?: RequestOptions) =>
      apiClient.get<ContentFolderItem[]>(
        `/servers/${serverId}/content/folders/${folderId}/items`,
        undefined,
        opts
      ),
    addItem: (
      serverId: string,
      folderId: string,
      data: AddItemToFolderRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<ContentFolderItem>(
        `/servers/${serverId}/content/folders/${folderId}/items`,
        data,
        opts
      ),
    removeItem: (
      serverId: string,
      folderId: string,
      itemId: string,
      itemType: string,
      opts?: RequestOptions
    ) =>
      apiClient.delete<void>(
        `/servers/${serverId}/content/folders/${folderId}/items/${itemId}?type=${itemType}`,
        opts
      ),
    moveItem: (serverId: string, data: MoveContentFolderItemRequest, opts?: RequestOptions) =>
      apiClient.post<void>(
        `/servers/${serverId}/content/folders/move-item`,
        data,
        opts
      ),

    // Public marketplace
    listPublic: (limit = 20, offset = 0, opts?: RequestOptions) =>
      apiClient.get<ContentFolder[]>(
        `/content/folders/public`,
        { limit, offset },
        opts
      ),
    listFeatured: (limit = 10, opts?: RequestOptions) =>
      apiClient.get<ContentFolder[]>(
        `/content/folders/featured`,
        { limit },
        opts
      ),
    search: (query: string, opts?: RequestOptions) =>
      apiClient.get<ContentFolder[]>(
        `/content/folders/search`,
        { q: query },
        opts
      ),
    getPublic: (folderId: string, opts?: RequestOptions) =>
      apiClient.get<ContentFolder>(
        `/content/folders/${folderId}`,
        undefined,
        opts
      ),
    import: (folderId: string, serverId: string, opts?: RequestOptions) =>
      apiClient.post<ContentFolderImport>(
        `/content/folders/${folderId}/import`,
        { serverId },
        opts
      ),

    // Ratings
    getRatings: (folderId: string, opts?: RequestOptions) =>
      apiClient.get<ContentFolderRating[]>(
        `/content/folders/${folderId}/ratings`,
        undefined,
        opts
      ),
    createRating: (
      folderId: string,
      data: CreateContentFolderRatingRequest,
      opts?: RequestOptions
    ) =>
      apiClient.post<ContentFolderRating>(
        `/content/folders/${folderId}/ratings`,
        data,
        opts
      ),
    getStats: (folderId: string, opts?: RequestOptions) =>
      apiClient.get<{ average_rating: number; rating_count: number }>(
        `/content/folders/${folderId}/stats`,
        undefined,
        opts
      ),
  },
};
