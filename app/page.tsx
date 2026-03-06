'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import DescriptionPanel from '@/components/DescriptionPanel'
import ControlPanel from '@/components/ControlPanel'
import type { BookInfo, CoverConcept, TextStyle } from '@/lib/types'

const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false })

const DEFAULT_TITLE_STYLE: TextStyle = {
  fontFamily: 'Georgia',
  fontSize: 38,
  color: '#ffffff',
}

const DEFAULT_AUTHOR_STYLE: TextStyle = {
  fontFamily: 'Georgia',
  fontSize: 20,
  color: '#cccccc',
}

export default function Home() {
  const [bookInfo, setBookInfo] = useState<BookInfo>({
    title: '',
    author: '',
    genre: '',
    blurb: '',
    mood: '',
  })
  const [concept, setConcept] = useState<CoverConcept | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titleStyle, setTitleStyle] = useState<TextStyle>(DEFAULT_TITLE_STYLE)
  const [authorStyle, setAuthorStyle] = useState<TextStyle>(DEFAULT_AUTHOR_STYLE)
  const exportFnRef = useRef<(() => string | null) | null>(null)

  const handleGenerate = async () => {
    if (!bookInfo.title || !bookInfo.genre) {
      setError('Please fill in at least a title and genre.')
      return
    }
    setError(null)
    setIsGenerating(true)

    try {
      // Step 1: Generate concept with OpenAI
      const conceptRes = await fetch('/api/generate-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookInfo),
      })
      if (!conceptRes.ok) throw new Error('Failed to generate cover concept')
      const conceptData: CoverConcept = await conceptRes.json()
      setConcept(conceptData)

      // Apply AI-suggested typography
      setTitleStyle(s => ({
        ...s,
        fontFamily: conceptData.titleFont || s.fontFamily,
        color: conceptData.titleColor || s.color,
      }))
      setAuthorStyle(s => ({
        ...s,
        color: conceptData.authorColor || s.color,
      }))

      // Step 2: Generate image with fal.ai
      const imageRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: conceptData.imagePrompt }),
      })
      if (!imageRes.ok) throw new Error('Failed to generate cover image')
      const imageData = await imageRes.json()
      setImageUrl(imageData.imageUrl)
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
        />
      </div>
    </div>
  )
}
