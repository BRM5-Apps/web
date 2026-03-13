"use client";

import { useMemo, useState } from "react";
import { format, startOfDay, startOfMonth, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerMode = "single" | "range";

type Preset = "today" | "last7" | "last30" | "thisMonth" | "custom";

interface BaseDatePickerProps {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface SingleDatePickerProps extends BaseDatePickerProps {
  mode: "single";
  value?: Date;
  onChange: (value: Date | undefined) => void;
}

interface RangeDatePickerProps extends BaseDatePickerProps {
  mode: "range";
  value?: DateRange;
  onChange: (value: DateRange | undefined) => void;
}

type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

function getPresetRange(preset: Exclude<Preset, "custom">): DateRange {
  const today = startOfDay(new Date());

  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "last7":
      return { from: subDays(today, 6), to: today };
    case "last30":
      return { from: subDays(today, 29), to: today };
    case "thisMonth":
      return { from: startOfMonth(today), to: today };
  }
}

function getLabel(mode: DatePickerMode, value: Date | DateRange | undefined, placeholder: string) {
  if (!value) {
    return placeholder;
  }

  if (mode === "single") {
    return format(value as Date, "MMM d, yyyy");
  }

  const range = value as DateRange;
  if (!range.from) {
    return placeholder;
  }

  if (!range.to) {
    return format(range.from, "MMM d, yyyy");
  }

  return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`;
}

export function DatePicker(props: DatePickerProps) {
  const { mode, disabled, className } = props;
  const [open, setOpen] = useState(false);
  const placeholder = props.placeholder ?? (mode === "range" ? "Pick a date range" : "Pick a date");
  const label = getLabel(mode, props.value, placeholder);

  const presets = useMemo(
    () => [
      { key: "today" as const, label: "Today" },
      { key: "last7" as const, label: "Last 7 days" },
      { key: "last30" as const, label: "Last 30 days" },
      { key: "thisMonth" as const, label: "This month" },
      { key: "custom" as const, label: "Custom" },
    ],
    []
  );

  const applyPreset = (preset: Preset) => {
    if (preset === "custom") {
      return;
    }

    const range = getPresetRange(preset);

    if (mode === "single") {
      props.onChange(range.to);
      setOpen(false);
      return;
    }

    props.onChange(range);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start text-left font-normal", !props.value && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="border-b p-2">
          <div className="flex flex-wrap gap-1">
            {presets.map((preset) => (
              <Button
                key={preset.key}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyPreset(preset.key)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        {mode === "single" ? (
          <Calendar
            mode="single"
            selected={props.value}
            onSelect={(value) => {
              props.onChange(value);
              if (value) {
                setOpen(false);
              }
            }}
            initialFocus
          />
        ) : (
          <Calendar
            mode="range"
            selected={props.value}
            onSelect={(value) => {
              props.onChange(value);
              if (value?.from && value?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
