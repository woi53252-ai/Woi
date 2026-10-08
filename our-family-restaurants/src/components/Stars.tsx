import { useState } from 'react'
import { Star } from 'lucide-react'

function starFill(value: number, star: number) {
  const amount = Math.max(0, Math.min(1, value - (star - 1)))
  return amount
}

export function StaticStars({ value, count = 5, size = 'text-lg' }: { value: number | null; count?: number; size?: string }) {
  const normalized = value ?? 0
  return (
    <span className={`inline-flex items-center ${size} leading-none`} aria-label={value == null ? '별점 없음' : `${value.toFixed(1)}점`}>
      {Array.from({ length: count }, (_, index) => {
        const fill = starFill(normalized, index + 1)
        return <span key={index} className="relative inline-flex h-[1em] w-[1em] items-center justify-center">
          <Star size="1em" strokeWidth={2.1} className="absolute text-[#d8ccc2]" />
          {fill > 0 && <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}><Star size="1em" strokeWidth={2.1} className="text-[#f2aa38]" fill="currentColor" /></span>}
        </span>
      })}
    </span>
  )
}

export function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hover, setHover] = useState<number | null>(null)
  const active = hover ?? value
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)} role="group" aria-label="별점 선택">
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1
        const fill = starFill(active, star)
        return (
          <div key={star} className="relative h-10 w-10 sm:h-11 sm:w-11">
            <div className="pointer-events-none absolute inset-0">
              <Star size="2.2rem" strokeWidth={2.1} className="absolute inset-0 text-[#d8ccc2]" />
              {fill > 0 && <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}><Star size="2.2rem" strokeWidth={2.1} className="text-[#f2aa38]" fill="currentColor" /></span>}
            </div>
            <button type="button" className="absolute inset-y-0 left-0 w-1/2" onMouseEnter={() => setHover(star - 0.5)} onFocus={() => setHover(star - 0.5)} onClick={() => onChange(star - 0.5)} aria-label={`${star - 0.5}점`} />
            <button type="button" className="absolute inset-y-0 right-0 w-1/2" onMouseEnter={() => setHover(star)} onFocus={() => setHover(star)} onClick={() => onChange(star)} aria-label={`${star}점`} />
          </div>
        )
      })}
      <span className="ml-2 min-w-9 self-center text-sm font-bold text-[#6e5e54]">{active.toFixed(1)}</span>
    </div>
  )
}

