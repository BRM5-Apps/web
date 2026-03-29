'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showLabel?: boolean;
  className?: string;
}

/**
 * RatingInput - Interactive star rating input component
 *
 * Displays a row of stars that can be clicked to set a rating.
 * Optionally shows a label for each rating level.
 */
export function RatingInput({
  value,
  onChange,
  maxRating = 5,
  size = 'md',
  disabled = false,
  showLabel = false,
  className,
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className={cn(
          'flex items-center gap-0.5',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= displayValue;

          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(starRating)}
              onMouseEnter={() => handleMouseEnter(starRating)}
              className={cn(
                'p-0.5 transition-colors',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
              aria-label={`Rate ${starRating} out of ${maxRating}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-transparent text-muted-foreground hover:text-yellow-400'
                )}
              />
            </button>
          );
        })}
      </div>
      {showLabel && value > 0 && (
        <span className="text-xs text-muted-foreground">
          {ratingLabels[value] || ''}
        </span>
      )}
    </div>
  );
}

/**
 * RatingDisplay - Read-only star rating display
 *
 * Displays filled/empty stars based on the rating value.
 * Used for showing average ratings in cards.
 */
interface RatingDisplayProps {
  value: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
  className?: string;
}

export function RatingDisplay({
  value,
  maxRating = 5,
  size = 'sm',
  showValue = false,
  count,
  className,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= Math.round(value);

          return (
            <Star
              key={index}
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-muted-foreground/50'
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground">
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  );
}