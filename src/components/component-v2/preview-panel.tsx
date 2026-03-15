"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sun, Moon } from "lucide-react";
import { discordThemes, type DiscordTheme } from "@/components/discord-preview/discord-theme";
import { cn } from "@/lib/utils";
import type {
  C2TopLevelItem,
  C2ContainerChild,
  C2Container,
  C2Text,
  C2Row,
  C2MediaGallery,
  C2File,
  C2Separator,
  ButtonStyle,
  C2SelectMenu,
  C2Section,
} from "./types";

// ── Button color map ──────────────────────────────────────────────────────────

const BUTTON_COLORS: Record<ButtonStyle, { bg: string; text: string }> = {
  blurple: { bg: "#5865F2", text: "#fff" },
  grey: { bg: "#4e5058", text: "#fff" },
  green: { bg: "#248046", text: "#fff" },
  red: { bg: "#da373c", text: "#fff" },
};

// ── PreviewItem ───────────────────────────────────────────────────────────────

interface PreviewItemProps {
  item: C2TopLevelItem | C2ContainerChild;
  theme: DiscordTheme;
}

function PreviewItem({ item, theme }: PreviewItemProps) {
  const tokens = discordThemes[theme];

  if (item.type === "text") {
    const textItem = item as C2Text;
    return (
      <p
        className="text-sm whitespace-pre-wrap"
        style={{ color: tokens.textPrimary }}
      >
        {textItem.content || (
          <span
            className="italic text-xs"
            style={{ color: tokens.textMuted }}
          >
            Empty text block
          </span>
        )}
      </p>
    );
  }

  if (item.type === "row") {
    const rowItem = item as C2Row;

    // Check if this row contains a select menu
    const selectMenuComp = rowItem.components.find((c) => c.type === "select_menu") as C2SelectMenu | undefined;

    if (selectMenuComp) {
      return (
        <div
          className={cn(
            "flex items-center justify-between rounded px-3 py-2 text-sm cursor-pointer",
            selectMenuComp.disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            backgroundColor: tokens.containerBg,
            border: `1px solid ${tokens.containerBorder}`,
            color: tokens.textSecondary,
          }}
        >
          <span className="italic">
            {selectMenuComp.placeholder || "Make a selection…"}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {rowItem.components.length === 0 ? (
          <span className="text-xs italic" style={{ color: tokens.textMuted }}>
            No buttons
          </span>
        ) : (
          rowItem.components.map((comp) => {
            if (comp.type === "button") {
              const colors = BUTTON_COLORS[comp.style];
              return (
                <button
                  key={comp.id}
                  type="button"
                  disabled={comp.disabled}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium transition-opacity",
                    comp.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {comp.emoji && <span>{comp.emoji}</span>}
                  {comp.label || "Button"}
                </button>
              );
            }
            if (comp.type === "link_button") {
              return (
                <button
                  key={comp.id}
                  type="button"
                  disabled={comp.disabled}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium transition-opacity",
                    comp.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: BUTTON_COLORS.grey.bg, color: BUTTON_COLORS.grey.text }}
                >
                  {comp.emoji && <span>{comp.emoji}</span>}
                  {comp.label || "Link"}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M7 1h4v4M11 1L5.5 6.5M4 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              );
            }
            return null;
          })
        )}
      </div>
    );
  }

  if (item.type === "media_gallery") {
    const galleryItem = item as C2MediaGallery;
    const validItems = galleryItem.items.filter((it) => {
      try {
        new URL(it.url);
        return true;
      } catch {
        return false;
      }
    });
    return (
      <div
        className={cn(
          "grid gap-1",
          validItems.length > 1 ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        {validItems.length > 0 ? (
          validItems.map((it, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={it.url}
              alt={`Gallery image ${i + 1}`}
              className="w-full rounded object-cover"
              style={{ maxHeight: 200 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ))
        ) : (
          <div
            className="flex h-16 items-center justify-center rounded border border-dashed text-xs"
            style={{
              borderColor: tokens.separatorColor,
              color: tokens.textMuted,
            }}
          >
            No media
          </div>
        )}
      </div>
    );
  }

  if (item.type === "file") {
    return (
      <div
        className="flex items-center gap-2 rounded border p-2 text-xs"
        style={{
          borderColor: tokens.containerBorder,
          backgroundColor: tokens.sectionBg,
          color: tokens.textSecondary,
        }}
      >
        <span>📎</span>
        <span className="italic">File attachment</span>
      </div>
    );
  }

  if (item.type === "separator") {
    const sep = item as C2Separator;
    return (
      <div className={cn(sep.size === "large" ? "my-4" : "my-2")}>
        {sep.dividerLine ? (
          <hr
            className="border-0 border-t"
            style={{ borderColor: tokens.separatorColor }}
          />
        ) : (
          <div className={cn(sep.size === "large" ? "h-4" : "h-2")} />
        )}
      </div>
    );
  }

  if (item.type === "section") {
    const sectionItem = item as C2Section;
    return (
      <div
        className="grid gap-3 rounded-md p-2"
        style={{
          gridTemplateColumns: "1fr auto",
          backgroundColor: tokens.sectionBg,
          border: `1px solid ${tokens.containerBorder}`,
        }}
      >
        {/* Left: content blocks */}
        <div className="flex flex-col gap-1">
          {sectionItem.contents.map((c) => (
            <p
              key={c.id}
              className="text-sm whitespace-pre-wrap"
              style={{ color: tokens.textPrimary }}
            >
              {c.content || (
                <span className="italic text-xs" style={{ color: tokens.textMuted }}>
                  Empty text block
                </span>
              )}
            </p>
          ))}
        </div>

        {/* Right: accessory */}
        {sectionItem.accessory && (
          <div className="flex-shrink-0 flex items-start justify-end">
            {sectionItem.accessory.type === "link_button" && (
              <button
                type="button"
                disabled={sectionItem.accessory.disabled}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium",
                  sectionItem.accessory.disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{ backgroundColor: "#4e5058", color: "#fff" }}
              >
                {sectionItem.accessory.label || "Link"}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M7 1h4v4M11 1L5.5 6.5M4 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {sectionItem.accessory.type === "thumbnail" && sectionItem.accessory.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sectionItem.accessory.url}
                alt="Thumbnail"
                className="rounded object-cover"
                style={{ width: 80, height: 80 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : sectionItem.accessory.type === "thumbnail" ? (
              <div
                className="flex items-center justify-center rounded border border-dashed text-xs"
                style={{
                  width: 80,
                  height: 80,
                  borderColor: tokens.separatorColor,
                  color: tokens.textMuted,
                }}
              >
                No URL
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  if (item.type === "container") {
    const container = item as C2Container;
    return (
      <div
        className="relative overflow-hidden rounded-md"
        style={{
          backgroundColor: tokens.containerBg,
          border: `1px solid ${tokens.containerBorder}`,
        }}
      >
        {container.accentColor && (
          <div
            className="absolute left-0 top-0 h-full w-1 flex-shrink-0"
            style={{ backgroundColor: container.accentColor }}
          />
        )}
        <div
          className={cn(
            "flex flex-col gap-2 p-3",
            container.accentColor && "pl-4",
            container.spoiler && "blur-sm select-none"
          )}
        >
          {container.children.length > 0 ? (
            container.children.map((child) => (
              <PreviewItem key={child.id} item={child} theme={theme} />
            ))
          ) : (
            <span
              className="text-xs italic"
              style={{ color: tokens.textMuted }}
            >
              Empty container
            </span>
          )}
        </div>
        {container.spoiler && (
          <div
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-md text-xs font-medium"
            style={{
              backgroundColor: `${tokens.containerBg}cc`,
              color: tokens.textSecondary,
            }}
          >
            Spoiler — click to reveal
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ── PreviewPanel ──────────────────────────────────────────────────────────────

export interface PreviewPanelProps {
  items: C2TopLevelItem[];
}

export function PreviewPanel({ items }: PreviewPanelProps) {
  const [theme, setTheme] = useState<DiscordTheme>("dark");
  const tokens = discordThemes[theme];

  return (
    <div className="flex flex-col h-full">
      {/* Theme toggle header */}
      <div
        className="flex items-center justify-end px-3 py-2 border-b"
        style={{
          backgroundColor: tokens.messageBg,
          borderColor: tokens.containerBorder,
        }}
      >
        <button
          type="button"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors hover:opacity-80"
          style={{ color: tokens.textSecondary }}
          aria-label="Toggle preview theme"
        >
          {theme === "dark" ? (
            <>
              <Moon className="h-3.5 w-3.5" />
              Dark
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5" />
              Light
            </>
          )}
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1">
        <div
          className="min-h-[200px] p-4"
          style={{ backgroundColor: tokens.messageBg }}
        >
          {/* Discord message chrome */}
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold select-none"
                style={{ backgroundColor: "#5865F2" }}
              >
                B
              </div>
            </div>

            {/* Message body */}
            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold" style={{ color: tokens.botName }}>
                  BRM5 Bot
                </span>
                <span
                  className="inline-flex items-center rounded px-1 py-0 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: "#5865F2", color: "#fff" }}
                >
                  BOT
                </span>
                <span className="text-xs" style={{ color: tokens.timestamp }}>
                  Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Component content */}
              {items.length === 0 ? (
                <div
                  className="flex flex-col items-start gap-1 text-sm"
                  style={{ color: tokens.textMuted }}
                >
                  <p className="italic">Your component preview will appear here</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <PreviewItem key={item.id} item={item} theme={theme} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
