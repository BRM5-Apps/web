import { format } from "date-fns";
import { ContainerPreview, type ContainerData } from "@/components/discord-preview/container-preview";
import { DiscordMarkdown } from "@/components/discord-preview/discord-markdown";
import { EmbedPreview, type EmbedData } from "@/components/discord-preview/embed-preview";
import { discordThemes, type DiscordTheme } from "@/components/discord-preview/discord-theme";
import { cn } from "@/lib/utils";

interface MessagePreviewProps {
  botName: string;
  botAvatarUrl?: string;
  timestamp?: string | number | Date;
  content?: string;
  embed?: EmbedData;
  container?: ContainerData;
  discordTheme?: DiscordTheme;
  className?: string;
}

function formatHeaderTimestamp(value?: string | number | Date) {
  if (!value) return "Today at " + format(new Date(), "p");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today at " + format(new Date(), "p");
  return format(date, "'Today at' p");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "B";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function MessagePreview({
  botName,
  botAvatarUrl,
  timestamp,
  content,
  embed,
  container,
  discordTheme = "dark",
  className,
}: MessagePreviewProps) {
  const t = discordThemes[discordTheme];
  const timeLabel = formatHeaderTimestamp(timestamp);

  return (
    <div
      className={cn(
        "w-full rounded-[8px] p-[16px]",
        "font-['gg_sans','Whitney','Helvetica Neue',Helvetica,Arial,sans-serif]",
        className
      )}
      style={{ backgroundColor: t.messageBg }}
    >
      <div className="rounded-[6px] p-[2px_8px] transition-colors">
        <div className="grid grid-cols-[40px_1fr] gap-[12px]">
          <div className="pt-[2px]">
            {botAvatarUrl ? (
              <img src={botAvatarUrl} alt={botName} className="h-[40px] w-[40px] rounded-full object-cover" />
            ) : (
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#5865F2] text-[14px] font-semibold text-white">
                {initials(botName)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-[2px] flex items-baseline gap-[6px]">
              <span className="text-[16px] font-semibold leading-[1.375]" style={{ color: t.botName }}>{botName}</span>
              <span className="text-[12px] leading-[1.333]" style={{ color: t.timestamp }}>{timeLabel}</span>
            </div>

            {content ? <DiscordMarkdown content={content} className="mb-[8px]" /> : null}
            {embed ? <EmbedPreview {...embed} discordTheme={discordTheme} className="mb-[8px]" /> : null}
            {container ? <ContainerPreview container={container} discordTheme={discordTheme} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
