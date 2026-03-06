'use client'

import type { TextStyle, CoverConcept } from '@/lib/types'

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
}

const FONTS = [
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Palatino', value: 'Palatino Linotype' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Courier New', value: 'Courier New' },
]

const selectClass =
  'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors'

function TextStyleControl({
  label,
  style,
  onChange,
}: {
  label: string
  style: TextStyle
  onChange: (s: TextStyle) => void
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Font Family</label>
        <select
          value={style.fontFamily}
          onChange={e => onChange({ ...style, fontFamily: e.target.value })}
          className={selectClass}
        >
          {FONTS.map(f => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Size — {style.fontSize}px</label>
        <input
          type="range"
          min={10}
          max={80}
          value={style.fontSize}
          onChange={e => onChange({ ...style, fontSize: Number(e.target.value) })}
          className="w-full accent-indigo-500"
        />
      </div>
      <div className="flex items-center gap-2.5">
        <label className="text-xs text-zinc-500">Color</label>
        <input
          type="color"
          value={style.color}
          onChange={e => onChange({ ...style, color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer"
        />
        <span className="text-xs text-zinc-500 font-mono">{style.color}</span>
      </div>
    </div>
  )
}

export default function ControlPanel({
  titleStyle,
  authorStyle,
  onTitleStyleChange,
  onAuthorStyleChange,
  onExport,
  canExport,
  concept,
  onRegenerate,
  isGenerating,
}: Props) {
  return (
    <aside className="w-72 border-l border-zinc-800 flex flex-col bg-zinc-950 overflow-y-auto shrink-0">
      <div className="p-5 flex-1 space-y-5">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Typography</p>

        <TextStyleControl label="Title" style={titleStyle} onChange={onTitleStyleChange} />

        <div className="border-t border-zinc-800 pt-4">
          <TextStyleControl label="Author" style={authorStyle} onChange={onAuthorStyleChange} />
        </div>

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
                <p className="text-xs text-zinc-600 mt-1">Click a swatch to apply to title</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 border-t border-zinc-800 space-y-2">
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
