"use client";

import { useMemo } from "react";
import { Check, AlertCircle } from "lucide-react";

interface CronPreviewProps {
  expression: string;
}

// Basic cron validation - 5 fields
function isValidCron(expression: string): boolean {
  if (!expression.trim()) return false;
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return false;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const isValidField = (field: string, min: number, max: number) => {
    if (field === "*") return true;
    if (field === "?") return true; // "?" is valid for day fields
    if (/^\d+$/.test(field)) {
      const num = parseInt(field, 10);
      return num >= min && num <= max;
    }
    // Handle ranges (e.g., "1-5") and steps (e.g., "*/5", "1-5/2")
    if (/^(\*|\d+(-\d+)?)(\/\d+)?$/.test(field)) {
      return true;
    }
    // Handle lists (e.g., "1,3,5")
    if (/^\d+(,\d+)*$/.test(field)) {
      const nums = field.split(",").map((n) => parseInt(n, 10));
      return nums.every((n) => n >= min && n <= max);
    }
    return false;
  };

  return (
    isValidField(minute, 0, 59) &&
    isValidField(hour, 0, 23) &&
    isValidField(dayOfMonth, 1, 31) &&
    isValidField(month, 1, 12) &&
    isValidField(dayOfWeek, 0, 6)
  );
}

// Convert cron expression to human-readable text
function cronToHuman(expression: string): string {
  if (!isValidCron(expression)) return "Invalid expression";

  const parts = expression.trim().split(/\s+/);
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Common presets
  if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every minute";
  }
  if (minute === "0" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every hour at minute 0";
  }
  if (minute === "0" && hour === "0" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every day at midnight";
  }

  // Daily at specific time
  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    if (minute === "0") {
      const hourNum = parseInt(hour, 10);
      const ampm = hourNum >= 12 ? "PM" : "AM";
      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
      return `Every day at ${displayHour}:00 ${ampm}`;
    }
    return `Every day at ${hour}:${minute.padStart(2, "0")}`;
  }

  // Weekly
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
    const dayNum = parseInt(dayOfWeek, 10);
    const dayName = dayNames[dayNum] || `day ${dayOfWeek}`;

    if (minute === "0") {
      const hourNum = parseInt(hour, 10);
      const ampm = hourNum >= 12 ? "PM" : "AM";
      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
      return `Every ${dayName} at ${displayHour}:00 ${ampm}`;
    }
    return `Every ${dayName} at ${hour}:${minute.padStart(2, "0")}`;
  }

  // Monthly
  if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
    const day = parseInt(dayOfMonth, 10);
    const suffix = day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
    if (minute === "0") {
      const hourNum = parseInt(hour, 10);
      const ampm = hourNum >= 12 ? "PM" : "AM";
      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
      return `Every month on the ${day}${suffix} at ${displayHour}:00 ${ampm}`;
    }
    return `Every month on the ${day}${suffix}`;
  }

  // Fallback - show raw cron parts
  return `Custom schedule: ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
}

// Calculate next run times
function getNextRuns(expression: string, count: number = 3): Date[] {
  if (!isValidCron(expression)) return [];

  const parts = expression.trim().split(/\s+/);
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const now = new Date();
  const runs: Date[] = [];
  const maxIterations = 10000; // Prevent infinite loops
  let iterations = 0;
  let current = new Date(now.getTime() + 60000); // Start from next minute

  while (runs.length < count && iterations < maxIterations) {
    iterations++;

    const matches =
      matchesField(minute, current.getMinutes(), 0, 59) &&
      matchesField(hour, current.getHours(), 0, 23) &&
      matchesField(dayOfMonth, current.getDate(), 1, 31) &&
      matchesField(month, current.getMonth() + 1, 1, 12) &&
      matchesField(dayOfWeek, current.getDay(), 0, 6);

    if (matches) {
      runs.push(new Date(current));
    }
    current = new Date(current.getTime() + 60000); // Advance 1 minute
  }

  return runs;
}

function matchesField(field: string, value: number, min: number, max: number): boolean {
  if (field === "*") return true;
  if (field === "?") return true;

  // Single number
  if (/^\d+$/.test(field)) {
    return parseInt(field, 10) === value;
  }

  // Range (e.g., "1-5")
  if (/^\d+-\d+$/.test(field)) {
    const [start, end] = field.split("-").map(Number);
    return value >= start && value <= end;
  }

  // Step (e.g., "*/5", "1-10/2")
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const stepNum = parseInt(step, 10);
    if (base === "*") {
      return value % stepNum === 0;
    }
    if (/^\d+-\d+$/.test(base)) {
      const [start, end] = base.split("-").map(Number);
      return value >= start && value <= end && (value - start) % stepNum === 0;
    }
    return false;
  }

  // List (e.g., "1,3,5")
  if (field.includes(",")) {
    return field.split(",").map(Number).includes(value);
  }

  return false;
}

function formatDate(date: Date): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today ${timeStr}`;
  if (isTomorrow) return `Tomorrow ${timeStr}`;

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }) + " " + timeStr;
}

export function CronPreview({ expression }: CronPreviewProps) {
  const valid = useMemo(() => isValidCron(expression), [expression]);
  const humanReadable = useMemo(() => cronToHuman(expression), [expression]);
  const nextRuns = useMemo(() => getNextRuns(expression, 3), [expression]);

  if (!expression.trim()) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#6D6F78]">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Enter a cron expression</span>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#F23F42]">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Invalid cron expression</span>
        </div>
        <p className="text-[10px] text-[#6D6F78]">
          Expected format: minute hour day month weekday
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Human readable */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-[#23A559]/20 flex items-center justify-center flex-shrink-0">
          <Check className="h-3 w-3 text-[#23A559]" />
        </div>
        <span className="text-sm text-white font-medium">{humanReadable}</span>
      </div>

      {/* Next runs */}
      {nextRuns.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-[#80848E] uppercase tracking-wide font-medium">Next runs</p>
          <div className="space-y-1">
            {nextRuns.map((run, i) => (
              <div key={i} className="text-xs text-[#B5BAC1]">
                {formatDate(run)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}