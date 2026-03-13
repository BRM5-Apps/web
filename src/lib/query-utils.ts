import type { QueryClient, QueryKey, QueryFunction } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/**
 * Resource types that can trigger cascading invalidation.
 */
type InvalidatableResource =
  | "faction"
  | "members"
  | "ranks"
  | "events"
  | "stats"
  | "moderation"
  | "points"
  | "units"
  | "templates"
  | "promotionPaths"
  | "config";

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
  factionId: string
): Promise<void> {
  const relatedMap: Record<InvalidatableResource, readonly QueryKey[]> = {
    faction: [
      queryKeys.factions.all,
      queryKeys.factions.detail(factionId),
    ],
    members: [
      queryKeys.members.all(factionId),
      queryKeys.stats.overview(factionId),
    ],
    ranks: [
      queryKeys.ranks.all(factionId),
      queryKeys.members.all(factionId),
      queryKeys.promotionPaths.all(factionId),
    ],
    events: [
      queryKeys.events.all(factionId),
      queryKeys.stats.overview(factionId),
    ],
    stats: [queryKeys.stats.overview(factionId)],
    moderation: [
      queryKeys.moderation.punishments(factionId),
      queryKeys.moderation.blacklist(factionId),
      queryKeys.moderation.promoLocks(factionId),
    ],
    points: [
      queryKeys.points.flags(factionId),
      queryKeys.stats.overview(factionId),
      queryKeys.members.all(factionId),
    ],
    units: [queryKeys.units.all(factionId)],
    templates: [
      queryKeys.templates.embeds(factionId),
      queryKeys.templates.containers(factionId),
      queryKeys.templates.text(factionId),
    ],
    promotionPaths: [
      queryKeys.promotionPaths.all(factionId),
      queryKeys.ranks.all(factionId),
    ],
    config: [
      queryKeys.config.faction(factionId),
      queryKeys.config.welcome(factionId),
      queryKeys.config.eventTypes(factionId),
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
 * const hoverProps = prefetchOnHover(queryClient, queryKeys.factions.detail(id), () => api.factions.get(id));
 * <Link {...hoverProps} href={`/factions/${id}`}>View Faction</Link>
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
