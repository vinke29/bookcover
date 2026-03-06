import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const detail = (err as any)?.error?.message ?? res.statusText
      console.error('Gemini image error:', res.status, detail)
      return NextResponse.json({ error: `Image generation failed: ${detail}` }, { status: 500 })
    }

    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'))

    if (!imagePart) {
      throw new Error('No image data in Gemini response')
    }

    const { mimeType, data: b64 } = imagePart.inlineData
    const imageUrl = `data:${mimeType};base64,${b64}`

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('generate-image error:', error.message)
    return NextResponse.json({ error: error.message ?? 'Failed to generate image' }, { status: 500 })
  }
}
