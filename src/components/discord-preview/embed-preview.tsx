import { format } from "date-fns";
import { DiscordMarkdown } from "@/components/discord-preview/discord-markdown";
import { discordThemes, type DiscordTheme } from "@/components/discord-preview/discord-theme";
import { cn } from "@/lib/utils";

interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface EmbedAuthor {
  name: string;
  iconUrl?: string;
  url?: string;
}

interface EmbedFooter {
  text: string;
  iconUrl?: string;
}

interface EmbedMedia {
  url: string;
}

export interface EmbedData {
  title?: string;
  url?: string;
  description?: string;
  color?: number | string;
  fields?: EmbedField[];
  footer?: EmbedFooter;
  image?: EmbedMedia;
  thumbnail?: EmbedMedia;
  author?: EmbedAuthor;
  timestamp?: string | number | Date;
}

interface EmbedPreviewProps extends EmbedData {
  className?: string;
  discordTheme?: DiscordTheme;
  // Backward-compatible props
  imageUrl?: string;
  thumbnailUrl?: string;
  footerText?: string;
  footerIconUrl?: string;
  authorName?: string;
  authorIconUrl?: string;
  authorUrl?: string;
}

function resolveColor(color?: number | string): string {
  if (typeof color === "number") {
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  if (typeof color === "string" && color.trim().length > 0) {
    return color;
  }

  return "#4f545c";
}

function formatTimestamp(value?: string | number | Date): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "MM/dd/yyyy");
}

export function EmbedPreview({
  title,
  url,
  description,
  color,
  fields = [],
  footer,
  image,
  thumbnail,
  author,
  timestamp,
  className,
  discordTheme = "dark",
  imageUrl,
  thumbnailUrl,
  footerText,
  footerIconUrl,
  authorName,
  authorIconUrl,
  authorUrl,
}: EmbedPreviewProps) {
  const t = discordThemes[discordTheme];
  const leftColor = resolveColor(color);
  const resolvedAuthor = author ?? (authorName ? { name: authorName, iconUrl: authorIconUrl, url: authorUrl } : undefined);
  const resolvedFooter = footer ?? (footerText ? { text: footerText, iconUrl: footerIconUrl } : undefined);
  const resolvedImage = image?.url ?? imageUrl;
  const resolvedThumbnail = thumbnail?.url ?? thumbnailUrl;
  const formattedTimestamp = formatTimestamp(timestamp);

  return (
    <div
      className={cn(
        "w-full max-w-[520px] overflow-hidden rounded-[4px]",
        "font-['gg_sans','Whitney','Helvetica Neue',Helvetica,Arial,sans-serif]",
        className
      )}
      style={{ backgroundColor: t.embedBg, borderColor: t.embedBorder, borderWidth: "1px", borderStyle: "solid" }}
    >
      <div className="flex">
        <div className="w-[4px] shrink-0" style={{ backgroundColor: leftColor }} />
        <div className="min-w-0 flex-1 p-[12px_16px_16px_12px]">
          <div className={cn("grid gap-[8px]", resolvedThumbnail ? "grid-cols-[1fr_80px]" : "grid-cols-1")}>
            <div className="min-w-0">
              {resolvedAuthor ? (
                <div className="mb-[8px] flex items-center gap-[8px] text-[12px] leading-[16px]" style={{ color: t.textPrimary }}>
                  {resolvedAuthor.iconUrl ? (
                    <img src={resolvedAuthor.iconUrl} alt="" className="h-[20px] w-[20px] rounded-full object-cover" />
                  ) : null}
                  {resolvedAuthor.url ? (
                    <a href={resolvedAuthor.url} target="_blank" rel="noreferrer" className="font-semibold hover:underline">
                      {resolvedAuthor.name}
                    </a>
                  ) : (
                    <span className="font-semibold">{resolvedAuthor.name}</span>
                  )}
                </div>
              ) : null}

              {title ? (
                <div className="mb-[8px] text-[16px] font-semibold leading-[1.25]">
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: t.textLink }}>
                      {title}
                    </a>
                  ) : (
                    <span style={{ color: t.textPrimary }}>{title}</span>
                  )}
                </div>
              ) : null}

              {description ? (
                <div style={{ color: t.textSecondary }}>
                  <DiscordMarkdown content={description} className="mb-[8px]" />
                </div>
              ) : null}

              {fields.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-[8px] gap-y-[8px]">
                  {fields.map((field, index) => (
                    <div key={`${field.name}-${index}`} className={cn("min-w-0", field.inline ? "col-span-1" : "col-span-3")}>
                      <div className="mb-[2px] text-[12px] font-semibold leading-[16px]" style={{ color: t.textPrimary }}>{field.name}</div>
                      <div style={{ color: t.textSecondary }}>
                        <DiscordMarkdown content={field.value} className="text-[12px] leading-[16px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {resolvedThumbnail ? (
              <div className="justify-self-end">
                <img src={resolvedThumbnail} alt="" className="h-[80px] w-[80px] rounded-[4px] object-cover" />
              </div>
            ) : null}
          </div>

          {resolvedImage ? (
            <div className="mt-[12px]">
              <img src={resolvedImage} alt="" className="max-h-[300px] w-full rounded-[4px] object-cover" />
            </div>
          ) : null}

          {resolvedFooter || formattedTimestamp ? (
            <div className="mt-[12px] flex items-center gap-[8px] text-[12px] leading-[16px]" style={{ color: t.textSecondary }}>
              {resolvedFooter?.iconUrl ? (
                <img src={resolvedFooter.iconUrl} alt="" className="h-[20px] w-[20px] rounded-full object-cover" />
              ) : null}
              {resolvedFooter?.text ? <span className="font-medium">{resolvedFooter.text}</span> : null}
              {resolvedFooter?.text && formattedTimestamp ? <span>•</span> : null}
              {formattedTimestamp ? <span>{formattedTimestamp}</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
