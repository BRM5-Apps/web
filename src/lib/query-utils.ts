import type { QueryClient, QueryKey, QueryFunction } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/**
 * Resource types that can trigger cascading invalidation.
 */
type InvalidatableResource =
  | "server"
  | "members"
  | "ranks"
  | "events"
  | "stats"
  | "moderation"
  | "points"
  | "units"
  | "templates"
  | "promotionPaths"
  | "config"
  | "positions"
  | "branches"
  | "notifications"
  | "memberProfile";

/**
 * Invalidate a resource and all related queries that typically need refreshing.
 *
 * Encodes the dependency graph between resources:
 * - Changing events → also invalidates stats
 * - Changing ranks → also invalidates members and promotion paths
 * - Changing members → also invalidates stats
 * - Changing points → also invalidates stats and members
 */
export async function invalidateRelated(
  queryClient: QueryClient,
  resource: InvalidatableResource,
  serverId: string
): Promise<void> {
  const relatedMap: Record<InvalidatableResource, readonly QueryKey[]> = {
    server: [
      queryKeys.servers.all,
      queryKeys.servers.detail(serverId),
    ],
    members: [
      queryKeys.members.all(serverId),
      queryKeys.stats.overview(serverId),
    ],
    ranks: [
      queryKeys.ranks.all(serverId),
      queryKeys.members.all(serverId),
      queryKeys.promotionPaths.all(serverId),
    ],
    events: [
      queryKeys.events.all(serverId),
      queryKeys.stats.overview(serverId),
    ],
    stats: [queryKeys.stats.overview(serverId)],
    moderation: [
      queryKeys.moderation.punishments(serverId),
      queryKeys.moderation.blacklist(serverId),
      queryKeys.moderation.promoLocks(serverId),
    ],
    points: [
      queryKeys.points.flags(serverId),
      queryKeys.stats.overview(serverId),
      queryKeys.members.all(serverId),
    ],
    units: [queryKeys.units.all(serverId)],
    templates: [
      queryKeys.templates.embeds(serverId),
      queryKeys.templates.containers(serverId),
      queryKeys.templates.text(serverId),
    ],
    promotionPaths: [
      queryKeys.promotionPaths.all(serverId),
      queryKeys.ranks.all(serverId),
    ],
    config: [
      queryKeys.config.server(serverId),
      queryKeys.config.welcome(serverId),
      queryKeys.config.eventTypes(serverId),
    ],
    positions: [
      queryKeys.positions.all(serverId),
      queryKeys.members.all(serverId),
    ],
    branches: [
      queryKeys.branches.all(serverId),
      queryKeys.ranks.all(serverId),
    ],
    notifications: [queryKeys.notifications.all(serverId)],
    memberProfile: [
      queryKeys.memberProfile.detail(serverId, ""),
      // Note: We can't invalidate specific member profiles without the userId,
      // so callers should invalidate with specific keys when needed
    ],
  };

  const keysToInvalidate = relatedMap[resource] ?? [];
  await Promise.all(
    keysToInvalidate.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
  );
}

/**
 * Prefetch data when a user hovers a link/element.
 * Returns props to spread onto the triggering element.
 *
 * @example
 * const hoverProps = prefetchOnHover(queryClient, queryKeys.servers.detail(id), () => api.servers.get(id));
 * <Link {...hoverProps} href={`/servers/${id}`}>View Server</Link>
 */
export function prefetchOnHover<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  queryFn: QueryFunction<T>,
  staleTime = 30_000
): { onMouseEnter: () => void } {
  return {
    onMouseEnter: () => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      });
    },
  };
}
