import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date string to a readable format */
export function formatDate(date: string | Date | null | undefined, pattern = "MMM d, yyyy"): string {
  if (!date) return "Unknown date";
  const parsed = typeof date === "string" ? parseISO(date) : new Date(date);
  if (!isValid(parsed)) return "Unknown date";
  return format(parsed, pattern);
}

/** Format an ISO date string to relative time (e.g. "3 hours ago") */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Truncate text to a maximum length with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/** Generate a Discord CDN avatar URL */
export function generateAvatarUrl(
  discordId: string,
  avatarHash: string | null | undefined
): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=128`;
  }
  // Default Discord avatar based on discriminator/id
  const index = (Number(discordId) >> 22) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

/** Convert a Discord color integer to a hex string (e.g. 5793266 → "#5865F2") */
export function colorToHex(colorInt: number): string {
  return `#${colorInt.toString(16).padStart(6, "0")}`;
}
