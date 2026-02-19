'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function StarRatingInput({ value, onChange, disabled, size = 'md' }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0)

  const starSize = size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={cn(
              'transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            )}
            onMouseEnter={() => !disabled && setHovered(star)}
            onClick={() => !disabled && onChange(star)}
          >
            <Star
              className={cn(
                starSize,
                'transition-colors',
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-muted text-muted-foreground/30 hover:text-amber-300'
              )}
            />
          </button>
        )
      })}
      {value > 0 && (
        <span className="ml-1.5 text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  )
}
