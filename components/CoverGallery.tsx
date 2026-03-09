'use client'

import type { GeneratedVariant } from '@/lib/types'

interface Props {
  variants: GeneratedVariant[]
  title: string
  author: string
  onSelect: (variant: GeneratedVariant) => void
  onBack: () => void
}

const STYLE_CONFIG: Record<string, {
  overlayStyle: React.CSSProperties
  titleStyle: React.CSSProperties
  authorStyle: React.CSSProperties
  titleYPct: number
  authorYPct: number
  topBlock?: string
}> = {
  'Cinematic': {
    overlayStyle: {
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 35%, rgba(0,0,0,0.55) 100%)',
    },
    titleStyle: {
      color: '#ffffff',
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      textShadow: '0 2px 16px rgba(0,0,0,0.95)',
    },
    authorStyle: {
      color: 'rgba(255,255,255,0.70)',
      fontFamily: '"EB Garamond", serif',
      textShadow: '0 1px 8px rgba(0,0,0,0.9)',
    },
    titleYPct: 18,
    authorYPct: 91,
  },
  'Literary Clean': {
    overlayStyle: {
      background: 'linear-gradient(to bottom, #f5f0eb 0%, #f5f0eb 36%, rgba(245,240,235,0.0) 42%)',
    },
    titleStyle: {
      color: '#c45c2a',
      fontFamily: '"Playfair Display", serif',
      fontStyle: 'italic',
      fontWeight: 400,
      textShadow: 'none',
    },
    authorStyle: {
      color: 'rgba(196,92,42,0.80)',
      fontFamily: '"EB Garamond", serif',
      textShadow: 'none',
    },
    titleYPct: 16,
    authorYPct: 91,
  },
  'Bold': {
    overlayStyle: {
      background: 'rgba(0,0,0,0.10)',
    },
    titleStyle: {
      color: '#ffffff',
      fontFamily: '"Abril Fatface", serif',
      fontWeight: 400,
      textShadow: '0 2px 20px rgba(0,0,0,0.85)',
    },
    authorStyle: {
      color: 'rgba(255,255,255,0.65)',
      fontFamily: '"Montserrat", sans-serif',
      textShadow: '0 1px 8px rgba(0,0,0,0.9)',
    },
    titleYPct: 40,
    authorYPct: 91,
  },
  'Atmospheric': {
    overlayStyle: {
      background: 'rgba(0,0,0,0.36)',
    },
    titleStyle: {
      color: '#ffffff',
      fontFamily: '"Playfair Display", serif',
      fontStyle: 'italic',
      fontWeight: 400,
      textShadow: '0 2px 24px rgba(0,0,0,0.95)',
    },
    authorStyle: {
      color: 'rgba(255,255,255,0.65)',
      fontFamily: '"EB Garamond", serif',
      textShadow: '0 1px 8px rgba(0,0,0,0.9)',
    },
    titleYPct: 42,
    authorYPct: 91,
  },
}

function SkeletonCard() {
  return (
    <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 to-zinc-800" />
      <div className="absolute top-[14%] left-[10%] right-[10%] h-6 bg-zinc-600 rounded" />
      <div className="absolute top-[22%] left-[18%] right-[18%] h-4 bg-zinc-700 rounded" />
      <div className="absolute bottom-[8%] left-[20%] right-[20%] h-3 bg-zinc-700 rounded" />
      {/* Shimmer */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
          animation: 'shimmer 1.6s infinite',
        }}
      />
    </div>
  )
}

function CoverCard({
  variant, title, author, onSelect, index,
}: {
  variant: GeneratedVariant
  title: string
  author: string
  onSelect: () => void
  index: number
}) {
  const styleName = variant.concept?.styleName ?? ['Cinematic', 'Literary Clean', 'Bold', 'Atmospheric'][index]
  const cfg = STYLE_CONFIG[styleName] ?? STYLE_CONFIG['Cinematic']
  const isReady = !variant.isLoading && variant.imageUrl

  if (variant.isLoading || !variant.imageUrl) {
    return (
      <div className="flex flex-col gap-2">
        <SkeletonCard />
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] text-zinc-500 font-medium tracking-wide">{styleName}</span>
          <span className="text-[10px] text-zinc-600">Generating…</span>
        </div>
      </div>
    )
  }

  const imageObjectPosition = styleName === 'Literary Clean' ? 'bottom center' : 'center'

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onSelect}
        disabled={!isReady}
        className="relative w-full aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer disabled:cursor-not-allowed ring-2 ring-transparent hover:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-[1.02]"
      >
        {/* Background image */}
        <img
          src={variant.imageUrl}
          alt={`${styleName} cover`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: imageObjectPosition }}
        />

        {/* Style overlay */}
        <div className="absolute inset-0" style={cfg.overlayStyle} />

        {/* Title */}
        <div
          className="absolute left-0 right-0 px-4 text-center"
          style={{
            top: `${cfg.titleYPct}%`,
            transform: 'translateY(-50%)',
            ...cfg.titleStyle,
            fontSize: styleName === 'Bold' ? 'clamp(18px, 6vw, 28px)' : 'clamp(15px, 4.5vw, 22px)',
            lineHeight: 1.15,
          }}
        >
          {title || 'Your Title'}
        </div>

        {/* Author */}
        <div
          className="absolute left-0 right-0 px-4 text-center"
          style={{
            top: `${cfg.authorYPct}%`,
            transform: 'translateY(-50%)',
            ...cfg.authorStyle,
            fontSize: 'clamp(9px, 2.5vw, 11px)',
            letterSpacing: '0.06em',
          }}
        >
          {author || 'Author Name'}
        </div>

        {/* Hover select overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-indigo-600 text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-lg">
            Select this style
          </span>
        </div>
      </button>

      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] text-zinc-400 font-medium tracking-wide">{styleName}</span>
        <span className="text-[10px] text-zinc-600">Click to customize</span>
      </div>
    </div>
  )
}

export default function CoverGallery({ variants, title, author, onSelect, onBack }: Props) {
  const allDone = variants.every(v => !v.isLoading)
  const anyReady = variants.some(v => !v.isLoading && v.imageUrl)

  // Pad to 4 cards if we have fewer
  const cards: GeneratedVariant[] = [
    ...variants,
    ...Array(Math.max(0, 4 - variants.length)).fill({ concept: null, imageUrl: null, cdnUrl: null, isLoading: true, error: null }),
  ]

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-7 pb-4 shrink-0">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Choose your direction</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {allDone
              ? 'All 4 styles ready — click one to open the editor'
              : anyReady
              ? 'Some styles are ready — more loading…'
              : 'Generating 4 distinct cover styles…'}
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Edit details
        </button>
      </div>

      {/* 2×2 grid */}
      <div className="flex-1 px-8 pb-8">
        <div className="grid grid-cols-2 gap-5 max-w-xl mx-auto">
          {cards.map((v, i) => (
            <CoverCard
              key={i}
              variant={v}
              title={title}
              author={author}
              onSelect={() => onSelect(v)}
              index={i}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
