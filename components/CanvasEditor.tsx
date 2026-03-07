'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { TextStyle, Position, Template, OverlayStyle } from '@/lib/types'
import { CANVAS_W, CANVAS_H } from '@/lib/templates'
import { COLOR_GRADES } from '@/lib/grades'

interface Props {
  imageUrl: string | null
  fgImageUrl: string | null
  title: string
  subtitle: string
  author: string
  titleStyle: TextStyle
  subtitleStyle: TextStyle
  authorStyle: TextStyle
  titlePos: Position
  subtitlePos: Position
  authorPos: Position
  imagePos: Position
  imageScale: number
  colorGradeId: string
  template: Template
  onTitlePosChange: (pos: Position) => void
  onSubtitlePosChange: (pos: Position) => void
  onAuthorPosChange: (pos: Position) => void
  onImagePosChange: (pos: Position) => void
  onTitlePlacementSuggested?: (pos: Position) => void
  onElementFocus?: (el: 'title' | 'subtitle' | 'author') => void
  isLoading: boolean
  exportRef: React.MutableRefObject<(() => string | null) | null>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SANS    = new Set(['Helvetica', 'Arial', 'Impact', 'Trebuchet MS', 'Bebas Neue', 'Oswald', 'Montserrat', 'Raleway'])
const CURSIVE = new Set(['Dancing Script', 'Pacifico'])
const MONO    = new Set(['Courier New'])

function fontStack(family: string): string {
  const fb = MONO.has(family) ? 'monospace'
           : SANS.has(family) ? 'sans-serif'
           : CURSIVE.has(family) ? 'cursive'
           : 'serif'
  return `"${family}", ${fb}`
}

/** Auto-size each word so it fills maxW, stack them, return total block height */
function drawWidthFillTitle(
  ctx: CanvasRenderingContext2D,
  words: string[],
  maxW: number,
  centerX: number,
  blockCenterY: number,
  style: TextStyle,
  noShadow: boolean | undefined,
  shadowBlurOverride?: number,
): number {
  const lhMult = style.lineHeight ?? 1.05

  // Pass 1: compute font size per word
  const sizes = words.map(word => {
    let lo = 8, hi = 340
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2
      ctx.font = buildFont({ ...style, fontSize: mid }, 'bold')
      ctx.measureText(word).width <= maxW ? (lo = mid) : (hi = mid)
    }
    return Math.floor(lo)
  })

  const totalH = sizes.reduce((sum, s) => sum + s * lhMult, 0)
  let y = blockCenterY - totalH / 2

  // Pass 2: draw
  for (let i = 0; i < words.length; i++) {
    const fs = sizes[i]
    ctx.font = buildFont({ ...style, fontSize: fs }, 'bold')
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    if (style.strokeWidth && style.strokeWidth > 0) {
      ctx.save()
      ctx.strokeStyle = style.strokeColor ?? '#000000'
      ctx.lineWidth = style.strokeWidth * 2
      ctx.lineJoin = 'round'
      ctx.shadowColor = 'transparent'
      ctx.strokeText(words[i], centerX, y)
      ctx.restore()
    }

    if (!noShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.97)'
      ctx.shadowBlur = shadowBlurOverride ?? Math.max(18, fs * 0.22)
      ctx.shadowOffsetY = Math.max(3, fs * 0.04)
    }
    ctx.fillStyle = style.color
    ctx.fillText(words[i], centerX, y)
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
    y += fs * lhMult
  }
  return totalH
}

function buildFont(ts: TextStyle, defaultWeight: 'normal' | 'bold' = 'normal'): string {
  const weight = ts.fontWeight ?? defaultWeight
  const fontStyle = ts.italic ? 'italic' : 'normal'
  return `${fontStyle} ${weight} ${ts.fontSize}px ${fontStack(ts.fontFamily)}`
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawLetterSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  anchor: number,
  y: number,
  spacing: number,
  align: 'left' | 'center' | 'right',
) {
  let total = 0
  for (const ch of text) total += ctx.measureText(ch).width + spacing
  total -= spacing
  let x = align === 'center' ? anchor - total / 2
         : align === 'right'  ? anchor - total
         : anchor
  const savedAlign = ctx.textAlign
  ctx.textAlign = 'left'
  for (const ch of text) {
    ctx.fillText(ch, x, y)
    x += ctx.measureText(ch).width + spacing
  }
  ctx.textAlign = savedAlign
}

