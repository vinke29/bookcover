import type { Template } from './types'

export const CANVAS_W = 500
export const CANVAS_H = 750

export const TEMPLATES: Template[] = [
  // ── 1. Classic ──────────────────────────────────────────────────────────────
  // Dark vignette, serif, title bottom-center. The dependable default.
  {
    id: 'classic',
    name: 'Classic',
    titleStyle: { fontFamily: 'Georgia', fontSize: 44, color: '#ffffff' },
    authorStyle: { fontFamily: 'Georgia', fontSize: 18, color: '#d4d4d8' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.78 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.93 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'vignette', topOpacity: 0.40, bottomOpacity: 0.88 },
    showDivider: true, dividerStyle: 'line',
    accentLines: false,
  },

  // ── 2. Minimal ──────────────────────────────────────────────────────────────
  // Barely-there tint, small Helvetica, LEFT-aligned at the very top.
  // The image is the hero — text stays out of the way.
  {
    id: 'minimal',
    name: 'Minimal',
    titleStyle: { fontFamily: 'Helvetica', fontSize: 20, color: '#ffffff' },
    authorStyle: { fontFamily: 'Helvetica', fontSize: 11, color: 'rgba(255,255,255,0.55)' },
    titlePos: { x: 28, y: CANVAS_H * 0.09 },
    authorPos: { x: 28, y: CANVAS_H * 0.15 },
    titleAlign: 'left', authorAlign: 'left',
    titleTransform: 'none',
    overlayStyle: { type: 'tint', opacity: 0.10 },
    showDivider: false, dividerStyle: 'line',
    accentLines: false,
  },

  // ── 3. Cinematic ────────────────────────────────────────────────────────────
  // Full-tint, Impact font centered, flanked by thin accent lines.
  // Film-poster energy.
  {
    id: 'cinematic',
    name: 'Cinematic',
    titleStyle: { fontFamily: 'Impact', fontSize: 52, color: '#ffffff' },
    authorStyle: { fontFamily: 'Helvetica', fontSize: 13, color: '#aaaaaa' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.46 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.95 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'tint', opacity: 0.30 },
    showDivider: false, dividerStyle: 'line',
    accentLines: true,
    accentLineColor: 'rgba(255,255,255,0.32)',
  },

  // ── 4. Noir ─────────────────────────────────────────────────────────────────
  // Solid dark band at the bottom (feathered edge), off-white serif,
  // diamond divider. Moody and atmospheric.
  {
    id: 'noir',
    name: 'Noir',
    titleStyle: { fontFamily: 'Georgia', fontSize: 38, color: '#f0ebe0' },
    authorStyle: { fontFamily: 'Georgia', fontSize: 14, color: '#9a9080' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.80 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.925 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'band', bandRatio: 0.38, opacity: 0.93 },
    showDivider: true, dividerStyle: 'diamond',
    accentLines: false,
  },

  // ── 5. Retro ─────────────────────────────────────────────────────────────────
  // Warm sepia color tint + rectangular border frame + Courier New + all-caps.
  // Vintage pulp fiction / travel poster feel.
  {
    id: 'retro',
    name: 'Retro',
    titleStyle: { fontFamily: 'Courier New', fontSize: 34, color: '#f5e6c8' },
    authorStyle: { fontFamily: 'Courier New', fontSize: 13, color: '#c8aa78' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.76 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.91 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'uppercase',
    colorTint: 'rgba(130,80,20,0.30)',
    overlayStyle: { type: 'vignette', topOpacity: 0.50, bottomOpacity: 0.80 },
    border: { padding: 14, color: 'rgba(245,230,200,0.45)', lineWidth: 1 },
    showDivider: true, dividerStyle: 'dots',
    accentLines: false,
  },

  // ── 6. Thriller ──────────────────────────────────────────────────────────────
  // Heavy vignette, Impact title at the very top, red accent bar below it.
  // Author barely visible at the bottom. Tense, urgent.
  {
    id: 'thriller',
    name: 'Thriller',
    titleStyle: { fontFamily: 'Impact', fontSize: 50, color: '#ffffff' },
    authorStyle: { fontFamily: 'Helvetica', fontSize: 13, color: '#999999' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.13 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.96 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'vignette', topOpacity: 0.62, bottomOpacity: 0.68 },
    accentBar: { color: '#e63946', height: 3 },
    showDivider: false, dividerStyle: 'line',
    accentLines: false,
  },

  // ── 7. Elegant ───────────────────────────────────────────────────────────────
  // Soft lavender tint, italic Palatino centered, ornamental glyph above title,
  // diamond divider. Romance / literary fiction.
  {
    id: 'elegant',
    name: 'Elegant',
    titleStyle: { fontFamily: 'Palatino Linotype', fontSize: 36, color: '#fff8f0' },
    authorStyle: { fontFamily: 'Palatino Linotype', fontSize: 15, color: '#e0d0c0' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.52 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.90 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    colorTint: 'rgba(130,80,160,0.18)',
    overlayStyle: { type: 'tint', opacity: 0.22 },
    ornament: true,
    showDivider: true, dividerStyle: 'diamond',
    accentLines: false,
  },

  // ── 8. Bold ───────────────────────────────────────────────────────────────────
  // Solid opaque cream block covers the bottom 36%. Dark title inside the block,
  // right-aligned. No gradient — graphic and editorial.
  {
    id: 'bold',
    name: 'Bold',
    titleStyle: { fontFamily: 'Impact', fontSize: 50, color: '#111118' },
    authorStyle: { fontFamily: 'Helvetica', fontSize: 13, color: '#44444f' },
    titlePos: { x: CANVAS_W - 28, y: CANVAS_H * 0.77 },
    authorPos: { x: CANVAS_W - 28, y: CANVAS_H * 0.92 },
    titleAlign: 'right', authorAlign: 'right',
    titleTransform: 'none',
    overlayStyle: { type: 'solid-block', position: 'bottom', heightRatio: 0.36, color: '#f0ede5' },
    showDivider: false, dividerStyle: 'line',
    accentLines: false,
    noShadow: true,
  },
]
