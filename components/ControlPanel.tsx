'use client'

import type { TextStyle, CoverConcept, Template } from '@/lib/types'
import { TEMPLATES } from '@/lib/templates'

interface Props {
  titleStyle: TextStyle
  authorStyle: TextStyle
  onTitleStyleChange: (s: TextStyle) => void
  onAuthorStyleChange: (s: TextStyle) => void
  onExport: () => void
  canExport: boolean
  concept: CoverConcept | null
  onRegenerate: () => void
  isGenerating: boolean
  activeTemplateId: string
  onApplyTemplate: (t: Template) => void
  imageScale: number
  onImageScaleChange: (s: number) => void
  hasImage: boolean
  onEnableDepth: () => void
  isRemovingBg: boolean
  hasDepth: boolean
}

const FONTS = [
  // Google Fonts
  { label: 'Bebas Neue', value: 'Bebas Neue' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Oswald', value: 'Oswald' },
  { label: 'Cinzel', value: 'Cinzel' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'EB Garamond', value: 'EB Garamond' },
  // System fonts
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Palatino', value: 'Palatino Linotype' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Courier New', value: 'Courier New' },
]

const sel = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors'

function TemplateThumbnail({ id, active }: { id: string; active: boolean }) {
  const base = `relative w-[48px] h-[72px] rounded overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
    active ? 'border-indigo-500 ring-1 ring-indigo-500/40' : 'border-zinc-700 hover:border-zinc-500'
  }`

  const bg = <div className="absolute inset-0 bg-zinc-700" />

  const map: Record<string, React.ReactNode> = {
    // Classic: vignette, title + divider + author at bottom
    classic: (<div className={base}>{bg}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
      <div className="absolute bottom-[13px] left-[4px] right-[4px] h-[5px] bg-white/80 rounded-[1px]" />
      <div className="absolute bottom-[8px] left-[18px] right-[18px] h-[1px] bg-white/30" />
      <div className="absolute bottom-[4px] left-[10px] right-[10px] h-[3px] bg-white/35 rounded-[1px]" />
    </div>),

    // Minimal: barely any overlay, left-aligned text at top
    minimal: (<div className={base}>{bg}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-[7px] left-[5px] w-[26px] h-[3px] bg-white/80 rounded-[1px]" />
      <div className="absolute top-[14px] left-[5px] w-[18px] h-[2px] bg-white/40 rounded-[1px]" />
    </div>),

    // Cinematic: tint, centered, accent lines flanking
    cinematic: (<div className={base}>{bg}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute top-[31px] left-[3px] w-[9px] h-[1px] bg-white/35" />
      <div className="absolute top-[31px] right-[3px] w-[9px] h-[1px] bg-white/35" />
      <div className="absolute top-[28px] left-[14px] right-[14px] h-[6px] bg-white/80 rounded-[1px]" />
      <div className="absolute bottom-[3px] left-[11px] right-[11px] h-[2px] bg-white/30 rounded-[1px]" />
    </div>),

    // Noir: feathered dark band at bottom
    noir: (<div className={base}>{bg}
      <div className="absolute bottom-0 left-0 right-0 h-[28px] bg-black/93" />
      <div className="absolute left-0 right-0 h-[10px]" style={{ bottom: '28px', background: 'linear-gradient(to top,rgba(0,0,0,0.93),transparent)' }} />
      <div className="absolute bottom-[15px] left-[4px] right-[4px] h-[5px] bg-[#f0ebe0]/70 rounded-[1px]" />
      <div className="absolute bottom-[7px] left-[14px] right-[14px] h-[2px] bg-[#9a9080]/50 rounded-[1px]" />
    </div>),

    // Retro: warm sepia tint + border frame
    retro: (<div className={base}>{bg}
      <div className="absolute inset-0" style={{ background: 'rgba(130,80,20,0.30)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <div className="absolute inset-[3px] border border-[rgba(245,230,200,0.45)]" />
      <div className="absolute bottom-[14px] left-[6px] right-[6px] h-[4px] bg-[#f5e6c8]/70 rounded-[1px]" />
      <div className="absolute bottom-[7px] left-[14px] right-[14px] h-[2px] bg-[#c8aa78]/50 rounded-[1px]" />
    </div>),

    // Thriller: heavy vignette, title at top, red bar
    thriller: (<div className={base}>{bg}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/65" />
      <div className="absolute top-[7px] left-[5px] right-[5px] h-[6px] bg-white/80 rounded-[1px]" />
      <div className="absolute top-[16px] left-[12px] right-[12px] h-[2px] bg-[#e63946]" />
      <div className="absolute bottom-[4px] left-[11px] right-[11px] h-[2px] bg-white/25 rounded-[1px]" />
    </div>),

    // Elegant: lavender tint, ornament ◆, centered, diamond divider
    elegant: (<div className={base}>{bg}
      <div className="absolute inset-0" style={{ background: 'rgba(130,80,160,0.18)' }} />
      <div className="absolute inset-0 bg-black/22" />
      <div className="absolute top-[26px] left-0 right-0 flex justify-center text-white/40 text-[6px] leading-none">◆</div>
      <div className="absolute top-[35px] left-[6px] right-[6px] h-[5px] bg-white/75 rounded-[1px]" />
      <div className="absolute top-[43px] left-0 right-0 flex justify-center text-white/25 text-[6px] leading-none">◆</div>
      <div className="absolute bottom-[7px] left-[10px] right-[10px] h-[2px] bg-white/35 rounded-[1px]" />
    </div>),

    // Bold: solid cream block bottom-right, dark text
    bold: (<div className={base}>{bg}
      <div className="absolute bottom-0 left-0 right-0 h-[26px] bg-[#f0ede5]" />
      <div className="absolute bottom-[14px] left-[4px] right-[4px] h-[5px] bg-zinc-800/80 rounded-[1px]" style={{ marginLeft: 'auto' }} />
      <div className="absolute bottom-[14px] right-[4px] w-[28px] h-[5px] bg-zinc-800/80 rounded-[1px]" />
      <div className="absolute bottom-[6px] right-[4px] w-[20px] h-[3px] bg-zinc-600/60 rounded-[1px]" />
    </div>),
  }

  return map[id] ?? null
}

function TextStyleControl({
  label, style, onChange,
}: {
  label: string; style: TextStyle; onChange: (s: TextStyle) => void
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Font</label>
        <select value={style.fontFamily} onChange={e => onChange({ ...style, fontFamily: e.target.value })} className={sel}>
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Size — {style.fontSize}px</label>
        <input type="range" min={10} max={80} value={style.fontSize}
          onChange={e => onChange({ ...style, fontSize: Number(e.target.value) })}
          className="w-full accent-indigo-500" />
      </div>
      <div className="flex items-center gap-2.5">
        <label className="text-xs text-zinc-500">Color</label>
        <input type="color" value={style.color.startsWith('rgba') ? '#ffffff' : style.color}
          onChange={e => onChange({ ...style, color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer" />
        <span className="text-xs text-zinc-500 font-mono truncate">{style.color}</span>
      </div>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Outline — {style.strokeWidth ?? 0}px</label>
        <input type="range" min={0} max={8} value={style.strokeWidth ?? 0}
          onChange={e => onChange({ ...style, strokeWidth: Number(e.target.value) })}
          className="w-full accent-indigo-500" />
      </div>
      {(style.strokeWidth ?? 0) > 0 && (
        <div className="flex items-center gap-2.5">
          <label className="text-xs text-zinc-500">Outline color</label>
          <input type="color" value={style.strokeColor ?? '#000000'}
            onChange={e => onChange({ ...style, strokeColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer" />
        </div>
      )}
    </div>
  )
}

export default function ControlPanel({
  titleStyle, authorStyle,
  onTitleStyleChange, onAuthorStyleChange,
  onExport, canExport,
  concept, onRegenerate, isGenerating,
  activeTemplateId, onApplyTemplate,
  imageScale, onImageScaleChange, hasImage,
  onEnableDepth, isRemovingBg, hasDepth,
}: Props) {
  return (
    <aside className="w-72 border-l border-zinc-800 flex flex-col bg-zinc-950 overflow-y-auto shrink-0">
      <div className="p-5 flex-1 space-y-5">

        {/* ── Templates ─────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Layout</p>
          <div className="grid grid-cols-4 gap-x-2 gap-y-3">
            {TEMPLATES.map(t => (
              <div key={t.id} className="flex flex-col items-center gap-1" onClick={() => onApplyTemplate(t)}>
                <TemplateThumbnail id={t.id} active={activeTemplateId === t.id} />
                <span className={`text-[9px] text-center leading-tight ${activeTemplateId === t.id ? 'text-indigo-400' : 'text-zinc-500'}`}>
                  {t.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Image ─────────────────────────────────────────── */}
        {hasImage && (
          <div className="border-t border-zinc-800 pt-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Image</p>
            <label className="text-xs text-zinc-500 block">Zoom — {Math.round(imageScale * 100)}%</label>
            <input type="range" min={50} max={300} step={5} value={Math.round(imageScale * 100)}
              onChange={e => onImageScaleChange(Number(e.target.value) / 100)}
              className="w-full accent-indigo-500" />
            <p className="text-xs text-zinc-600">Drag the canvas to reposition</p>
          </div>
        )}

        {/* ── Typography ────────────────────────────────────── */}
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Typography</p>
          <TextStyleControl label="Title" style={titleStyle} onChange={onTitleStyleChange} />
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <TextStyleControl label="Author" style={authorStyle} onChange={onAuthorStyleChange} />
        </div>

        {/* ── AI palette ────────────────────────────────────── */}
        {concept && (
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Concept</p>
            {concept.mood && (
              <p className="text-xs text-zinc-500 leading-relaxed italic">"{concept.mood}"</p>
            )}
            {concept.colorPalette?.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">Suggested palette</p>
                <div className="flex gap-1.5">
                  {concept.colorPalette.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded border border-zinc-700 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                      onClick={() => onTitleStyleChange({ ...titleStyle, color })}
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-600 mt-1">Click to apply to title</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Actions ───────────────────────────────────────── */}
      <div className="p-5 border-t border-zinc-800 space-y-2">
        {hasImage && (
          <button
            onClick={onEnableDepth}
            disabled={isRemovingBg || hasDepth}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-100 text-sm rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isRemovingBg ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Extracting subject…
              </>
            ) : hasDepth ? '✓ Depth effect on' : '✦ Enable depth effect'}
          </button>
        )}
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-100 text-sm rounded-md transition-colors"
        >
          Regenerate
        </button>
        <button
          onClick={onExport}
          disabled={!canExport}
          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          Export PNG
        </button>
      </div>
    </aside>
  )
}
