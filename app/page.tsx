'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import DescriptionPanel from '@/components/DescriptionPanel'
import ControlPanel from '@/components/ControlPanel'
import type { BookInfo, CoverConcept, TextStyle, Position, Template } from '@/lib/types'
import { TEMPLATES, CANVAS_W, CANVAS_H } from '@/lib/templates'

const SPINE_W = 48

const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false })

const DEFAULT_TEMPLATE = TEMPLATES[0]

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
  const [authorStyle, setAuthorStyle] = useState<TextStyle>(DEFAULT_TEMPLATE.authorStyle)

  // Text positions — draggable on canvas
  const [titlePos, setTitlePos] = useState<Position>(DEFAULT_TEMPLATE.titlePos)
  const [authorPos, setAuthorPos] = useState<Position>(DEFAULT_TEMPLATE.authorPos)

  // Active template (controls overlay + decoration)
  const [activeTemplate, setActiveTemplate] = useState<Template>(DEFAULT_TEMPLATE)

  // Image pan/zoom
  const [imagePos, setImagePos] = useState<Position>({ x: 0, y: 0 })
  const [imageScale, setImageScale] = useState(1)

  // Depth effect (text-behind-subject)
  const [cdnUrl, setCdnUrl] = useState<string | null>(null)
  const [fgImageUrl, setFgImageUrl] = useState<string | null>(null)
  const [isRemovingBg, setIsRemovingBg] = useState(false)

  // 3D mockup preview
  const [showMockup, setShowMockup] = useState(false)

  const exportFnRef = useRef<(() => string | null) | null>(null)

  // The image shown on canvas: prefer uploaded over generated
  const imageUrl = uploadedImageUrl ?? generatedImageUrl

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleApplyTemplate = (t: Template) => {
    setActiveTemplate(t)
    setTitleStyle(t.titleStyle)
    setAuthorStyle(t.authorStyle)
    setTitlePos(t.titlePos)
    setAuthorPos(t.authorPos)
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

      // Apply AI typography suggestions on top of current template
      setTitleStyle(s => ({
        ...s,
        fontFamily: conceptData.titleFont || s.fontFamily,
        color: conceptData.titleColor || s.color,
      }))
      setAuthorStyle(s => ({
        ...s,
        color: conceptData.authorColor || s.color,
      }))

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

  const handleExport = () => {
    const dataUrl = exportFnRef.current?.()
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
            onClick={() => setShowMockup(v => !v)}
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

        <main className="flex-1 flex items-center justify-center bg-zinc-900 overflow-auto">
          {showMockup ? (
            // ── 3D book mockup ────────────────────────────────────────────────
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
                {/* Cover — pointer events off so no accidental edits */}
                <div style={{ pointerEvents: 'none' }}>
                  <CanvasEditor
                    imageUrl={imageUrl}
                    fgImageUrl={fgImageUrl}
                    title={bookInfo.title}
                    subtitle={bookInfo.subtitle}
                    author={bookInfo.author}
                    titleStyle={titleStyle}
                    authorStyle={authorStyle}
                    titlePos={titlePos}
                    authorPos={authorPos}
                    imagePos={imagePos}
                    imageScale={imageScale}
                    template={activeTemplate}
                    onTitlePosChange={setTitlePos}
                    onAuthorPosChange={setAuthorPos}
                    onImagePosChange={setImagePos}
                    isLoading={isGenerating}
                    exportRef={exportFnRef}
                  />
                </div>
              </div>
            </div>
          ) : (
            // ── Edit mode ─────────────────────────────────────────────────────
            <CanvasEditor
              imageUrl={imageUrl}
              fgImageUrl={fgImageUrl}
              title={bookInfo.title}
              subtitle={bookInfo.subtitle}
              author={bookInfo.author}
              titleStyle={titleStyle}
              authorStyle={authorStyle}
              titlePos={titlePos}
              authorPos={authorPos}
              imagePos={imagePos}
              imageScale={imageScale}
              template={activeTemplate}
              onTitlePosChange={setTitlePos}
              onAuthorPosChange={setAuthorPos}
              onImagePosChange={setImagePos}
              isLoading={isGenerating}
              exportRef={exportFnRef}
            />
          )}
        </main>

        <ControlPanel
          titleStyle={titleStyle}
          authorStyle={authorStyle}
          onTitleStyleChange={setTitleStyle}
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
          onEnableDepth={handleEnableDepth}
          isRemovingBg={isRemovingBg}
          hasDepth={!!fgImageUrl}
        />
      </div>
    </div>
  )
}
