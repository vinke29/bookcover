'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import DescriptionPanel from '@/components/DescriptionPanel'
import ControlPanel from '@/components/ControlPanel'
import type { BookInfo, CoverConcept, TextStyle, Position, Template } from '@/lib/types'
import { TEMPLATES, CANVAS_W, CANVAS_H } from '@/lib/templates'

const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false })

const DEFAULT_TEMPLATE = TEMPLATES[0]

export default function Home() {
  const [bookInfo, setBookInfo] = useState<BookInfo>({
    title: '', author: '', genre: '', blurb: '', mood: '',
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
  }

  const handleGenerate = async () => {
    if (!bookInfo.title || !bookInfo.genre) {
      setError('Please fill in at least a title and genre.')
      return
    }
    setError(null)
    setIsGenerating(true)
    setUploadedImageUrl(null) // generating replaces any manual upload
    setImagePos({ x: 0, y: 0 })
    setImageScale(1)

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
          <CanvasEditor
            imageUrl={imageUrl}
            title={bookInfo.title}
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
        />
      </div>
    </div>
  )
}
