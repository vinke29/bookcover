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
  authorStyle: TextStyle
  titlePos: Position
  authorPos: Position
  imagePos: Position
  imageScale: number
  colorGradeId: string
  template: Template
  onTitlePosChange: (pos: Position) => void
  onAuthorPosChange: (pos: Position) => void
  onImagePosChange: (pos: Position) => void
  isLoading: boolean
  exportRef: React.MutableRefObject<(() => string | null) | null>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SANS = new Set(['Helvetica', 'Arial', 'Impact', 'Trebuchet MS', 'Bebas Neue', 'Oswald', 'Montserrat'])
const MONO = new Set(['Courier New'])

function fontStack(family: string): string {
  const fb = MONO.has(family) ? 'monospace' : SANS.has(family) ? 'sans-serif' : 'serif'
  return `"${family}", ${fb}`
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
  ctx.textAlign = 'left' // position each glyph manually; override ctx alignment
  for (const ch of text) {
    ctx.fillText(ch, x, y)
    x += ctx.measureText(ch).width + spacing
  }
  ctx.textAlign = savedAlign
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

function drawCover(
  canvas: HTMLCanvasElement,
  bgImage: HTMLImageElement | null,
  fgImage: HTMLImageElement | null,
  colorGradeId: string,
  title: string,
  subtitle: string,
  author: string,
  titleStyle: TextStyle,
  authorStyle: TextStyle,
  titlePos: Position,
  authorPos: Position,
  imagePos: Position,
  imageScale: number,
  template: Template,
  dragTarget: 'title' | 'author' | null,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
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

  const displayTitle = template.titleTransform === 'uppercase'
    ? (title || 'YOUR BOOK TITLE').toUpperCase()
    : (title || 'Your Book Title')

  const PAD = 40
  const maxW = W - PAD * 2

  // Pre-compute title layout
  ctx.font = `bold ${titleStyle.fontSize}px ${fontStack(titleStyle.fontFamily)}`
  const titleLines = wrapText(ctx, displayTitle, maxW)
  const titleLineH = titleStyle.fontSize * 1.2
  const titleBlockH = titleLines.length * titleLineH
  const titleTop = titlePos.y - titleBlockH / 2

  // ── Text backdrop ──────────────────────────────────────────────────────────
  if (template.textBackdrop) {
    const pad = template.textBackdrop.padding
    const subtitleH = subtitle ? Math.round(titleStyle.fontSize * 0.32) + pad + 6 : 0
    ctx.save()
    ctx.fillStyle = `rgba(0,0,0,${template.textBackdrop.opacity})`
    ctx.fillRect(0, titleTop - pad, W, titleBlockH + pad * 2 + subtitleH)
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
    ctx.font = `bold ${titleStyle.fontSize}px ${fontStack(titleStyle.fontFamily)}`
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
  ctx.textAlign = template.titleAlign
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${titleStyle.fontSize}px ${fontStack(titleStyle.fontFamily)}`

  // Stroke (outline) — drawn first so fill renders on top
  if (titleStyle.strokeWidth && titleStyle.strokeWidth > 0) {
    ctx.strokeStyle = titleStyle.strokeColor ?? '#000000'
    ctx.lineWidth = titleStyle.strokeWidth * 2
    ctx.lineJoin = 'round'
    ctx.shadowColor = 'transparent'
    titleLines.forEach((line, i) => {
      ctx.strokeText(line, titlePos.x, titleTop + i * titleLineH + titleLineH / 2)
    })
  }

  if (!template.noShadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.95)'
    ctx.shadowBlur = 20; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 3
  }
  ctx.fillStyle = titleStyle.color
  titleLines.forEach((line, i) => {
    ctx.fillText(line, titlePos.x, titleTop + i * titleLineH + titleLineH / 2)
  })
  ctx.restore()

  // ── Subtitle ─────────────────────────────────────────────────────────────────
  const subtitleSize = subtitle ? Math.max(13, Math.round(titleStyle.fontSize * 0.32)) : 0
  const subtitleOffset = subtitle ? subtitleSize + 14 : 0 // space subtitle takes below title block

  if (subtitle) {
    ctx.save()
    ctx.textAlign = template.titleAlign
    ctx.textBaseline = 'middle'
    ctx.font = `italic ${subtitleSize}px ${fontStack(titleStyle.fontFamily)}`
    ctx.fillStyle = titleStyle.color
    ctx.globalAlpha = 0.60
    if (!template.noShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.9)'
      ctx.shadowBlur = 10
    }
    ctx.fillText(subtitle, titlePos.x, titleTop + titleBlockH + subtitleSize + 6)
    ctx.restore()
  }

  // Author is pushed down by the subtitle height so they never overlap
  const effectiveAuthorY = authorPos.y + subtitleOffset

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
    const divY = titlePos.y + titleBlockH / 2 + (effectiveAuthorY - (titlePos.y + titleBlockH / 2)) * 0.45
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
  ctx.font = `${authorStyle.fontSize}px ${fontStack(authorStyle.fontFamily)}`

  if (authorStyle.strokeWidth && authorStyle.strokeWidth > 0) {
    ctx.strokeStyle = authorStyle.strokeColor ?? '#000000'
    ctx.lineWidth = authorStyle.strokeWidth * 2
    ctx.lineJoin = 'round'
    ctx.shadowColor = 'transparent'
    ctx.strokeText(author || 'Author Name', authorPos.x, effectiveAuthorY)
  }

  if (!template.noShadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 2
  }
  ctx.fillStyle = authorStyle.color
  drawLetterSpaced(ctx, author || 'Author Name', authorPos.x, effectiveAuthorY, 1, template.authorAlign)
  ctx.restore()

  // ── Drag selection indicator ─────────────────────────────────────────────────
  if (dragTarget) {
    ctx.save()
    ctx.strokeStyle = 'rgba(99,102,241,0.7)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 3])
    if (dragTarget === 'title') {
      roundRect(ctx, titlePos.x - maxW / 2, titlePos.y - titleBlockH / 2 - 8, maxW, titleBlockH + 16, 3)
    } else {
      ctx.font = `${authorStyle.fontSize}px ${fontStack(authorStyle.fontFamily)}`
      const aw = ctx.measureText(author || 'Author Name').width + 40
      const ah = authorStyle.fontSize + 16
      roundRect(ctx, authorPos.x - aw / 2, effectiveAuthorY - ah / 2, aw, ah, 3)
    }
    ctx.stroke()
    ctx.restore()
  }

  // ── Foreground subject (drawn last — appears in front of text) ───────────────
  if (fgImage) {
    const baseScale = Math.max(W / fgImage.naturalWidth, H / fgImage.naturalHeight)
    const s = baseScale * imageScale
    const w = fgImage.naturalWidth * s, h = fgImage.naturalHeight * s
    ctx.save()
    // Blur feathers the transparent edges from rembg, removing hard cutout halos
    ctx.filter = 'blur(1px)'
    ctx.drawImage(fgImage, (W - w) / 2 + imagePos.x, (H - h) / 2 + imagePos.y, w, h)
    ctx.restore()
  }
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
  titleStyle, authorStyle,
  titlePos, authorPos,
  imagePos, imageScale, colorGradeId,
  template,
  onTitlePosChange, onAuthorPosChange, onImagePosChange,
  isLoading, exportRef,
}: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const bgImageRef  = useRef<HTMLImageElement | null>(null)
  const fgImageRef  = useRef<HTMLImageElement | null>(null)
  const dragRef     = useRef<{
    obj: 'title' | 'author' | 'image'
    startX: number; startY: number
    objStartX: number; objStartY: number
  } | null>(null)

  const titleRef       = useRef(title)
  const subtitleRef    = useRef(subtitle)
  const authorRef      = useRef(author)
  const titleStyleRef  = useRef(titleStyle)
  const authorStyleRef = useRef(authorStyle)
  const titlePosRef    = useRef(titlePos)
  const authorPosRef   = useRef(authorPos)
  const imagePosRef      = useRef(imagePos)
  const imageScaleRef    = useRef(imageScale)
  const colorGradeIdRef  = useRef(colorGradeId)
  const templateRef      = useRef(template)
  const dragTargetRef  = useRef<'title' | 'author' | null>(null)
  titleRef.current       = title
  subtitleRef.current    = subtitle
  authorRef.current      = author
  titleStyleRef.current  = titleStyle
  authorStyleRef.current = authorStyle
  titlePosRef.current    = titlePos
  authorPosRef.current   = authorPos
  imagePosRef.current      = imagePos
  imageScaleRef.current    = imageScale
  colorGradeIdRef.current  = colorGradeId
  templateRef.current      = template

  const redraw = useCallback(() => {
    if (!canvasRef.current) return
    drawCover(
      canvasRef.current,
      bgImageRef.current,
      fgImageRef.current,
      colorGradeIdRef.current,
      titleRef.current,
      subtitleRef.current,
      authorRef.current,
      titleStyleRef.current,
      authorStyleRef.current,
      titlePosRef.current,
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
  }, [title, subtitle, author, titleStyle, authorStyle, titlePos, authorPos, imagePos, imageScale, colorGradeId, template, redraw])

  // Redraw once web fonts finish loading
  useEffect(() => {
    document.fonts.ready.then(() => redraw())
  }, [redraw])

  useEffect(() => {
    if (!imageUrl) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { bgImageRef.current = img; redraw() }
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
    return Math.abs(x - tp.x) < (CANVAS_W - 40) / 2 && Math.abs(y - tp.y) < fs * 1.5
  }

  function hitAuthor(x: number, y: number) {
    const ap = authorPosRef.current
    const fs = authorStyleRef.current.fontSize
    return Math.abs(x - ap.x) < 160 && Math.abs(y - ap.y) < fs * 1.5
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoords(e)
    if (hitTitle(x, y)) {
      dragRef.current = { obj: 'title', startX: x, startY: y, objStartX: titlePosRef.current.x, objStartY: titlePosRef.current.y }
      dragTargetRef.current = 'title'
    } else if (hitAuthor(x, y)) {
      dragRef.current = { obj: 'author', startX: x, startY: y, objStartX: authorPosRef.current.x, objStartY: authorPosRef.current.y }
      dragTargetRef.current = 'author'
    } else if (bgImageRef.current) {
      dragRef.current = { obj: 'image', startX: x, startY: y, objStartX: imagePosRef.current.x, objStartY: imagePosRef.current.y }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoords(e)

    if (!dragRef.current) {
      canvasRef.current!.style.cursor =
        hitTitle(x, y) || hitAuthor(x, y) ? 'grab'
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
