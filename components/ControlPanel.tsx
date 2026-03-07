'use client'

import type { TextStyle, CoverConcept, Template } from '@/lib/types'
import { TEMPLATES, customLayoutToTemplate } from '@/lib/templates'
import { COLOR_GRADES } from '@/lib/grades'

interface Props {
  titleStyle: TextStyle
  subtitleStyle: TextStyle
  authorStyle: TextStyle
  onTitleStyleChange: (s: TextStyle) => void
  onSubtitleStyleChange: (s: TextStyle) => void
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
  colorGradeId: string
  onColorGradeChange: (id: string) => void
  onEnableDepth: () => void
  isRemovingBg: boolean
  hasDepth: boolean
  focusedElement: 'title' | 'subtitle' | 'author'
  onElementFocus: (el: 'title' | 'subtitle' | 'author') => void
}

const FONTS = [
  // Expressive / high personality
  { label: 'Abril Fatface', value: 'Abril Fatface' },
  { label: 'Dancing Script', value: 'Dancing Script' },
  { label: 'Pacifico', value: 'Pacifico' },
  // Serif
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'EB Garamond', value: 'EB Garamond' },
  { label: 'Cinzel', value: 'Cinzel' },
  { label: 'Lora', value: 'Lora' },
  { label: 'Georgia', value: 'Georgia' },
  // Sans-serif
  { label: 'Bebas Neue', value: 'Bebas Neue' },
  { label: 'Oswald', value: 'Oswald' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Raleway', value: 'Raleway' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Helvetica', value: 'Helvetica' },
  // Mono
  { label: 'Courier New', value: 'Courier New' },
]

const sel = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors'

