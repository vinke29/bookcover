import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { cdnUrl } = await req.json()
    const apiKey = process.env.FAL_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'FAL_KEY not set' }, { status: 500 })
    }

    const res = await fetch('https://fal.run/fal-ai/imageutils/rembg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify({ image_url: cdnUrl }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const detail = (err as any)?.detail ?? (err as any)?.message ?? res.statusText
      console.error('rembg error:', res.status, detail)
      return NextResponse.json({ error: `Background removal failed: ${detail}` }, { status: 500 })
    }

    const data = await res.json()
    const fgUrl = data.image?.url
    if (!fgUrl) throw new Error('No image URL in rembg response')

    const imgRes = await fetch(fgUrl)
    const buffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = imgRes.headers.get('content-type') ?? 'image/png'

    return NextResponse.json({ fgImageUrl: `data:${mimeType};base64,${base64}` })
  } catch (error: any) {
    console.error('remove-bg error:', error.message)
    return NextResponse.json({ error: error.message ?? 'Failed to remove background' }, { status: 500 })
  }
}
