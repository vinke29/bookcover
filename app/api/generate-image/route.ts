import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    fal.config({ credentials: process.env.FAL_KEY })

    const result = await fal.subscribe('fal-ai/flux/dev', {
      input: {
        prompt,
        image_size: 'portrait_4_3', // 768x1024
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      },
    })

    const imageUrl = (result.data as { images: { url: string }[] }).images?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image returned from fal.ai')
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('generate-image error:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
