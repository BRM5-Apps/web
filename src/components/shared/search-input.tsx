"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  delay?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  isSearching?: boolean;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  onSearch,
  delay = 300,
  value,
  onValueChange,
  isSearching = false,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const latestOnSearch = useRef(onSearch);

  const inputValue = useMemo(
    () => (isControlled ? value ?? "" : internalValue),
    [internalValue, isControlled, value]
  );

  const debouncedValue = useDebounce(inputValue, Math.max(0, delay));

  useEffect(() => {
    latestOnSearch.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    latestOnSearch.current(debouncedValue);
  }, [debouncedValue]);

  const setValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const handleClear = () => setValue("");

  return (
    <div className={cn("relative", className)} aria-busy={isSearching}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={inputValue}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-16"
      />

      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {inputValue.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  );
}