/** How dark the overlay makes the image overall (0 = none, 1 = black) */
function overlayDarkness(style: OverlayStyle): number {
  if (style.type === 'tint') return style.opacity
  if (style.type === 'vignette') return (style.topOpacity + style.bottomOpacity) / 2
  if (style.type === 'band') return style.opacity * 0.55
  if (style.type === 'solid-block') return 0.85
  return 0
}

function drawOverlay(ctx: CanvasRenderingContext2D, style: OverlayStyle, w: number, h: number) {
  switch (style.type) {
    case 'vignette': {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0,    `rgba(0,0,0,${style.topOpacity})`)
      g.addColorStop(0.22, 'rgba(0,0,0,0)')
      g.addColorStop(0.60, 'rgba(0,0,0,0)')
      g.addColorStop(1,    `rgba(0,0,0,${style.bottomOpacity})`)
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      break
    }
    case 'tint': {
      ctx.fillStyle = `rgba(0,0,0,${style.opacity})`; ctx.fillRect(0, 0, w, h)
      break
    }
    case 'band': {
      const bandY = h * (1 - style.bandRatio)
      const feather = ctx.createLinearGradient(0, bandY - 55, 0, bandY + 5)
      feather.addColorStop(0, 'rgba(0,0,0,0)')
      feather.addColorStop(1, `rgba(0,0,0,${style.opacity})`)
      ctx.fillStyle = feather; ctx.fillRect(0, bandY - 55, w, 60)
      ctx.fillStyle = `rgba(0,0,0,${style.opacity})`; ctx.fillRect(0, bandY + 5, w, h)
      break
    }
    case 'solid-block': {
      ctx.fillStyle = style.color
      if (style.position === 'bottom') {
        ctx.fillRect(0, h * (1 - style.heightRatio), w, h * style.heightRatio)
      } else {
        ctx.fillRect(0, 0, w, h * style.heightRatio)
      }
      break
    }
    case 'none': break
  }
}

// Analyze image to suggest a good region for title placement (darker = more readable)
function analyzeForTitlePlacement(img: HTMLImageElement): 'top' | 'center' | 'bottom' {
  try {
    const offscreen = document.createElement('canvas')
    offscreen.width = 100
    offscreen.height = 150
    const ctx = offscreen.getContext('2d')
    if (!ctx) return 'top'
    ctx.drawImage(img, 0, 0, 100, 150)
    const topData = ctx.getImageData(0, 0, 100, 50).data
    const bottomData = ctx.getImageData(0, 100, 100, 50).data
    let topB = 0, bottomB = 0
    for (let i = 0; i < topData.length; i += 4) {
      topB += topData[i] * 0.299 + topData[i + 1] * 0.587 + topData[i + 2] * 0.114
    }
    for (let i = 0; i < bottomData.length; i += 4) {
      bottomB += bottomData[i] * 0.299 + bottomData[i + 1] * 0.587 + bottomData[i + 2] * 0.114
    }
    topB /= 100 * 50
    bottomB /= 100 * 50
    if (topB < bottomB - 15) return 'top'
    if (bottomB < topB - 15) return 'bottom'
    return 'center'
  } catch {
    return 'top'
  }
}

