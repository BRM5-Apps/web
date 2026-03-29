"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, ChevronRight, ChevronDown } from "lucide-react";
import {
  getElementsForEvent,
  COMMON_ELEMENTS,
  getEventCategories,
  getEventsByCategory,
  getEventByValue,
  type EventElement,
} from "@/lib/discord-events";

interface EventElementsProps {
  /** The selected event type */
  eventType: string;
  /** Called when a variable is clicked (copy or insert) */
  onVariableClick?: (variable: string) => void;
  /** Whether to show common variables */
  showCommon?: boolean;
  /** Whether to show as compact (inline) */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

export function EventElements({
  eventType,
  onVariableClick,
  showCommon = true,
  compact = false,
  className,
}: EventElementsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const elements = getElementsForEvent(eventType);
  const eventConfig = getEventByValue(eventType);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    onVariableClick?.(key);
  };

  if (!eventConfig) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Event Variables */}
      <div>
        <div className="text-xs font-medium text-[#B5BAC1] uppercase tracking-wide mb-2">
          {eventConfig.label} Variables
        </div>
        <div className={cn("space-y-1", compact ? "max-h-[150px]" : "max-h-[200px]", "overflow-y-auto")}>
          {elements.map((element) => (
            <button
              key={element.key}
              type="button"
              onClick={() => handleCopy(element.key)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[3px] bg-[#1E1F22] hover:bg-[#2B2D31] transition-colors text-left group"
              title={`${element.description}\nExample: ${element.example}`}
            >
              <code className="text-xs text-[#5865F2] font-mono flex-shrink-0 truncate max-w-[120px]">
                {`{{${element.key}}}`}
              </code>
              <span className="text-xs text-[#80848E] truncate flex-1">
                {element.label}
              </span>
              {copiedKey === element.key ? (
                <Check className="h-3 w-3 text-[#10b981] flex-shrink-0" />
              ) : (
                <Copy className="h-3 w-3 text-[#6D6F78] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Common Variables */}
      {showCommon && (
        <div>
          <div className="text-xs font-medium text-[#B5BAC1] uppercase tracking-wide mb-2">
            Common Variables
          </div>
          <div className={cn("space-y-1", compact ? "max-h-[80px]" : "max-h-[120px]", "overflow-y-auto")}>
            {COMMON_ELEMENTS.map((element) => (
              <button
                key={element.key}
                type="button"
                onClick={() => handleCopy(element.key)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[3px] bg-[#1E1F22] hover:bg-[#2B2D31] transition-colors text-left group"
                title={`${element.description}\nExample: ${element.example}`}
              >
                <code className="text-xs text-[#7289DA] font-mono flex-shrink-0 truncate max-w-[120px]">
                  {`{{${element.key}}}`}
                </code>
                <span className="text-xs text-[#80848E] truncate flex-1">
                  {element.label}
                </span>
                {copiedKey === element.key ? (
                  <Check className="h-3 w-3 text-[#10b981] flex-shrink-0" />
                ) : (
                  <Copy className="h-3 w-3 text-[#6D6F78] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Event Selector with Categories
// ────────────────────────────────────────────────────────────────────────────────

interface EventSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function EventSelector({ value, onChange, className }: EventSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["member", "message"]));

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {getEventCategories().map((category) => {
        const categoryEvents = getEventsByCategory(category.value);
        const isExpanded = expandedCategories.has(category.value);
        const CategoryIcon = category.value === "member" ? "Users" :
                             category.value === "message" ? "MessageSquare" :
                             category.value === "voice" ? "Headphones" :
                             category.value === "role" ? "Shield" :
                             category.value === "channel" ? "Hash" :
                             category.value === "thread" ? "MessagesSquare" :
                             category.value === "emoji" ? "Smile" :
                             "Server";

        return (
          <div key={category.value} className="rounded-[4px] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCategory(category.value)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-[#1E1F22] hover:bg-[#2B2D31] transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-[#80848E]" />
              ) : (
                <ChevronRight className="h-3 w-3 text-[#80848E]" />
              )}
              <span className="text-sm font-medium text-white">{category.label}</span>
              <span className="text-xs text-[#80848E] ml-auto">{categoryEvents.length}</span>
            </button>
            {isExpanded && (
              <div className="bg-[#232428] p-1 grid grid-cols-2 gap-1">
                {categoryEvents.map((event) => {
                  const isSelected = value === event.value;
                  return (
                    <button
                      key={event.value}
                      type="button"
                      onClick={() => onChange(event.value)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-[3px] text-xs text-left transition-all",
                        isSelected
                          ? "bg-[#5865F2] text-white"
                          : "text-[#B5BAC1] hover:bg-[#3C3F45] hover:text-white"
                      )}
                      title={event.description}
                    >
                      <span className="truncate">{event.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}