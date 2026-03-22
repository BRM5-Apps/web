import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, generateAvatarUrl } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";
type PresenceStatus = "online" | "offline";

interface UserAvatarProps {
  discordId: string;
  avatarHash?: string | null;
  username: string;
  size?: AvatarSize;
  status?: PresenceStatus;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const dotClasses: Record<AvatarSize, string> = {
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
  xl: "h-4 w-4 border-2",
};

function getInitials(username: string): string {
  const parts = username.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getFallbackColor(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue} 65% 45%)`;
}

export function UserAvatar({
  discordId,
  avatarHash,
  username,
  size = "md",
  status,
  className,
}: UserAvatarProps) {
  const safeDiscordId = /^\d+$/.test(discordId) ? discordId : "0";
  const displayName = username.trim() || "Unknown user";
  const imageUrl = generateAvatarUrl(safeDiscordId, avatarHash);
  const initials = getInitials(displayName);
  const fallbackColor = getFallbackColor(username || discordId);

  return (
    <div className={cn("relative inline-flex", className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={imageUrl} alt={displayName} />
        <AvatarFallback
          className="text-xs font-semibold text-white"
          style={{ backgroundColor: fallbackColor }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-background",
            dotClasses[size],
            status === "online" ? "bg-emerald-500" : "bg-slate-400"
          )}
          aria-label={status === "online" ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