function drawCover(
  canvas: HTMLCanvasElement,
  bgImage: HTMLImageElement | null,
  fgImage: HTMLImageElement | null,
  colorGradeId: string,
  title: string,
  subtitle: string,
  author: string,
  titleStyle: TextStyle,
  subtitleStyle: TextStyle,
  authorStyle: TextStyle,
  titlePos: Position,
  subtitlePos: Position,
  authorPos: Position,
  imagePos: Position,
  imageScale: number,
  template: Template,
  dragTarget: 'title' | 'subtitle' | 'author' | null,
): number /* effectiveSubtitleY */ {
  const ctx = canvas.getContext('2d')
  if (!ctx) return subtitlePos.y
  const W = CANVAS_W, H = CANVAS_H

  // ── Background ─────────────────────────────────────────────────────────────
  ctx.fillStyle = '#111118'
  ctx.fillRect(0, 0, W, H)

  const grade = COLOR_GRADES.find(g => g.id === colorGradeId) ?? COLOR_GRADES[0]

  if (bgImage) {
    const baseScale = Math.max(W / bgImage.naturalWidth, H / bgImage.naturalHeight)
    const s = baseScale * imageScale
    const w = bgImage.naturalWidth * s, h = bgImage.naturalHeight * s
    ctx.save()
    if (grade.filter !== 'none') ctx.filter = grade.filter
    ctx.drawImage(bgImage, (W - w) / 2 + imagePos.x, (H - h) / 2 + imagePos.y, w, h)
    ctx.restore()
  }

  // ── Color grade tint overlay ────────────────────────────────────────────────
  if (grade.tint) {
    ctx.save()
    ctx.globalCompositeOperation = grade.tint.mode
    ctx.globalAlpha = grade.tint.opacity
    ctx.fillStyle = grade.tint.color
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }

  // ── Color tint ─────────────────────────────────────────────────────────────
  if (template.colorTint) {
    ctx.fillStyle = template.colorTint
    ctx.fillRect(0, 0, W, H)
  }

  // ── Overlay ────────────────────────────────────────────────────────────────
  drawOverlay(ctx, template.overlayStyle, W, H)

  // ── Border frame ───────────────────────────────────────────────────────────
  if (template.border) {
    const { padding: p, color, lineWidth } = template.border
    ctx.save()
    ctx.shadowBlur = 0
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.strokeRect(p, p, W - p * 2, H - p * 2)
    ctx.restore()
  }

  // How dark the overlay is determines how hard the text shadow needs to work
  const darkness = overlayDarkness(template.overlayStyle)
  const shadowBlur   = darkness < 0.25 ? 40 : darkness < 0.5 ? 28 : 18
  const shadowAlpha  = darkness < 0.25 ? 0.98 : 0.95
  const shadowOffset = darkness < 0.25 ? 4 : 3

  const displayTitle = template.titleTransform === 'uppercase'
    ? (title || 'YOUR BOOK TITLE').toUpperCase()
    : (title || 'Your Book Title')

  const PAD = 40
  const maxW = W - PAD * 2

  // Auto-fit: shrink font size if title wraps to more than 3 lines
  let effectiveTitleStyle = titleStyle
  if (!titleStyle.widthFill) {
    ctx.font = buildFont(titleStyle, 'bold')
    let testLines = wrapText(ctx, displayTitle, maxW)
    if (testLines.length > 3) {
      let autoSize = titleStyle.fontSize
      while (testLines.length > 3 && autoSize > 28) {
        autoSize -= 2
        ctx.font = buildFont({ ...titleStyle, fontSize: autoSize }, 'bold')
        testLines = wrapText(ctx, displayTitle, maxW)
      }
      effectiveTitleStyle = { ...titleStyle, fontSize: autoSize }
    }
  }

  // Pre-compute title layout using effective style
  ctx.font = buildFont(effectiveTitleStyle, 'bold')
  const titleLines = wrapText(ctx, displayTitle, maxW)
  const titleLineH = effectiveTitleStyle.fontSize * (effectiveTitleStyle.lineHeight ?? 1.2)
  const titleBlockH = titleLines.length * titleLineH
  const titleTop = titlePos.y - titleBlockH / 2

  // ── Text backdrop ──────────────────────────────────────────────────────────
  if (template.textBackdrop) {
    const pad = template.textBackdrop.padding
    // Compute the effective subtitle Y now so backdrop can cover it
    const subFloorForBackdrop = titleTop + titleBlockH + subtitleStyle.fontSize * 0.6 + 6
    const effSubForBackdrop = Math.max(subtitlePos.y, subFloorForBackdrop)
    const textRegionBottom = Math.max(
      titleTop + titleBlockH,
      subtitle ? effSubForBackdrop + subtitleStyle.fontSize * 0.65 : 0,
      authorPos.y + authorStyle.fontSize * 0.7,
    )
    ctx.save()
    ctx.fillStyle = `rgba(0,0,0,${template.textBackdrop.opacity})`
    ctx.fillRect(0, titleTop - pad, W, textRegionBottom - titleTop + pad * 2)
    ctx.restore()
  }

  // ── Ornament above title ────────────────────────────────────────────────────
  if (template.ornament) {
    ctx.save()
    ctx.shadowBlur = 0
    ctx.font = `14px Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText('◆', W / 2, titleTop - 20)
    ctx.restore()
  }

  // ── Accent lines flanking title ─────────────────────────────────────────────
  if (template.accentLines && titleLines.length > 0) {
    ctx.save()
    ctx.shadowBlur = 0
    ctx.font = buildFont(effectiveTitleStyle, 'bold')
    const firstW = ctx.measureText(titleLines[0]).width
    const gap = 14
    ctx.strokeStyle = template.accentLineColor ?? 'rgba(255,255,255,0.32)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PAD, titlePos.y); ctx.lineTo(W / 2 - firstW / 2 - gap, titlePos.y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(W / 2 + firstW / 2 + gap, titlePos.y); ctx.lineTo(W - PAD, titlePos.y); ctx.stroke()
    ctx.restore()
  }

  // ── Title text ──────────────────────────────────────────────────────────────
  ctx.save()
  // Apply rotation around title center
  const titleRotRad = ((effectiveTitleStyle.rotation ?? 0) * Math.PI) / 180
  if (titleRotRad !== 0) {
    ctx.translate(titlePos.x, titlePos.y)
    ctx.rotate(titleRotRad)
    ctx.translate(-titlePos.x, -titlePos.y)
  }

  if (effectiveTitleStyle.widthFill) {
    // Width-fill: each word auto-sizes to fill canvas width
    const words = displayTitle.split(' ').filter(Boolean)
    drawWidthFillTitle(ctx, words, maxW, titlePos.x, titlePos.y, effectiveTitleStyle, template.noShadow, shadowBlur)
  } else {
    ctx.textAlign = template.titleAlign
    ctx.textBaseline = 'middle'
    ctx.font = buildFont(effectiveTitleStyle, 'bold')

    if (effectiveTitleStyle.strokeWidth && effectiveTitleStyle.strokeWidth > 0) {
      ctx.strokeStyle = effectiveTitleStyle.strokeColor ?? '#000000'
      ctx.lineWidth = effectiveTitleStyle.strokeWidth * 2
      ctx.lineJoin = 'round'
      ctx.shadowColor = 'transparent'
      titleLines.forEach((line, i) => {
        const y = titleTop + i * titleLineH + titleLineH / 2
        if ((effectiveTitleStyle.letterSpacing ?? 0) > 0) {
          drawLetterSpaced(ctx, line, titlePos.x, y, effectiveTitleStyle.letterSpacing!, template.titleAlign)
        } else {
          ctx.strokeText(line, titlePos.x, y)
        }
      })
    }

    if (!template.noShadow) {
      ctx.shadowColor = `rgba(0,0,0,${shadowAlpha})`
      ctx.shadowBlur = shadowBlur; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = shadowOffset
    }
    ctx.fillStyle = effectiveTitleStyle.color
    titleLines.forEach((line, i) => {
      const y = titleTop + i * titleLineH + titleLineH / 2
      if ((effectiveTitleStyle.letterSpacing ?? 0) > 0) {
        drawLetterSpaced(ctx, line, titlePos.x, y, effectiveTitleStyle.letterSpacing!, template.titleAlign)
      } else {
        ctx.fillText(line, titlePos.x, y)
      }
    })
  }
  ctx.restore()

  // ── Subtitle (independent draggable element) ─────────────────────────────────
  // Clamp: must stay below actual title bottom AND above the author line
  const titleActualBottom = titleTop + titleBlockH
  const subFloor   = titleActualBottom + subtitleStyle.fontSize * 0.6 + 6
  const subCeiling = authorPos.y - subtitleStyle.fontSize - 8
  const effectiveSubtitleY = Math.min(Math.max(subtitlePos.y, subFloor), subCeiling)

  if (subtitle) {
    ctx.save()
    const subRotRad = ((subtitleStyle.rotation ?? 0) * Math.PI) / 180
    if (subRotRad !== 0) {
      ctx.translate(subtitlePos.x, effectiveSubtitleY)
      ctx.rotate(subRotRad)
      ctx.translate(-subtitlePos.x, -effectiveSubtitleY)
    }
    ctx.textAlign = template.titleAlign
    ctx.textBaseline = 'middle'
    ctx.font = buildFont(subtitleStyle)
    ctx.fillStyle = subtitleStyle.color
    if (!template.noShadow) {
      ctx.shadowColor = `rgba(0,0,0,${shadowAlpha})`
      ctx.shadowBlur = shadowBlur * 0.7
      ctx.shadowOffsetY = shadowOffset
    }
    const subSpacing = subtitleStyle.letterSpacing ?? 0
    if (subSpacing > 0) {
      drawLetterSpaced(ctx, subtitle, subtitlePos.x, effectiveSubtitleY, subSpacing, template.titleAlign)
    } else {
      ctx.fillText(subtitle, subtitlePos.x, effectiveSubtitleY)
    }
    ctx.restore()
  }

  // ── Accent bar below title ────────────────────────────────────────────────────
  if (template.accentBar) {
    const barY = titlePos.y + titleBlockH / 2 + 10
    ctx.save()
    ctx.shadowBlur = 0
    ctx.fillStyle = template.accentBar.color
    ctx.fillRect(W / 2 - 52, barY, 104, template.accentBar.height)
    ctx.restore()
  }

  // ── Divider ─────────────────────────────────────────────────────────────────
  if (template.showDivider) {
    const divY = titlePos.y + titleBlockH / 2 + (authorPos.y - (titlePos.y + titleBlockH / 2)) * 0.45
    const divColor = template.noShadow ? 'rgba(60,60,70,0.5)' : 'rgba(255,255,255,0.28)'
    ctx.save()
    ctx.shadowBlur = 0
    if (template.dividerStyle === 'diamond') {
      ctx.font = '10px Georgia, serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = divColor
      ctx.fillText('◆', W / 2, divY)
    } else if (template.dividerStyle === 'dots') {
      ctx.fillStyle = divColor
      const gap = 8, n = 5, startX = W / 2 - (n - 1) * gap / 2
      for (let i = 0; i < n; i++) {
        ctx.beginPath(); ctx.arc(startX + i * gap, divY, 1.5, 0, Math.PI * 2); ctx.fill()
      }
    } else {
      ctx.strokeStyle = divColor; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(W / 2 - 28, divY); ctx.lineTo(W / 2 + 28, divY); ctx.stroke()
    }
    ctx.restore()
  }

  // ── Author text ──────────────────────────────────────────────────────────────
  ctx.save()
  ctx.textAlign = template.authorAlign
  ctx.textBaseline = 'middle'
  ctx.font = buildFont(authorStyle)

  if (authorStyle.strokeWidth && authorStyle.strokeWidth > 0) {
    ctx.strokeStyle = authorStyle.strokeColor ?? '#000000'
    ctx.lineWidth = authorStyle.strokeWidth * 2
    ctx.lineJoin = 'round'
    ctx.shadowColor = 'transparent'
    ctx.strokeText(author || 'Author Name', authorPos.x, authorPos.y)
  }

  if (!template.noShadow) {
    ctx.shadowColor = `rgba(0,0,0,${shadowAlpha})`
    ctx.shadowBlur = shadowBlur * 0.65; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = shadowOffset
  }
  ctx.fillStyle = authorStyle.color
  drawLetterSpaced(ctx, author || 'Author Name', authorPos.x, authorPos.y, authorStyle.letterSpacing ?? 1, template.authorAlign)
  ctx.restore()

  // ── Drag selection indicator ─────────────────────────────────────────────────
  if (dragTarget) {
    ctx.save()
    ctx.strokeStyle = 'rgba(99,102,241,0.7)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 3])
    if (dragTarget === 'title') {
      roundRect(ctx, titlePos.x - maxW / 2, titleTop - 8, maxW, titleBlockH + 16, 3)
    } else if (dragTarget === 'subtitle') {
      ctx.font = buildFont(subtitleStyle)
      const sw = ctx.measureText(subtitle).width + 40
      const sh = subtitleStyle.fontSize + 14
      roundRect(ctx, subtitlePos.x - sw / 2, effectiveSubtitleY - sh / 2, sw, sh, 3)
    } else {
      ctx.font = buildFont(authorStyle)
      const aw = ctx.measureText(author || 'Author Name').width + 40
      const ah = authorStyle.fontSize + 16
      roundRect(ctx, authorPos.x - aw / 2, authorPos.y - ah / 2, aw, ah, 3)
    }
    ctx.stroke()
    ctx.restore()
  }

  // ── Foreground subject — two-pass depth effect ────────────────────────────────
  if (fgImage) {
    const baseScale = Math.max(W / fgImage.naturalWidth, H / fgImage.naturalHeight)
    const s = baseScale * imageScale
    const w = fgImage.naturalWidth * s, h = fgImage.naturalHeight * s
    const dx = (W - w) / 2 + imagePos.x
    const dy = (H - h) / 2 + imagePos.y

    // Pass 1: soft halo — blurred, semi-transparent, creates edge glow
    ctx.save()
    ctx.filter = 'blur(4px)'
    ctx.globalAlpha = 0.40
    ctx.drawImage(fgImage, dx, dy, w, h)
    ctx.restore()

    // Pass 2: sharp subject with drop shadow
    ctx.save()
    ctx.filter = 'drop-shadow(0px 12px 28px rgba(0,0,0,0.85))'
    ctx.drawImage(fgImage, dx, dy, w, h)
    ctx.restore()
  }

  return effectiveSubtitleY
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CanvasEditor({
  imageUrl, fgImageUrl, title, subtitle, author,
  titleStyle, subtitleStyle, authorStyle,
  titlePos, subtitlePos, authorPos,
  imagePos, imageScale, colorGradeId,
  template,
  onTitlePosChange, onSubtitlePosChange, onAuthorPosChange, onImagePosChange,
  onTitlePlacementSuggested,
  onElementFocus,
  isLoading, exportRef,
}: Props) {
  const canvasRef            = useRef<HTMLCanvasElement>(null)
  const bgImageRef           = useRef<HTMLImageElement | null>(null)
  const fgImageRef           = useRef<HTMLImageElement | null>(null)
  // Tracks the actual rendered subtitle Y (clamped below title wrapping)
  const effectiveSubtitleYRef = useRef<number>(subtitlePos.y)
  const dragRef     = useRef<{
    obj: 'title' | 'subtitle' | 'author' | 'image'
    startX: number; startY: number
    objStartX: number; objStartY: number
  } | null>(null)

  // Mirror all props into refs so drag handlers always see current values
  const titleRef          = useRef(title)
  const subtitleRef       = useRef(subtitle)
  const authorRef         = useRef(author)
  const titleStyleRef     = useRef(titleStyle)
  const subtitleStyleRef  = useRef(subtitleStyle)
  const authorStyleRef    = useRef(authorStyle)
  const titlePosRef       = useRef(titlePos)
  const subtitlePosRef    = useRef(subtitlePos)
  const authorPosRef      = useRef(authorPos)
  const imagePosRef       = useRef(imagePos)
  const imageScaleRef     = useRef(imageScale)
  const colorGradeIdRef   = useRef(colorGradeId)
  const templateRef       = useRef(template)
  const dragTargetRef     = useRef<'title' | 'subtitle' | 'author' | null>(null)
  const onTitlePlacementRef = useRef(onTitlePlacementSuggested)
  const onElementFocusRef   = useRef(onElementFocus)

  titleRef.current          = title
  subtitleRef.current       = subtitle
  authorRef.current         = author
  titleStyleRef.current     = titleStyle
  subtitleStyleRef.current  = subtitleStyle
  authorStyleRef.current    = authorStyle
  titlePosRef.current       = titlePos
  subtitlePosRef.current    = subtitlePos
  authorPosRef.current      = authorPos
  imagePosRef.current       = imagePos
  imageScaleRef.current     = imageScale
  colorGradeIdRef.current   = colorGradeId
  templateRef.current       = template
  onTitlePlacementRef.current = onTitlePlacementSuggested
  onElementFocusRef.current   = onElementFocus

  const redraw = useCallback(() => {
    if (!canvasRef.current) return
    effectiveSubtitleYRef.current = drawCover(
      canvasRef.current,
      bgImageRef.current,
      fgImageRef.current,
      colorGradeIdRef.current,
      titleRef.current,
      subtitleRef.current,
      authorRef.current,
      titleStyleRef.current,
      subtitleStyleRef.current,
      authorStyleRef.current,
      titlePosRef.current,
      subtitlePosRef.current,
      authorPosRef.current,
      imagePosRef.current,
      imageScaleRef.current,
      templateRef.current,
      dragTargetRef.current,
    )
  }, [])

  useEffect(() => {
    exportRef.current = () => canvasRef.current?.toDataURL('image/png') ?? null
  }, [exportRef, redraw])

  useEffect(() => {
    redraw()
  }, [title, subtitle, author, titleStyle, subtitleStyle, authorStyle, titlePos, subtitlePos, authorPos, imagePos, imageScale, colorGradeId, template, redraw])

  // Redraw once web fonts finish loading
  useEffect(() => {
    document.fonts.ready.then(() => redraw())
  }, [redraw])

  useEffect(() => {
    if (!imageUrl) { bgImageRef.current = null; redraw(); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      bgImageRef.current = img
      // Suggest title placement based on brightness analysis
      if (onTitlePlacementRef.current) {
        const region = analyzeForTitlePlacement(img)
        const suggestedY = region === 'top' ? CANVAS_H * 0.15
                         : region === 'bottom' ? CANVAS_H * 0.80
                         : CANVAS_H * 0.50
        onTitlePlacementRef.current({ x: titlePosRef.current.x, y: suggestedY })
      }
      redraw()
    }
    img.onerror = () => {
      const img2 = new Image()
      img2.onload = () => { bgImageRef.current = img2; redraw() }
      img2.src = imageUrl
    }
    img.src = imageUrl
  }, [imageUrl, redraw])

  useEffect(() => {
    if (!fgImageUrl) { fgImageRef.current = null; redraw(); return }
    const img = new Image()
    img.onload = () => { fgImageRef.current = img; redraw() }
    img.src = fgImageUrl
  }, [fgImageUrl, redraw])

  // ─── Drag ──────────────────────────────────────────────────────────────────

  function getCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function hitTitle(x: number, y: number) {
    const tp = titlePosRef.current
    const fs = titleStyleRef.current.fontSize
    return Math.abs(x - tp.x) < (CANVAS_W - 40) / 2 && Math.abs(y - tp.y) < fs * 1.8
  }

  function hitSubtitle(x: number, y: number) {
    if (!subtitleRef.current) return false
    const sp = subtitlePosRef.current
    const fs = subtitleStyleRef.current.fontSize
    // Use effectiveSubtitleY so hit area matches what's rendered
    return Math.abs(x - sp.x) < 200 && Math.abs(y - effectiveSubtitleYRef.current) < fs * 2.0
  }

  function hitAuthor(x: number, y: number) {
    const ap = authorPosRef.current
    const fs = authorStyleRef.current.fontSize
    return Math.abs(x - ap.x) < 200 && Math.abs(y - ap.y) < fs * 2.5
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoords(e)
    if (hitTitle(x, y)) {
      dragRef.current = { obj: 'title', startX: x, startY: y, objStartX: titlePosRef.current.x, objStartY: titlePosRef.current.y }
      dragTargetRef.current = 'title'
      onElementFocusRef.current?.('title')
    } else if (hitSubtitle(x, y)) {
      dragRef.current = { obj: 'subtitle', startX: x, startY: y, objStartX: subtitlePosRef.current.x, objStartY: subtitlePosRef.current.y }
      dragTargetRef.current = 'subtitle'
      onElementFocusRef.current?.('subtitle')
    } else if (hitAuthor(x, y)) {
      dragRef.current = { obj: 'author', startX: x, startY: y, objStartX: authorPosRef.current.x, objStartY: authorPosRef.current.y }
      dragTargetRef.current = 'author'
      onElementFocusRef.current?.('author')
    } else if (bgImageRef.current) {
      dragRef.current = { obj: 'image', startX: x, startY: y, objStartX: imagePosRef.current.x, objStartY: imagePosRef.current.y }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoords(e)

    if (!dragRef.current) {
      canvasRef.current!.style.cursor =
        hitTitle(x, y) || hitSubtitle(x, y) || hitAuthor(x, y) ? 'grab'
        : bgImageRef.current ? 'move'
        : 'default'
      return
    }

    canvasRef.current!.style.cursor = 'grabbing'
    const dx = x - dragRef.current.startX
    const dy = y - dragRef.current.startY
    const newPos = {
      x: dragRef.current.objStartX + dx,
      y: dragRef.current.objStartY + dy,
    }
    if (dragRef.current.obj === 'title') {
      titlePosRef.current = newPos
    } else if (dragRef.current.obj === 'subtitle') {
      subtitlePosRef.current = newPos
    } else if (dragRef.current.obj === 'author') {
      authorPosRef.current = newPos
    } else {
      imagePosRef.current = newPos
    }
    redraw()
  }

  const handleMouseUp = () => {
    if (!dragRef.current) return
    if (dragRef.current.obj === 'title') onTitlePosChange(titlePosRef.current)
    else if (dragRef.current.obj === 'subtitle') onSubtitlePosChange(subtitlePosRef.current)
    else if (dragRef.current.obj === 'author') onAuthorPosChange(authorPosRef.current)
    else onImagePosChange(imagePosRef.current)
    dragRef.current = null
    dragTargetRef.current = null
    redraw()
  }

  const handleMouseLeave = () => {
    if (dragRef.current) handleMouseUp()
    if (canvasRef.current) canvasRef.current.style.cursor = 'default'
  }

  return (
    <div className="relative shadow-2xl" style={{ width: CANVAS_W, height: CANVAS_H }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* Loading overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 gap-3 transition-opacity duration-200"
        style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'auto' : 'none' }}
      >
        <svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-sm text-zinc-300">Crafting your cover…</span>
      </div>

      {/* Empty state hint */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-200"
        style={{ opacity: !imageUrl && !isLoading ? 1 : 0 }}
      >
        <p className="text-xs text-zinc-500 text-center px-10 leading-relaxed">
          Fill in your book details and click{' '}
          <span className="text-zinc-400">Generate Cover</span>
          <br />or upload your own image
        </p>
      </div>
    </div>
  )
}
