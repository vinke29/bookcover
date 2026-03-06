'use client'

import { useEffect, useRef } from 'react'
import type { TextStyle } from '@/lib/types'

interface Props {
  imageUrl: string | null
  title: string
  author: string
  titleStyle: TextStyle
  authorStyle: TextStyle
  isLoading: boolean
  exportRef: React.MutableRefObject<(() => string | null) | null>
}

const CANVAS_W = 400
const CANVAS_H = 600

export default function CanvasEditor({
  imageUrl,
  title,
  author,
  titleStyle,
  authorStyle,
  isLoading,
  exportRef,
}: Props) {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<any>(null)
  const titleObjRef = useRef<any>(null)
  const authorObjRef = useRef<any>(null)
  const overlayRef = useRef<any>(null)

  // Initialize canvas once
  useEffect(() => {
    if (!canvasElRef.current) return
    let canvas: any
    let disposed = false

    import('fabric').then(({ Canvas, IText, Rect, Shadow }) => {
      if (disposed || !canvasElRef.current) return

      canvas = new Canvas(canvasElRef.current, {
        width: CANVAS_W,
        height: CANVAS_H,
        selection: true,
      })
      fabricRef.current = canvas

      // Dark placeholder background
      const bg = new Rect({
        left: 0,
        top: 0,
        width: CANVAS_W,
        height: CANVAS_H,
        fill: '#1a1a2e',
        selectable: false,
        evented: false,
        hoverCursor: 'default',
      })
      canvas.add(bg)

      // Semi-transparent gradient overlay at the bottom for text legibility
      const overlay = new Rect({
        left: 0,
        top: CANVAS_H * 0.55,
        width: CANVAS_W,
        height: CANVAS_H * 0.45,
        fill: 'rgba(0,0,0,0.55)',
        selectable: false,
        evented: false,
        hoverCursor: 'default',
      })
      overlayRef.current = overlay
      canvas.add(overlay)

      const textShadow = new Shadow({ color: 'rgba(0,0,0,0.9)', blur: 12, offsetX: 1, offsetY: 2 })

      // Title text
      const titleText = new IText(title || 'Your Book Title', {
        left: CANVAS_W / 2,
        top: CANVAS_H * 0.76,
        fontSize: 38,
        fill: '#ffffff',
        fontFamily: 'Georgia',
        originX: 'center',
        originY: 'center',
        textAlign: 'center',
        width: CANVAS_W - 40,
        shadow: textShadow,
        fontWeight: 'bold',
      })
      titleObjRef.current = titleText
      canvas.add(titleText)

      // Author text
      const authorText = new IText(author || 'Author Name', {
        left: CANVAS_W / 2,
        top: CANVAS_H * 0.9,
        fontSize: 20,
        fill: '#cccccc',
        fontFamily: 'Georgia',
        originX: 'center',
        originY: 'center',
        textAlign: 'center',
        width: CANVAS_W - 40,
        shadow: new Shadow({ color: 'rgba(0,0,0,0.7)', blur: 8, offsetX: 1, offsetY: 1 }),
      })
      authorObjRef.current = authorText
      canvas.add(authorText)

      canvas.renderAll()

      exportRef.current = () =>
        canvas.toDataURL({ format: 'png', multiplier: 2 })
    })

    return () => {
      disposed = true
      canvas?.dispose()
      fabricRef.current = null
      titleObjRef.current = null
      authorObjRef.current = null
    }
  }, [])

  // Update background image
  useEffect(() => {
    if (!fabricRef.current || !imageUrl) return
    import('fabric').then(({ FabricImage }) => {
      FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img: any) => {
        const canvas = fabricRef.current
        if (!canvas) return
        const scaleX = CANVAS_W / img.width!
        const scaleY = CANVAS_H / img.height!
        const scale = Math.max(scaleX, scaleY)
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: CANVAS_W / 2,
          top: CANVAS_H / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          hoverCursor: 'default',
        })
        canvas.backgroundImage = img

        // Bring overlay and text to front
        if (overlayRef.current) canvas.bringObjectToFront(overlayRef.current)
        if (titleObjRef.current) canvas.bringObjectToFront(titleObjRef.current)
        if (authorObjRef.current) canvas.bringObjectToFront(authorObjRef.current)

        canvas.renderAll()
      })
    })
  }, [imageUrl])

  // Update title text content
  useEffect(() => {
    if (!titleObjRef.current || !fabricRef.current) return
    titleObjRef.current.set({ text: title || 'Your Book Title' })
    fabricRef.current.renderAll()
  }, [title])

  // Update author text content
  useEffect(() => {
    if (!authorObjRef.current || !fabricRef.current) return
    authorObjRef.current.set({ text: author || 'Author Name' })
    fabricRef.current.renderAll()
  }, [author])

  // Update title style
  useEffect(() => {
    if (!titleObjRef.current || !fabricRef.current) return
    titleObjRef.current.set({
      fontFamily: titleStyle.fontFamily,
      fontSize: titleStyle.fontSize,
      fill: titleStyle.color,
    })
    fabricRef.current.renderAll()
  }, [titleStyle])

  // Update author style
  useEffect(() => {
    if (!authorObjRef.current || !fabricRef.current) return
    authorObjRef.current.set({
      fontFamily: authorStyle.fontFamily,
      fontSize: authorStyle.fontSize,
      fill: authorStyle.color,
    })
    fabricRef.current.renderAll()
  }, [authorStyle])

  return (
    <div className="relative shadow-2xl rounded-sm overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm text-zinc-300">Crafting your cover...</span>
        </div>
      )}
      {!imageUrl && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 gap-2">
          <p className="text-xs text-zinc-500 text-center px-8">
            Fill in your book details and click <span className="text-zinc-400">Generate Cover</span>
          </p>
        </div>
      )}
      <canvas ref={canvasElRef} />
    </div>
  )
}
