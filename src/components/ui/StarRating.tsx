import { useState } from 'react'
import clsx from 'clsx'

export function StarRating({ value, onChange, readOnly, size = 20 }: {
  value: number; onChange?: (v: number) => void; readOnly?: boolean; size?: number
}) {
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value
  return (
    <div className="flex items-center gap-0.5" role={readOnly ? undefined : 'radiogroup'} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n} type="button" disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(null)}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={clsx('leading-none', !readOnly && 'cursor-pointer')}
        >
          <svg width={size} height={size} viewBox="0 0 20 20" fill={n <= shown ? '#F5620E' : 'none'} stroke={n <= shown ? '#F5620E' : '#D8DCE2'} strokeWidth="1.5">
            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5z" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  )
}
