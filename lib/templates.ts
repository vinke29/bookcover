import type { Template, CustomLayout } from './types'

export const CANVAS_W = 500
export const CANVAS_H = 750

/** Convert an AI-generated CustomLayout into a renderable Template */
export function customLayoutToTemplate(layout: CustomLayout): Template {
  const xForAlign = (align: 'left' | 'center' | 'right') =>
    align === 'left' ? 28 : align === 'right' ? CANVAS_W - 28 : CANVAS_W / 2

  return {
    id: 'ai',
    name: 'AI',
    titleStyle: {
      fontFamily: layout.titleFont,
      fontSize: layout.titleSize,
      color: layout.titleColor,
      italic: layout.titleItalic,
      rotation: layout.titleRotation,
      widthFill: layout.titleWidthFill,
    },
    authorStyle: {
      fontFamily: layout.authorFont,
      fontSize: layout.authorSize,
      color: layout.authorColor,
    },
    titlePos: {
      x: xForAlign(layout.titleAlign),
      y: CANVAS_H * layout.titleYPercent / 100,
    },
    authorPos: {
      x: xForAlign(layout.authorAlign),
      y: CANVAS_H * layout.authorYPercent / 100,
    },
    titleAlign: layout.titleAlign,
    authorAlign: layout.authorAlign,
    titleTransform: layout.titleTransform,
    overlayStyle: layout.overlay,
    colorTint: layout.colorTint ?? undefined,
    border: layout.border ?? undefined,
    showDivider: layout.showDivider,
    dividerStyle: layout.dividerStyle,
    accentLines: layout.accentLines,
    accentLineColor: layout.accentLineColor ?? undefined,
    accentBar: layout.accentBar ?? undefined,
    ornament: layout.ornament,
    noShadow: layout.noShadow,
    textBackdrop: layout.textBackdrop ?? undefined,
  }
}

export const TEMPLATES: Template[] = [
  // ── 1. Literary ─────────────────────────────────────────────────────────────
  // Prestige literary fiction. Heavy vignette darkens top for contrast; image
  // glows in the open middle. Italic Playfair at top center.
  {
    id: 'classic',
    name: 'Literary',
    titleStyle: { fontFamily: 'Playfair Display', fontSize: 68, color: '#ffffff', italic: true },
    authorStyle: { fontFamily: 'EB Garamond', fontSize: 17, color: 'rgba(255,255,255,0.65)' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.20 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.93 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'vignette', topOpacity: 0.74, bottomOpacity: 0.48 },
    showDivider: false, dividerStyle: 'line',
    accentLines: false,
  },

  // ── 2. Editorial ─────────────────────────────────────────────────────────────
  // Magazine / art-book cover. Nearly full-bleed image, left-aligned uppercase
  // sans at top, author anchored to bottom corner.
  {
    id: 'minimal',
    name: 'Editorial',
    titleStyle: { fontFamily: 'Montserrat', fontSize: 30, color: '#ffffff', letterSpacing: 3 },
    authorStyle: { fontFamily: 'Montserrat', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 2 },
    titlePos: { x: 28, y: CANVAS_H * 0.09 },
    authorPos: { x: 28, y: CANVAS_H * 0.93 },
    titleAlign: 'left', authorAlign: 'left',
    titleTransform: 'uppercase',
    overlayStyle: { type: 'tint', opacity: 0.12 },
    showDivider: false, dividerStyle: 'line',
    accentLines: false,
  },

  // ── 3. Cinematic ─────────────────────────────────────────────────────────────
  // Film-poster energy. Huge Bebas Neue title planted at the visual center;
  // flanking accent lines echo the film-credit aesthetic.
  {
    id: 'cinematic',
    name: 'Cinematic',
    titleStyle: { fontFamily: 'Bebas Neue', fontSize: 96, color: '#ffffff' },
    authorStyle: { fontFamily: 'Montserrat', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.42 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.95 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'vignette', topOpacity: 0.42, bottomOpacity: 0.68 },
    showDivider: false, dividerStyle: 'line',
    accentLines: true,
    accentLineColor: 'rgba(255,255,255,0.30)',
  },

  // ── 4. Noir ──────────────────────────────────────────────────────────────────
  // Crime / mystery. Dark band consumes the bottom 40%; title sits in shadow,
  // diamond divider adds a classical detective-fiction touch.
  {
    id: 'noir',
    name: 'Noir',
    titleStyle: { fontFamily: 'Playfair Display', fontSize: 58, color: '#f0ebe0' },
    authorStyle: { fontFamily: 'Playfair Display', fontSize: 15, color: '#9a9080' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.80 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.95 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'band', bandRatio: 0.40, opacity: 0.95 },
    showDivider: true, dividerStyle: 'diamond',
    accentLines: false,
  },

  // ── 5. Heritage ──────────────────────────────────────────────────────────────
  // Historical fiction. Warm sepia wash, inset border frame, EB Garamond in
  // spaced capitals — think Hilary Mantel or Patrick O'Brian.
  {
    id: 'retro',
    name: 'Heritage',
    titleStyle: { fontFamily: 'EB Garamond', fontSize: 52, color: '#f5e6c8' },
    authorStyle: { fontFamily: 'EB Garamond', fontSize: 15, color: '#c8aa78' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.74 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.92 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'uppercase',
    colorTint: 'rgba(100,65,10,0.22)',
    overlayStyle: { type: 'vignette', topOpacity: 0.55, bottomOpacity: 0.82 },
    border: { padding: 14, color: 'rgba(245,230,200,0.40)', lineWidth: 1 },
    showDivider: true, dividerStyle: 'dots',
    accentLines: false,
  },

  // ── 6. Thriller ──────────────────────────────────────────────────────────────
  // Psychological thriller / crime. Uppercase Oswald anchored to the top with
  // a razor-thin red accent bar — the image dominates the center.
  {
    id: 'thriller',
    name: 'Thriller',
    titleStyle: { fontFamily: 'Oswald', fontSize: 84, color: '#ffffff' },
    authorStyle: { fontFamily: 'Montserrat', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.22 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.96 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'uppercase',
    overlayStyle: { type: 'vignette', topOpacity: 0.74, bottomOpacity: 0.70 },
    accentBar: { color: '#e63946', height: 3 },
    showDivider: false, dividerStyle: 'line',
    accentLines: false,
  },

  // ── 7. Romance ───────────────────────────────────────────────────────────────
  // Romance / women's fiction. Flowing Dancing Script at center; the image is
  // the hero — barely any tint. Strong shadows keep it legible.
  {
    id: 'elegant',
    name: 'Romance',
    titleStyle: { fontFamily: 'Dancing Script', fontSize: 82, color: '#ffffff' },
    authorStyle: { fontFamily: 'EB Garamond', fontSize: 16, color: 'rgba(255,255,255,0.70)' },
    titlePos: { x: CANVAS_W / 2, y: CANVAS_H * 0.50 },
    authorPos: { x: CANVAS_W / 2, y: CANVAS_H * 0.91 },
    titleAlign: 'center', authorAlign: 'center',
    titleTransform: 'none',
    overlayStyle: { type: 'tint', opacity: 0.08 },
    ornament: true,
    showDivider: true, dividerStyle: 'diamond',
    accentLines: false,
  },

  // ── 8. Bold ───────────────────────────────────────────────────────────────────
  // Cream solid block at bottom-right, dark text — unchanged from original.
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