function TemplateThumbnail({ id, active }: { id: string; active: boolean }) {
  const base = `relative w-[48px] h-[72px] rounded overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
    active ? 'border-indigo-500 ring-1 ring-indigo-500/40' : 'border-zinc-700 hover:border-zinc-500'
  }`

  const bg = <div className="absolute inset-0 bg-zinc-700" />

  const map: Record<string, React.ReactNode> = {
    // Literary: heavy vignette top, italic serif title at top center
    classic: (<div className={base}>{bg}
      <div className="absolute inset-0 bg-gradient-to-b from-black/74 via-transparent to-black/45" />
      <div className="absolute top-[9px] left-[8px] right-[8px] h-[5px] bg-white/82 rounded-[1px]" style={{ borderRadius: '2px' }} />
      <div className="absolute bottom-[4px] left-[12px] right-[12px] h-[2px] bg-white/30 rounded-[1px]" />
    </div>),

    // Editorial: barely-there tint, uppercase left text at top, author bottom-left
    minimal: (<div className={base}>{bg}
      <div className="absolute inset-0 bg-black/12" />
      <div className="absolute top-[6px] left-[5px] right-[16px] h-[4px] bg-white/88 rounded-[1px]" />
      <div className="absolute top-[13px] left-[5px] right-[22px] h-[3px] bg-white/55 rounded-[1px]" />
      <div className="absolute bottom-[4px] left-[5px] w-[20px] h-[2px] bg-white/35 rounded-[1px]" />
    </div>),

    // Cinematic: vignette, huge title at 42%, accent lines flanking, author bottom
    cinematic: (<div className={base}>{bg}
      <div className="absolute inset-0 bg-gradient-to-b from-black/42 via-transparent to-black/68" />
      <div className="absolute top-[28px] left-[4px] right-[4px] h-[7px] bg-white/85 rounded-[1px]" />
      <div className="absolute top-[30px] left-[2px] w-[4px] h-[1px] bg-white/38" />
      <div className="absolute top-[30px] right-[2px] w-[4px] h-[1px] bg-white/38" />
      <div className="absolute bottom-[3px] left-[13px] right-[13px] h-[2px] bg-white/28 rounded-[1px]" />
    </div>),

    // Noir: dark band bottom 40%, cream title in shadow, diamond, author
    noir: (<div className={base}>{bg}
      <div className="absolute bottom-0 left-0 right-0 h-[30px] bg-black/95" />
      <div className="absolute left-0 right-0 h-[10px]" style={{ bottom: '30px', background: 'linear-gradient(to top,rgba(0,0,0,0.95),transparent)' }} />
      <div className="absolute bottom-[18px] left-[5px] right-[5px] h-[5px] bg-[#f0ebe0]/78 rounded-[1px]" />
      <div className="absolute bottom-[11px] left-0 right-0 flex justify-center">
        <div className="w-[3px] h-[3px] rotate-45 bg-[#9a9080]/55" />
      </div>
      <div className="absolute bottom-[4px] left-[14px] right-[14px] h-[2px] bg-[#9a9080]/45 rounded-[1px]" />
    </div>),

    // Heritage: sepia tint + heavy vignette bottom, inset border, dots divider
    retro: (<div className={base}>{bg}
      <div className="absolute inset-0" style={{ background: 'rgba(100,65,10,0.22)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/82" />
      <div className="absolute inset-[3px] border border-[rgba(245,230,200,0.40)]" />
      <div className="absolute bottom-[14px] left-[7px] right-[7px] h-[4px] bg-[#f5e6c8]/72 rounded-[1px]" />
      <div className="absolute bottom-[8px] left-0 right-0 flex justify-center gap-[4px]">
        <div className="w-[2px] h-[2px] rounded-full bg-[#c8aa78]/55" />
        <div className="w-[2px] h-[2px] rounded-full bg-[#c8aa78]/55" />
        <div className="w-[2px] h-[2px] rounded-full bg-[#c8aa78]/55" />
      </div>
      <div className="absolute bottom-[3px] left-[14px] right-[14px] h-[2px] bg-[#c8aa78]/40 rounded-[1px]" />
    </div>),

    // Thriller: heavy vignette both ends, uppercase title at top, red bar, author bottom
    thriller: (<div className={base}>{bg}
      <div className="absolute inset-0 bg-gradient-to-b from-black/74 via-transparent to-black/70" />
      <div className="absolute top-[8px] left-[4px] right-[4px] h-[6px] bg-white/85 rounded-[1px]" />
      <div className="absolute top-[17px] left-[10px] right-[10px] h-[2px] bg-[#e63946]" />
      <div className="absolute bottom-[4px] left-[14px] right-[14px] h-[2px] bg-white/25 rounded-[1px]" />
    </div>),

    // Romance: very light tint, script title at center, ornament + diamond divider
    elegant: (<div className={base}>{bg}
      <div className="absolute inset-0 bg-black/8" />
      <div className="absolute top-[25px] left-0 right-0 flex justify-center text-white/45 text-[6px] leading-none">◆</div>
      <div className="absolute top-[32px] left-[5px] right-[5px] h-[6px] bg-white/82 rounded-[2px]" />
      <div className="absolute top-[41px] left-0 right-0 flex justify-center text-white/30 text-[6px] leading-none">◆</div>
      <div className="absolute bottom-[6px] left-[12px] right-[12px] h-[2px] bg-white/35 rounded-[1px]" />
    </div>),

    // Bold: solid cream block, right-aligned dark text — unchanged
    bold: (<div className={base}>{bg}
      <div className="absolute bottom-0 left-0 right-0 h-[26px] bg-[#f0ede5]" />
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
  const fontIdx = Math.max(0, FONTS.findIndex(f => f.value === style.fontFamily))

  const cycleFont = (dir: 1 | -1) => {
    const next = (fontIdx + dir + FONTS.length) % FONTS.length
    onChange({ ...style, fontFamily: FONTS[next].value })
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Font</label>
        {/* Font selector with prev/next arrows for quick cycling */}
        <div className="flex gap-1 items-center">
          <button
            onClick={() => cycleFont(-1)}
            className="shrink-0 w-7 h-[34px] flex items-center justify-center bg-zinc-900 border border-zinc-700 rounded text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors text-base leading-none"
          >‹</button>
          <select value={style.fontFamily} onChange={e => onChange({ ...style, fontFamily: e.target.value })} className={`${sel} flex-1`}>
            {FONTS.map(f => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => cycleFont(1)}
            className="shrink-0 w-7 h-[34px] flex items-center justify-center bg-zinc-900 border border-zinc-700 rounded text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors text-base leading-none"
          >›</button>
        </div>
        {/* Live font preview */}
        <div className="mt-1 px-2 py-1.5 bg-zinc-800 rounded text-center overflow-hidden" style={{
          fontFamily: `"${style.fontFamily}", serif`,
          fontSize: 18,
          color: '#e4e4e7',
          fontStyle: style.italic ? 'italic' : 'normal',
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          Aa Bb Cc 123
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Size — {style.fontSize}px</label>
        <input type="range" min={10} max={160} value={style.fontSize}
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
      {/* Italic + Width-fill toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange({ ...style, italic: !style.italic })}
          className={`px-2.5 py-1 text-xs rounded border transition-colors ${
            style.italic
              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
              : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
          }`}
        >
          <span style={{ fontStyle: 'italic' }}>I</span> Italic
        </button>
        <button
          onClick={() => onChange({ ...style, widthFill: !style.widthFill })}
          title="Auto-size each word to fill canvas width"
          className={`px-2.5 py-1 text-xs rounded border transition-colors ${
            style.widthFill
              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
              : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
          }`}
        >
          ↔ Fill
        </button>
      </div>
      {/* Rotation */}
      <div>
        <label className="text-xs text-zinc-500 block mb-1">
          Rotation — {style.rotation ?? 0}°
        </label>
        <input type="range" min={-30} max={30} step={0.5} value={style.rotation ?? 0}
          onChange={e => onChange({ ...style, rotation: Number(e.target.value) })}
          className="w-full accent-indigo-500" />
      </div>
      {/* Line height */}
      <div>
        <label className="text-xs text-zinc-500 block mb-1">
          Line Height — {(style.lineHeight ?? 1.2).toFixed(1)}×
        </label>
        <input type="range" min={80} max={200} step={5} value={Math.round((style.lineHeight ?? 1.2) * 100)}
          onChange={e => onChange({ ...style, lineHeight: Number(e.target.value) / 100 })}
          className="w-full accent-indigo-500" />
      </div>
      {/* Letter spacing */}
      <div>
        <label className="text-xs text-zinc-500 block mb-1">
          Letter Spacing — {style.letterSpacing ?? 0}px
        </label>
        <input type="range" min={0} max={20} step={0.5} value={style.letterSpacing ?? 0}
          onChange={e => onChange({ ...style, letterSpacing: Number(e.target.value) })}
          className="w-full accent-indigo-500" />
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
  titleStyle, subtitleStyle, authorStyle,
  onTitleStyleChange, onSubtitleStyleChange, onAuthorStyleChange,
  onExport, canExport,
  concept, onRegenerate, isGenerating,
  activeTemplateId, onApplyTemplate,
  imageScale, onImageScaleChange, hasImage,
  colorGradeId, onColorGradeChange,
  onEnableDepth, isRemovingBg, hasDepth,
  focusedElement, onElementFocus,
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
            {/* AI Layout tile */}
            <div
              className={`flex flex-col items-center gap-1 ${concept?.customLayout ? 'cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
              onClick={() => {
                if (concept?.customLayout) onApplyTemplate(customLayoutToTemplate(concept.customLayout))
              }}
            >
              <div className={`relative w-[48px] h-[72px] rounded overflow-hidden border-2 transition-all flex-shrink-0 flex items-center justify-center ${
                activeTemplateId === 'ai'
                  ? 'border-indigo-500 ring-1 ring-indigo-500/40'
                  : 'border-zinc-700 hover:border-indigo-600'
              }`}
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 50%, #1a1020 100%)' }}
              >
                <span className="text-[18px] leading-none" style={{
                  background: 'linear-gradient(135deg, #a78bfa, #f0abfc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>✦</span>
              </div>
              <span className={`text-[9px] text-center leading-tight ${activeTemplateId === 'ai' ? 'text-indigo-400' : 'text-zinc-500'}`}>
                AI
              </span>
            </div>
          </div>
          {concept?.customLayout && activeTemplateId !== 'ai' && (
            <p className="text-[10px] text-indigo-400/70 mt-2">✦ AI layout ready — click to apply</p>
          )}
        </div>

        {/* ── Image ─────────────────────────────────────────── */}
        {hasImage && (
          <div className="border-t border-zinc-800 pt-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Image</p>
            <label className="text-xs text-zinc-500 block">Zoom — {Math.round(imageScale * 100)}%</label>
            <input type="range" min={100} max={300} step={5} value={Math.round(imageScale * 100)}
              onChange={e => onImageScaleChange(Number(e.target.value) / 100)}
              className="w-full accent-indigo-500" />
            <p className="text-xs text-zinc-600">Drag the canvas to reposition</p>
          </div>
        )}

        {/* ── Color Grade ───────────────────────────────────── */}
        {hasImage && (
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Color Grade</p>
            <div className="grid grid-cols-4 gap-1.5">
              {COLOR_GRADES.map(g => (
                <button
                  key={g.id}
                  onClick={() => onColorGradeChange(g.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded border text-[9px] transition-all ${
                    colorGradeId === g.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-zinc-600" style={{ background: g.swatch }} />
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Typography ────────────────────────────────────── */}
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Typography</p>
          {/* Element selector tabs */}
          <div className="flex mb-4 border-b border-zinc-800">
            {(['title', 'subtitle', 'author'] as const).map(el => (
              <button
                key={el}
                onClick={() => onElementFocus(el)}
                className={`flex-1 pb-1.5 text-[11px] capitalize transition-colors ${
                  focusedElement === el
                    ? 'text-zinc-100 border-b-2 border-indigo-500 -mb-px'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
          {focusedElement === 'title' && (
            <TextStyleControl label="Title" style={titleStyle} onChange={onTitleStyleChange} />
          )}
          {focusedElement === 'subtitle' && (
            <TextStyleControl label="Subtitle" style={subtitleStyle} onChange={onSubtitleStyleChange} />
          )}
          {focusedElement === 'author' && (
            <TextStyleControl label="Author" style={authorStyle} onChange={onAuthorStyleChange} />
          )}
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
