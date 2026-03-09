'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import DescriptionPanel from '@/components/DescriptionPanel'
import ControlPanel from '@/components/ControlPanel'
import CoverGallery from '@/components/CoverGallery'
import type { BookInfo, CoverConcept, TextStyle, Position, Template, OverlayStyle, GeneratedVariant } from '@/lib/types'
import { TEMPLATES, CANVAS_W, CANVAS_H, customLayoutToTemplate } from '@/lib/templates'

const SPINE_W = 48
const PAGE_W  = 52

const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false })

const DEFAULT_TEMPLATE = TEMPLATES[0]

type AppPhase = 'form' | 'gallery' | 'editor'

function defaultSubtitleY(t: Template): number {
  const subFs = Math.max(16, Math.round(t.titleStyle.fontSize * 0.38))
  const titleBottom = t.titlePos.y + t.titleStyle.fontSize * 0.65
  const afterBar = t.accentBar ? titleBottom + t.accentBar.height + 20 : titleBottom
  const option1 = afterBar + subFs * 0.7 + 6
  const authorTop = t.authorPos.y - t.authorStyle.fontSize * 1.2
  const option2 = authorTop - subFs * 0.5 - 4
  return Math.min(option1, option2)
}

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>('form')
  const [variants, setVariants] = useState<GeneratedVariant[]>([])

  const [bookInfo, setBookInfo] = useState<BookInfo>({
    title: '', subtitle: '', author: '', genre: '', blurb: '', mood: '',
  })
  const [concept, setConcept] = useState<CoverConcept | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [titleStyle, setTitleStyle] = useState<TextStyle>(DEFAULT_TEMPLATE.titleStyle)
  const [subtitleStyle, setSubtitleStyle] = useState<TextStyle>({
    fontFamily: DEFAULT_TEMPLATE.titleStyle.fontFamily,
    fontSize: Math.max(16, Math.round(DEFAULT_TEMPLATE.titleStyle.fontSize * 0.38)),
    color: DEFAULT_TEMPLATE.titleStyle.color,
    italic: true,
  })
  const [authorStyle, setAuthorStyle] = useState<TextStyle>(DEFAULT_TEMPLATE.authorStyle)

  const [titlePos, setTitlePos] = useState<Position>(DEFAULT_TEMPLATE.titlePos)
  const [subtitlePos, setSubtitlePos] = useState<Position>({
    x: DEFAULT_TEMPLATE.titlePos.x,
    y: defaultSubtitleY(DEFAULT_TEMPLATE),
  })
  const [authorPos, setAuthorPos] = useState<Position>(DEFAULT_TEMPLATE.authorPos)

  const [activeTemplate, setActiveTemplate] = useState<Template>(DEFAULT_TEMPLATE)
  const [imagePos, setImagePos] = useState<Position>({ x: 0, y: 0 })
  const [imageScale, setImageScale] = useState(1)
  const [colorGradeId, setColorGradeId] = useState('none')
  const [cdnUrl, setCdnUrl] = useState<string | null>(null)
  const [fgImageUrl, setFgImageUrl] = useState<string | null>(null)
  const [isRemovingBg, setIsRemovingBg] = useState(false)
  const [showMockup, setShowMockup] = useState(false)
  const [mockupDataUrl, setMockupDataUrl] = useState<string | null>(null)
  const [mockupRot, setMockupRot] = useState({ x: 4, y: -38 })
  const [isMockupDragging, setIsMockupDragging] = useState(false)
  const [focusedElement, setFocusedElement] = useState<'title' | 'subtitle' | 'author'>('title')

  const exportFnRef = useRef<((scale?: number) => string | null) | null>(null)

  useEffect(() => {
    if (!showMockup) return
    const id = setTimeout(() => {
      setMockupDataUrl(exportFnRef.current?.() ?? null)
    }, 80)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplate, showMockup])

  const imageUrl = uploadedImageUrl ?? generatedImageUrl

  // ── Apply a concept to the editor state ─────────────────────────────────────
  function applyConceptToEditor(conceptData: CoverConcept, imgUrl: string, cdn: string | null) {
    setConcept(conceptData)
    setGeneratedImageUrl(imgUrl)
    setCdnUrl(cdn)
    setFgImageUrl(null)
    setImagePos({ x: 0, y: 0 })
    setImageScale(1)

    if (conceptData.customLayout) {
      const layout = conceptData.customLayout

      const wordCount = (bookInfo.title || '').trim().split(/\s+/).filter(Boolean).length
      if (wordCount >= 4) layout.titleWidthFill = false

      const MAX_TINT = 0.42
      const MAX_VIGNETTE = 0.65
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
      const isSolidBlock = layout.overlay.type === 'solid-block'
      const safeTitleColor  = isSolidBlock ? layout.titleColor  : '#ffffff'
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
      setTitleStyle(s => ({
        ...s,
        fontFamily: conceptData.titleFont || s.fontFamily,
        color: conceptData.titleColor || s.color,
      }))
      setAuthorStyle(s => ({ ...s, color: conceptData.authorColor || s.color }))
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

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
    setSubtitlePos({ x: t.titlePos.x, y: defaultSubtitleY(t) })
    setAuthorPos(t.authorPos)
  }

  const handleTitlePlacementSuggested = (pos: Position) => {
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
      if (ov.type === 'tint') return { ...t, overlayStyle: { type: 'tint', opacity: darkness } }
      if (ov.type === 'vignette') {
        const current = (ov.topOpacity + ov.bottomOpacity) / 2
        if (current === 0) return { ...t, overlayStyle: { type: 'vignette', topOpacity: darkness * 0.85, bottomOpacity: darkness } }
        const scale = darkness / current
        return { ...t, overlayStyle: {
          type: 'vignette',
          topOpacity:    Math.min(1, ov.topOpacity * scale),
          bottomOpacity: Math.min(1, ov.bottomOpacity * scale),
        }}
      }
      if (ov.type === 'band') return { ...t, overlayStyle: { ...ov, opacity: Math.min(1, darkness / 0.55) } }
      return t
    })
  }

  const handleImageUpload = (url: string) => {
    setUploadedImageUrl(url)
    setImagePos({ x: 0, y: 0 })
    setImageScale(1)
    setCdnUrl(null)
    setFgImageUrl(null)
    setPhase('editor')
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

  // Generate all 4 variants in parallel
  const handleGenerate = async () => {
    if (!bookInfo.title || !bookInfo.genre) {
      setError('Please fill in at least a title and genre.')
      return
    }
    setError(null)
    setIsGenerating(true)
    setUploadedImageUrl(null)

    // Switch to gallery and show 4 loading slots immediately
    const loadingSlots: GeneratedVariant[] = Array(4).fill(null).map(() => ({
      concept: null, imageUrl: null, cdnUrl: null, isLoading: true, error: null,
    }))
    setVariants(loadingSlots)
    setPhase('gallery')

    try {
      // Step 1: get 4 concepts from GPT in one call
      const conceptRes = await fetch('/api/generate-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookInfo),
      })
      if (!conceptRes.ok) throw new Error('Failed to generate cover concepts')
      const conceptData = await conceptRes.json()

      const variantConcepts: CoverConcept[] = conceptData.variants ?? []
      if (variantConcepts.length === 0) throw new Error('No variants returned')

      // Mark each slot with its concept (still loading image)
      setVariants(variantConcepts.map(c => ({
        concept: c, imageUrl: null, cdnUrl: null, isLoading: true, error: null,
      })))

      // Step 2: fire all 4 image generations in parallel using Schnell (fast/cheap previews)
      await Promise.all(variantConcepts.map(async (c, i) => {
        try {
          const imageRes = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: c.imagePrompt, quality: 'preview' }),
          })
          if (!imageRes.ok) throw new Error('Image generation failed')
          const imageData = await imageRes.json()

          setVariants(prev => prev.map((v, idx) =>
            idx === i
              ? { ...v, imageUrl: imageData.imageUrl, cdnUrl: imageData.cdnUrl ?? null, isLoading: false }
              : v
          ))
        } catch (err) {
          setVariants(prev => prev.map((v, idx) =>
            idx === i
              ? { ...v, isLoading: false, error: err instanceof Error ? err.message : 'Failed' }
              : v
          ))
        }
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPhase('form')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleVariantSelect = async (variant: GeneratedVariant) => {
    if (!variant.concept || !variant.imageUrl) return

    // Enter editor immediately with the preview image so it feels instant
    applyConceptToEditor(variant.concept, variant.imageUrl, variant.cdnUrl)
    setPhase('editor')
    setShowMockup(false)

    // Silently upgrade to Flux Pro in the background
    try {
      const imageRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: variant.concept.imagePrompt, quality: 'final' }),
      })
      if (!imageRes.ok) return
      const imageData = await imageRes.json()
      if (imageData.imageUrl) {
        setGeneratedImageUrl(imageData.imageUrl)
        if (imageData.cdnUrl) setCdnUrl(imageData.cdnUrl)
      }
    } catch {
      // Keep the preview image if upgrade fails — no error shown to user
    }
  }

  // Regenerate from editor — goes back to gallery with fresh results
  const handleRegenerate = () => {
    handleGenerate()
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
        <div className="ml-auto flex items-center gap-3">
          {phase === 'editor' && (
            <button
              onClick={() => setPhase('gallery')}
              disabled={variants.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              All styles
            </button>
          )}
          {phase === 'editor' && (
            <button
              onClick={() => {
                if (!showMockup) {
                  const dataUrl = exportFnRef.current?.() ?? null
                  setMockupDataUrl(dataUrl)
                  setMockupRot({ x: 4, y: -28 })
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
          )}
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

        {/* ── Gallery phase ─────────────────────────────────────────────────── */}
        {phase !== 'editor' && (
          phase === 'gallery' ? (
            <CoverGallery
              variants={variants}
              title={bookInfo.title}
              author={bookInfo.author}
              onSelect={handleVariantSelect}
              onBack={() => setPhase('form')}
            />
          ) : (
            // Form phase: empty center state
            <main className="flex-1 flex items-center justify-center bg-zinc-900">
              <p className="text-xs text-zinc-500 text-center px-10 leading-relaxed">
                Fill in your book details and click{' '}
                <span className="text-zinc-400">Generate Cover</span>
                <br />or upload your own image
              </p>
            </main>
          )
        )}

        {/* ── Editor phase ──────────────────────────────────────────────────── */}
        {phase === 'editor' && (
          <main className="flex-1 flex items-center justify-center bg-zinc-900 overflow-auto relative">
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
                isLoading={false}
                exportRef={exportFnRef}
              />
            </div>

            {/* ── 3D book mockup ── */}
            {showMockup && (() => {
              const S = 0.62
              const mW = Math.round(CANVAS_W * S)
              const mH = Math.round(CANVAS_H * S)
              const mSpine = Math.round(SPINE_W * S)
              const mPage  = Math.round(PAGE_W  * S)
              const spineIsSolid = activeTemplate.overlayStyle.type === 'solid-block'
              const spineBg   = spineIsSolid ? (activeTemplate.overlayStyle as { color: string }).color : '#0a0a14'
              const spineText = spineIsSolid ? activeTemplate.titleStyle.color : 'rgba(255,255,255,0.52)'

              const startDrag = (e: React.MouseEvent) => {
                e.preventDefault()
                const start = { x: e.clientX, y: e.clientY, rotX: mockupRot.x, rotY: mockupRot.y }
                setIsMockupDragging(true)
                const onMove = (ev: MouseEvent) => {
                  const dx = ev.clientX - start.x
                  const dy = ev.clientY - start.y
                  setMockupRot({
                    x: Math.max(-40, Math.min(40,  start.rotX - dy * 0.4)),
                    y: Math.max(-70, Math.min(70,  start.rotY + dx * 0.4)),
                  })
                }
                const onUp = () => {
                  setIsMockupDragging(false)
                  window.removeEventListener('mousemove', onMove)
                  window.removeEventListener('mouseup', onUp)
                }
                window.addEventListener('mousemove', onMove)
                window.addEventListener('mouseup', onUp)
              }

              return (
                <div className="flex flex-col items-center gap-6">
                  <div
                    style={{ cursor: isMockupDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
                    onMouseDown={startDrag}
                  >
                    <div style={{ perspective: `${Math.round(1100 * S)}px`, perspectiveOrigin: '50% 45%',
                      filter: 'drop-shadow(12px 22px 32px rgba(0,0,0,0.92))' }}>
                      <div style={{
                        position: 'relative', width: mW, height: mH,
                        transformStyle: 'preserve-3d',
                        transform: `rotateX(${mockupRot.x}deg) rotateY(${mockupRot.y}deg)`,
                      }}>
                        <div style={{
                          position: 'absolute', top: 0, left: 0,
                          width: mSpine, height: mH,
                          transformOrigin: 'left center',
                          transform: 'rotateY(-90deg)',
                          background: spineBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 55%, rgba(255,255,255,0.06) 100%)',
                          }} />
                          <span style={{
                            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                            fontSize: 7, letterSpacing: '0.09em', color: spineText,
                            fontFamily: activeTemplate.titleStyle.fontFamily,
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            position: 'relative', zIndex: 1, padding: '0 3px',
                          }}>
                            {bookInfo.title}{bookInfo.author ? ` · ${bookInfo.author}` : ''}
                          </span>
                        </div>

                        {mockupDataUrl && (
                          <img src={mockupDataUrl} alt="Book cover" style={{
                            position: 'absolute', inset: 0, display: 'block',
                            width: mW, height: mH,
                          }} />
                        )}
                        <div style={{
                          position: 'absolute', inset: 0, pointerEvents: 'none',
                          background: 'linear-gradient(to right, rgba(0,0,0,0.22) 0%, transparent 30%)',
                        }} />

                        <div style={{
                          position: 'absolute', top: 0, right: 0,
                          width: mPage, height: mH,
                          transformOrigin: 'right center',
                          transform: 'rotateY(-90deg)',
                          overflow: 'hidden',
                          borderRadius: '0 6px 6px 0',
                        }}>
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'repeating-linear-gradient(to right, #faf8f4 0px, #faf8f4 2px, #ddd6c8 2px, #ddd6c8 4px)',
                          }} />
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.10) 35%, transparent 75%)',
                          }} />
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.35) 100%)',
                          }} />
                          <div style={{
                            position: 'absolute', top: '4%', right: 0, bottom: '4%', width: 2,
                            background: 'rgba(255,255,255,0.30)',
                            borderRadius: 1,
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button onClick={() => navigateMockupTemplate(-1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
                    >‹</button>
                    <span className="text-xs text-zinc-400 w-20 text-center tracking-widest uppercase">
                      {activeTemplate.name}
                    </span>
                    <button onClick={() => navigateMockupTemplate(1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
                    >›</button>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setMockupDataUrl(exportFnRef.current?.() ?? null)}
                      className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 4v6h6M23 20v-6h-6" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />
                      </svg>
                      Sync from canvas
                    </button>
                    <span className="text-[10px] text-zinc-600">Drag to rotate · syncs latest edits</span>
                  </div>
                </div>
              )
            })()}
          </main>
        )}

        {/* ── Control panel — only in editor phase ─────────────────────────── */}
        {phase === 'editor' && (
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
            onRegenerate={handleRegenerate}
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
        )}
      </div>
    </div>
  )
}
