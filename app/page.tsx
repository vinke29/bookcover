'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import DescriptionPanel from '@/components/DescriptionPanel'
import ControlPanel from '@/components/ControlPanel'
import type { BookInfo, CoverConcept, TextStyle, Position, Template, OverlayStyle } from '@/lib/types'
import { TEMPLATES, CANVAS_W, CANVAS_H, customLayoutToTemplate } from '@/lib/templates'

const SPINE_W = 48

const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false })

const DEFAULT_TEMPLATE = TEMPLATES[0]

// Compute a subtitle default Y position that sits between title bottom and author,
// clear of any accentBar, without overlapping either.
function defaultSubtitleY(t: Template): number {
  const subFs = Math.max(16, Math.round(t.titleStyle.fontSize * 0.38))
  // Approximate title bottom (single-line estimate)
  const titleBottom = t.titlePos.y + t.titleStyle.fontSize * 0.65
  // Nudge down past accentBar if the template has one
  const afterBar = t.accentBar ? titleBottom + t.accentBar.height + 20 : titleBottom
  const option1 = afterBar + subFs * 0.7 + 6
  // Keep clear of author
  const authorTop = t.authorPos.y - t.authorStyle.fontSize * 1.2
  const option2 = authorTop - subFs * 0.5 - 4
  return Math.min(option1, option2)
}

