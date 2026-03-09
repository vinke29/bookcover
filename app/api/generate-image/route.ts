import { NextRequest, NextResponse } from 'next/server'

// Allow up to 60s for the pro model to finish
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.FAL_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'FAL_KEY not set' }, { status: 500 })
    }

    // Append universal quality suffix — reinforces the painterly illustration register
    const enhancedPrompt = `${prompt}, professional book cover illustration, painterly art style, cinematic lighting, ultra detailed, award-winning cover art, no text, no letters, no typography`

    const res = await fetch('https://fal.run/fal-ai/flux-pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        image_size: { width: 768, height: 1152 },
        num_images: 1,
        num_inference_steps: 28,
        guidance_scale: 4.5,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const detail = (err as any)?.detail ?? (err as any)?.message ?? res.statusText
      console.error('fal.ai error:', res.status, detail)
      return NextResponse.json({ error: `Image generation failed: ${detail}` }, { status: 500 })
    }

    const data = await res.json()
    const imageUrl = data.images?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL in fal.ai response')
    }

    // Fetch and convert to base64 to avoid CORS issues on the client
    const imgRes = await fetch(imageUrl)
    const buffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = imgRes.headers.get('content-type') ?? 'image/jpeg'

    return NextResponse.json({ imageUrl: `data:${mimeType};base64,${base64}`, cdnUrl: imageUrl })
  } catch (error: any) {
    console.error('generate-image error:', error.message)
    return NextResponse.json({ error: error.message ?? 'Failed to generate image' }, { status: 500 })
  }
}
