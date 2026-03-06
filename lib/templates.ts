import type { Template } from './types'

export const CANVAS_W = 500
export const CANVAS_H = 750

export const TEMPLATES: Template[] = [
  // ── 1. Classic ──────────────────────────────────────────────────────────────
  {
    id: 'classic',
    name: 'Classic',
    titleStyle: { fontFamily: 'Playfair Display', fontSize: 64, color: '#ffffff' },
    authorStyle: { fontFamily: 'Playfair Display', fontSize: 22, color: '#d4d4d8' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.78 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.93 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'vignette', topOpacity: 0.40, bottomOpacity: 0.88 },
    showDivider: true, dividerStyle: 'line',
    accentLines: false,
  },

  // ── 2. Minimal ──────────────────────────────────────────────────────────────
  {
    id: 'minimal',
    name: 'Minimal',
    titleStyle: { fontFamily: 'Montserrat', fontSize: 28, color: '#ffffff' },
    authorStyle: { fontFamily: 'Montserrat', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
    titlePos: { x: 28, y: CANVAS_H * 0.09 },
    authorPos: { x: 28, y: CANVAS_H * 0.16 },
    titleAlign: 'left', authorAlign: 'left',
    titleTransform: 'none',
    overlayStyle: { type: 'tint', opacity: 0.10 },
    textBackdrop: { opacity: 0.50, padding: 16 },
    showDivider: false, dividerStyle: 'line',
    accentLines: false,
  },

  // ── 3. Cinematic ────────────────────────────────────────────────────────────
  {
    id: 'cinematic',
    name: 'Cinematic',
    titleStyle: { fontFamily: 'Bebas Neue', fontSize: 86, color: '#ffffff' },
    authorStyle: { fontFamily: 'Montserrat', fontSize: 14, color: '#aaaaaa' },
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
  {
    id: 'noir',
    name: 'Noir',
    titleStyle: { fontFamily: 'Playfair Display', fontSize: 58, color: '#f0ebe0' },
    authorStyle: { fontFamily: 'Playfair Display', fontSize: 16, color: '#9a9080' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.80 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.925 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'band', bandRatio: 0.38, opacity: 0.93 },
    showDivider: true, dividerStyle: 'diamond',
    accentLines: false,
  },

  // ── 5. Retro ─────────────────────────────────────────────────────────────────
  {
    id: 'retro',
    name: 'Retro',
    titleStyle: { fontFamily: 'EB Garamond', fontSize: 54, color: '#f5e6c8' },
    authorStyle: { fontFamily: 'EB Garamond', fontSize: 16, color: '#c8aa78' },
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
  {
    id: 'thriller',
    name: 'Thriller',
    titleStyle: { fontFamily: 'Oswald', fontSize: 78, color: '#ffffff' },
    authorStyle: { fontFamily: 'Montserrat', fontSize: 14, color: '#999999' },
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
  {
    id: 'elegant',
    name: 'Elegant',
    titleStyle: { fontFamily: 'Playfair Display', fontSize: 54, color: '#fff8f0' },
    authorStyle: { fontFamily: 'Playfair Display', fontSize: 16, color: '#e0d0c0' },
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
  {
    id: 'bold',
    name: 'Bold',
    titleStyle: { fontFamily: 'Bebas Neue', fontSize: 84, color: '#111118' },
    authorStyle: { fontFamily: 'Montserrat', fontSize: 14, color: '#44444f' },
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