export default function Home() {
  const [bookInfo, setBookInfo] = useState<BookInfo>({
    title: '', subtitle: '', author: '', genre: '', blurb: '', mood: '',
  })
  const [concept, setConcept] = useState<CoverConcept | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Typography — initialised from the default template
  const [titleStyle, setTitleStyle] = useState<TextStyle>(DEFAULT_TEMPLATE.titleStyle)
  const [subtitleStyle, setSubtitleStyle] = useState<TextStyle>({
    fontFamily: DEFAULT_TEMPLATE.titleStyle.fontFamily,
    fontSize: Math.max(16, Math.round(DEFAULT_TEMPLATE.titleStyle.fontSize * 0.38)),
    color: DEFAULT_TEMPLATE.titleStyle.color,
    italic: true,
  })
  const [authorStyle, setAuthorStyle] = useState<TextStyle>(DEFAULT_TEMPLATE.authorStyle)

  // Text positions — draggable on canvas
  const [titlePos, setTitlePos] = useState<Position>(DEFAULT_TEMPLATE.titlePos)
  const [subtitlePos, setSubtitlePos] = useState<Position>({
    x: DEFAULT_TEMPLATE.titlePos.x,
    y: defaultSubtitleY(DEFAULT_TEMPLATE),
  })
  const [authorPos, setAuthorPos] = useState<Position>(DEFAULT_TEMPLATE.authorPos)

  // Active template (controls overlay + decoration)
  const [activeTemplate, setActiveTemplate] = useState<Template>(DEFAULT_TEMPLATE)

  // Image pan/zoom
  const [imagePos, setImagePos] = useState<Position>({ x: 0, y: 0 })
  const [imageScale, setImageScale] = useState(1)

  // Color grade
  const [colorGradeId, setColorGradeId] = useState('none')

  // Depth effect (text-behind-subject)
  const [cdnUrl, setCdnUrl] = useState<string | null>(null)
  const [fgImageUrl, setFgImageUrl] = useState<string | null>(null)
  const [isRemovingBg, setIsRemovingBg] = useState(false)

  // 3D mockup preview
  const [showMockup, setShowMockup] = useState(false)
  const [mockupDataUrl, setMockupDataUrl] = useState<string | null>(null)

  // Which text element is focused in the right panel
  const [focusedElement, setFocusedElement] = useState<'title' | 'subtitle' | 'author'>('title')

  const exportFnRef = useRef<((scale?: number) => string | null) | null>(null)

  // Auto-refresh the mockup snapshot whenever the active template changes in 3D preview mode
  useEffect(() => {
    if (!showMockup) return
    const id = setTimeout(() => {
      setMockupDataUrl(exportFnRef.current?.() ?? null)
    }, 80)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplate, showMockup])

  // The image shown on canvas: prefer uploaded over generated
  const imageUrl = uploadedImageUrl ?? generatedImageUrl

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleApplyTemplate = (t: Template) => {
    setActiveTemplate(t)
    setTitleStyle(t.titleStyle)
    setSubtitleStyle({
      fontFamily: t.titleStyle.fontFamily,
      fontSize: Math.min(22, Math.max(14, Math.round(t.titleStyle.fontSize * 0.26))),
      color: t.titleStyle.color,
      italic: true,
    })
    setAuthorStyle(t.authorStyle)
    setTitlePos(t.titlePos)
    setSubtitlePos({
      x: t.titlePos.x,
      y: defaultSubtitleY(t),
    })
    setAuthorPos(t.authorPos)
  }

  const handleTitlePlacementSuggested = (pos: Position) => {
    // Don't override the AI layout's own intentional positioning
    if (activeTemplate.id === 'ai') return
    setTitlePos(pos)
    setSubtitlePos(p => ({
      x: p.x,
      y: pos.y + activeTemplate.titleStyle.fontSize * 0.65 + Math.min(22, Math.max(14, Math.round(titleStyle.fontSize * 0.26))) * 0.7 + 6,
    }))
  }

  const handleOverlayChange = (darkness: number) => {
    setActiveTemplate(t => {
      const ov: OverlayStyle = t.overlayStyle
      if (ov.type === 'tint') {
        return { ...t, overlayStyle: { type: 'tint', opacity: darkness } }
      }
      if (ov.type === 'vignette') {
        const current = (ov.topOpacity + ov.bottomOpacity) / 2
        if (current === 0) {
          return { ...t, overlayStyle: { type: 'vignette', topOpacity: darkness * 0.85, bottomOpacity: darkness } }
        }
        const scale = darkness / current
        return { ...t, overlayStyle: {
          type: 'vignette',
          topOpacity: Math.min(1, ov.topOpacity * scale),
          bottomOpacity: Math.min(1, ov.bottomOpacity * scale),
        }}
      }
      if (ov.type === 'band') {
        return { ...t, overlayStyle: { ...ov, opacity: Math.min(1, darkness / 0.55) } }
      }
      return t
    })
  }

  const handleImageUpload = (url: string) => {
    setUploadedImageUrl(url)
    setImagePos({ x: 0, y: 0 })
    setImageScale(1)
    setCdnUrl(null)
    setFgImageUrl(null)
  }

  const handleEnableDepth = async () => {
    if (!cdnUrl) return
    setIsRemovingBg(true)
    try {
      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdnUrl }),
      })
      if (!res.ok) throw new Error('Background removal failed')
      const data = await res.json()
      setFgImageUrl(data.fgImageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Depth effect failed')
    } finally {
      setIsRemovingBg(false)
    }
  }

  const handleGenerate = async () => {
    if (!bookInfo.title || !bookInfo.genre) {
      setError('Please fill in at least a title and genre.')
      return
    }
    setError(null)
    setIsGenerating(true)
    setUploadedImageUrl(null)
    setImagePos({ x: 0, y: 0 })
    setImageScale(1)
    setCdnUrl(null)
    setFgImageUrl(null)

    try {
      // Step 1: concept via OpenAI
      const conceptRes = await fetch('/api/generate-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookInfo),
      })
      if (!conceptRes.ok) throw new Error('Failed to generate cover concept')
      const conceptData: CoverConcept = await conceptRes.json()
      setConcept(conceptData)

      if (conceptData.customLayout) {
        // Auto-apply the AI-designed layout
        const layout = conceptData.customLayout

        // Disable widthFill for titles with 4+ words — each word fills the canvas
        // width, so long titles create a stack too tall to fit.
        const wordCount = (bookInfo.title || '').trim().split(/\s+/).filter(Boolean).length
        if (wordCount >= 4) {
          layout.titleWidthFill = false
        }

        // Cap overlay opacity so the AI can never produce a completely black cover.
        // Max tint: 0.65, max vignette channel: 0.88 (vigettes are naturally lighter at center).
        const MAX_TINT = 0.65
        const MAX_VIGNETTE = 0.88
        if (layout.overlay.type === 'tint' && layout.overlay.opacity > MAX_TINT) {
          layout.overlay = { ...layout.overlay, opacity: MAX_TINT }
        } else if (layout.overlay.type === 'vignette') {
          layout.overlay = {
            ...layout.overlay,
            topOpacity:    Math.min(layout.overlay.topOpacity,    MAX_VIGNETTE),
            bottomOpacity: Math.min(layout.overlay.bottomOpacity, MAX_VIGNETTE),
          }
        }

        const aiTemplate = customLayoutToTemplate(layout)

        // Always use white for any overlay type that doesn't provide a solid background.
        // Colored text against a photographic/illustrated image almost always fails —
        // the AI will pick palette-matching colors that blend right into the art.
        // Only solid-block has a known solid color background where the AI color is safe.
        const isSolidBlock = layout.overlay.type === 'solid-block'
        const safeTitleColor = isSolidBlock ? layout.titleColor : '#ffffff'
        const safeAuthorColor = isSolidBlock ? layout.authorColor : 'rgba(255,255,255,0.78)'

        setActiveTemplate(aiTemplate)
        setTitleStyle({ ...aiTemplate.titleStyle, color: safeTitleColor })
        setSubtitleStyle({
          fontFamily: aiTemplate.titleStyle.fontFamily,
          fontSize: Math.min(22, Math.max(14, Math.round(aiTemplate.titleStyle.fontSize * 0.26))),
          color: safeTitleColor,
          italic: true,
        })
        setAuthorStyle({ ...aiTemplate.authorStyle, color: safeAuthorColor })
        setTitlePos(aiTemplate.titlePos)
        setSubtitlePos({ x: aiTemplate.titlePos.x, y: defaultSubtitleY(aiTemplate) })
        setAuthorPos(aiTemplate.authorPos)
      } else {
        // Fallback: apply font/color suggestions on top of current template
        setTitleStyle(s => ({
          ...s,
          fontFamily: conceptData.titleFont || s.fontFamily,
          color: conceptData.titleColor || s.color,
        }))
        setAuthorStyle(s => ({
          ...s,
          color: conceptData.authorColor || s.color,
        }))
      }

      // Step 2: image via fal.ai
      const imageRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: conceptData.imagePrompt }),
      })
      if (!imageRes.ok) throw new Error('Failed to generate cover image')
      const imageData = await imageRes.json()
      setGeneratedImageUrl(imageData.imageUrl)
      if (imageData.cdnUrl) setCdnUrl(imageData.cdnUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  const navigateMockupTemplate = (dir: 1 | -1) => {
    const currentIdx = TEMPLATES.findIndex(t => t.id === activeTemplate.id)
    const from = currentIdx === -1 ? 0 : currentIdx
    const nextIdx = (from + dir + TEMPLATES.length) % TEMPLATES.length
    handleApplyTemplate(TEMPLATES[nextIdx])
  }

  const handleExport = (scale = 1) => {
    const dataUrl = exportFnRef.current?.(scale)
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${bookInfo.title.replace(/\s+/g, '-').toLowerCase() || 'book-cover'}.png`
    a.click()
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-zinc-800 shrink-0">
        <span className="text-lg font-semibold text-zinc-100">CoverCraft</span>
        <span className="text-sm text-zinc-500">AI Book Cover Designer</span>
        <div className="ml-auto">
          <button
            onClick={() => {
              if (!showMockup) {
                const dataUrl = exportFnRef.current?.() ?? null
                setMockupDataUrl(dataUrl)
              }
              setShowMockup(v => !v)
            }}
            disabled={!imageUrl}
            className="px-3 py-1.5 text-xs rounded-md border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={showMockup
              ? { background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.5)', color: '#a5b4fc' }
              : { background: 'transparent', borderColor: '#3f3f46', color: '#a1a1aa' }
            }
          >
            {showMockup ? 'Edit mode' : '3D Preview'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <DescriptionPanel
          bookInfo={bookInfo}
          onChange={setBookInfo}
          onGenerate={handleGenerate}
          onImageUpload={handleImageUpload}
          isGenerating={isGenerating}
          error={error}
        />

        <main className="flex-1 flex items-center justify-center bg-zinc-900 overflow-auto relative">
          {/* ── Edit canvas — always mounted so positions never reset on toggle ── */}
          <div style={{ display: showMockup ? 'none' : 'flex' }}>
            <CanvasEditor
              imageUrl={imageUrl}
              fgImageUrl={fgImageUrl}
              title={bookInfo.title}
              subtitle={bookInfo.subtitle}
              author={bookInfo.author}
              titleStyle={titleStyle}
              subtitleStyle={subtitleStyle}
              authorStyle={authorStyle}
              titlePos={titlePos}
              subtitlePos={subtitlePos}
              authorPos={authorPos}
              imagePos={imagePos}
              imageScale={imageScale}
              colorGradeId={colorGradeId}
              template={activeTemplate}
              onTitlePosChange={setTitlePos}
              onSubtitlePosChange={setSubtitlePos}
              onAuthorPosChange={setAuthorPos}
              onImagePosChange={setImagePos}
              onTitlePlacementSuggested={handleTitlePlacementSuggested}
              onElementFocus={setFocusedElement}
              isLoading={isGenerating}
              exportRef={exportFnRef}
            />
          </div>

          {/* ── 3D book mockup — snapshot of the live canvas ── */}
          {showMockup && (
            <div className="flex flex-col items-center gap-6">
              <div style={{ perspective: '1800px' }}>
                <div style={{
                  display: 'flex',
                  transform: 'rotateY(-28deg) rotateX(3deg)',
                  filter: 'drop-shadow(40px 50px 70px rgba(0,0,0,0.85))',
                  transformOrigin: 'center center',
                }}>
                  {/* Spine */}
                  <div style={{
                    width: SPINE_W,
                    height: CANVAS_H,
                    background: 'linear-gradient(to right, #06060e, #111120)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <span style={{
                      writingMode: 'vertical-lr',
                      transform: 'rotate(180deg)',
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      color: 'rgba(255,255,255,0.35)',
                      fontFamily: activeTemplate.titleStyle.fontFamily,
                      whiteSpace: 'nowrap',
                      maxHeight: CANVAS_H - 40,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {bookInfo.title}{bookInfo.author ? ` · ${bookInfo.author}` : ''}
                    </span>
                  </div>
                  {mockupDataUrl && (
                    <img
                      src={mockupDataUrl}
                      width={CANVAS_W}
                      height={CANVAS_H}
                      alt="Book cover preview"
                      style={{ display: 'block' }}
                    />
                  )}
                </div>
              </div>

              {/* Template navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateMockupTemplate(-1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
                >
                  ‹
                </button>
                <span className="text-xs text-zinc-400 w-20 text-center tracking-widest uppercase">
                  {activeTemplate.name}
                </span>
                <button
                  onClick={() => navigateMockupTemplate(1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </main>

        <ControlPanel
          titleStyle={titleStyle}
          subtitleStyle={subtitleStyle}
          authorStyle={authorStyle}
          onTitleStyleChange={setTitleStyle}
          onSubtitleStyleChange={setSubtitleStyle}
          onAuthorStyleChange={setAuthorStyle}
          onExport={handleExport}
          canExport={!!imageUrl}
          concept={concept}
          onRegenerate={handleGenerate}
          isGenerating={isGenerating}
          activeTemplateId={activeTemplate.id}
          onApplyTemplate={handleApplyTemplate}
          imageScale={imageScale}
          onImageScaleChange={setImageScale}
          hasImage={!!imageUrl}
          colorGradeId={colorGradeId}
          onColorGradeChange={setColorGradeId}
          onEnableDepth={handleEnableDepth}
          isRemovingBg={isRemovingBg}
          hasDepth={!!fgImageUrl}
          focusedElement={focusedElement}
          onElementFocus={setFocusedElement}
          overlayStyle={activeTemplate.overlayStyle}
          onOverlayChange={handleOverlayChange}
        />
      </div>
    </div>
  )
}
