"use client";

import { useState, useCallback, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile, Server, Code, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import type { RequestOptions } from "@/lib/api-client";

// Dynamic import to avoid SSR issues with emoji-mart
import dynamic from "next/dynamic";

const Picker = dynamic(
  () => import("@emoji-mart/react").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[350px] w-[352px] bg-[#2b2d31]"><span className="text-sm text-[#b5bac1]">Loading...</span></div> },
);

// Discord custom emoji type
interface DiscordEmoji {
  id: string;
  name: string;
  animated?: boolean;
  url?: string;
}

interface EnhancedEmojiPickerProps {
  value?: string;
  onChange: (emoji: string | undefined) => void;
  className?: string;
  size?: "sm" | "md";
  serverId?: string;
}

// Custom emoji format regex: <:name:id> or <a:name:id> for animated
const CUSTOM_EMOJI_REGEX = /^<a?:([a-zA-Z0-9_]+):(\d+)>$/;

export function EnhancedEmojiPicker({
  value,
  onChange,
  className,
  size = "md",
  serverId,
}: EnhancedEmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("native");
  const [customEmojiInput, setCustomEmojiInput] = useState("");
  const [customEmojiError, setCustomEmojiError] = useState("");
  const [serverEmojis, setServerEmojis] = useState<DiscordEmoji[]>([]);
  const [isLoadingEmojis, setIsLoadingEmojis] = useState(false);

  // Fetch server emojis when tab is selected
  useEffect(() => {
    if (activeTab === "server" && serverId && serverEmojis.length === 0) {
      setIsLoadingEmojis(true);
      // This would be an actual API call to fetch server emojis
      // For now, we'll use an empty array - implement the API endpoint as needed
      // @ts-ignore - getEmojis method may not exist yet on api.servers type
      api.servers.getEmojis?.(serverId)
        .then((emojis: DiscordEmoji[]) => {
          setServerEmojis(emojis || []);
        })
        .catch(() => {
          // Fallback: empty array
          setServerEmojis([]);
        })
        .finally(() => {
          setIsLoadingEmojis(false);
        });
    }
  }, [activeTab, serverId, serverEmojis.length]);

  const handleNativeSelect = useCallback(
    (emoji: { native?: string; id?: string }) => {
      if (emoji.native) {
        onChange(emoji.native);
        setOpen(false);
      }
    },
    [onChange],
  );

  const handleServerEmojiSelect = useCallback(
    (emoji: DiscordEmoji) => {
      const emojiString = emoji.animated
        ? `<a:${emoji.name}:${emoji.id}>`
        : `<:${emoji.name}:${emoji.id}>`;
      onChange(emojiString);
      setOpen(false);
    },
    [onChange],
  );

  const handleCustomEmojiSubmit = useCallback(() => {
    const trimmed = customEmojiInput.trim();
    if (!trimmed) {
      setCustomEmojiError("Please enter an emoji");
      return;
    }

    // Validate custom emoji format
    if (!CUSTOM_EMOJI_REGEX.test(trimmed)) {
      setCustomEmojiError("Invalid format. Use <:name:id> or <a:name:id>");
      return;
    }

    onChange(trimmed);
    setCustomEmojiInput("");
    setCustomEmojiError("");
    setOpen(false);
  }, [customEmojiInput, onChange]);

  const handleClear = useCallback(() => {
    onChange(undefined);
    setOpen(false);
  }, [onChange]);

  // Parse current value to display preview
  const getDisplayEmoji = () => {
    if (!value) return null;

    // Check if it's a custom emoji
    const customMatch = value.match(CUSTOM_EMOJI_REGEX);
    if (customMatch) {
      const [, name, id] = customMatch;
      const isAnimated = value.startsWith("<a:");
      return {
        type: "custom" as const,
        name,
        id,
        url: `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? "gif" : "png"}`,
      };
    }

    // Native emoji
    return { type: "native" as const, emoji: value };
  };

  const displayEmoji = getDisplayEmoji();
  const btnSize = size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-xl";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Set emoji"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-[3px] bg-[#1E1F22] transition-colors hover:bg-[#2B2D31] border border-transparent focus:border-[#5865F2]",
            btnSize,
            className,
          )}
        >
          {displayEmoji ? (
            displayEmoji.type === "custom" ? (
              <img
                src={displayEmoji.url}
                alt={displayEmoji.name}
                className="w-5 h-5 object-contain"
              />
            ) : (
              <span>{displayEmoji.emoji}</span>
            )
          ) : (
            <span className="opacity-30">😀</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-[#3f4147] bg-[#2b2d31] p-0 shadow-xl"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList className="w-full grid grid-cols-3 bg-[#1e1f22] rounded-none border-b border-[#3f4147]">
            <TabsTrigger value="native" className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white">
              <Smile className="w-4 h-4 mr-1" />
              Native
            </TabsTrigger>
            <TabsTrigger value="server" className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white">
              <Server className="w-4 h-4 mr-1" />
              Server
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white">
              <Code className="w-4 h-4 mr-1" />
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="native" className="mt-0">
            <div className="bg-[#2b2d31]">
              <Picker
                data={undefined}
                onEmojiSelect={handleNativeSelect}
                theme="dark"
                set="native"
                skinTonePosition="search"
                previewPosition="none"
                navPosition="top"
                perLine={8}
                maxFrequentRows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="server" className="mt-0 p-4 min-h-[300px]">
            {isLoadingEmojis ? (
              <div className="flex items-center justify-center h-[250px]">
                <span className="text-sm text-[#b5bac1]">Loading server emojis...</span>
              </div>
            ) : serverEmojis.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <Server className="w-12 h-12 text-[#b5bac1] mb-3" />
                <p className="text-sm text-[#b5bac1]">No server emojis available</p>
                <p className="text-xs text-[#80848E] mt-1">Connect your server to see custom emojis</p>
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-2 max-h-[300px] overflow-y-auto">
                {serverEmojis.map((emoji) => (
                  <button
                    key={emoji.id}
                    type="button"
                    onClick={() => handleServerEmojiSelect(emoji)}
                    className="w-10 h-10 rounded hover:bg-[#3f4147] flex items-center justify-center transition-colors"
                    title={emoji.name}
                  >
                    <img
                      src={emoji.url || `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`}
                      alt={emoji.name}
                      className="w-6 h-6 object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="mt-0 p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#b5bac1] mb-1.5 block">
                  Custom Emoji Code
                </label>
                <Input
                  value={customEmojiInput}
                  onChange={(e) => {
                    setCustomEmojiInput(e.target.value);
                    setCustomEmojiError("");
                  }}
                  placeholder="<:emoji_name:123456789>"
                  className="bg-[#1e1f22] border-[#3f4147] text-white font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCustomEmojiSubmit();
                    }
                  }}
                />
                {customEmojiError && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {customEmojiError}
                  </div>
                )}
              </div>

              <div className="bg-[#1e1f22] rounded p-3">
                <p className="text-xs text-[#b5bac1] mb-2">Format examples:</p>
                <div className="space-y-1 font-mono text-xs text-[#80848E]">
                  <code>&lt;:name:id&gt;</code> - Static emoji
                </div>
                <div className="space-y-1 font-mono text-xs text-[#80848E]">
                  <code>&lt;a:name:id&gt;</code> - Animated emoji
                </div>
              </div>

              <Button
                onClick={handleCustomEmojiSubmit}
                className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Use Custom Emoji
              </Button>

              {/* Preview */}
              {customEmojiInput && CUSTOM_EMOJI_REGEX.test(customEmojiInput.trim()) && (
                <div className="border border-[#3f4147] rounded p-3">
                  <p className="text-xs text-[#b5bac1] mb-2">Preview:</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const match = customEmojiInput.trim().match(CUSTOM_EMOJI_REGEX);
                      if (match) {
                        const [, name, id] = match;
                        const isAnimated = customEmojiInput.trim().startsWith("<a:");
                        const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? "gif" : "png"}`;
                        return (
                          <>
                            <img
                              src={url}
                              alt={name}
                              className="w-6 h-6 object-contain"
                            />
                            <span className="text-sm text-white">:{name}:</span>
                          </>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {value && (
          <div className="border-t border-[#3f4147] bg-[#2b2d31] px-3 py-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Remove emoji
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Extend the API types to include the getEmojis method
declare module "@/lib/api-client" {
  interface ApiClient {
    servers: {
      getEmojis?: (serverId: string, opts?: RequestOptions) => Promise<DiscordEmoji[]>;
    };
  }
}
