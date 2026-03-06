import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const bookInfo = await req.json()

    const prompt = `You are a professional book cover designer with deep knowledge of genre conventions and visual design.

Based on this book information, generate a detailed cover concept:

Title: ${bookInfo.title}
Author: ${bookInfo.author || 'Unknown'}
Genre: ${bookInfo.genre}
Mood: ${bookInfo.mood || 'not specified'}
Description: ${bookInfo.blurb || 'not provided'}

Respond with a JSON object containing:
- imagePrompt: A detailed, cinematic image generation prompt for the cover art background. Focus on atmosphere, lighting, composition, and style. Do NOT include any text, letters, or typography in the image. Append "professional book cover art, no text, no words, no letters" at the end.
- titleFont: One of these system fonts that fits the genre: Georgia, Times New Roman, Palatino Linotype, Arial, Helvetica, Impact, Garamond, Trebuchet MS, Courier New
- titleColor: Hex color for the title text (high contrast, readable over the image)
- authorColor: Hex color for the author name (slightly more subtle than title)
- layout: Where to position the title — one of: "top", "center", "bottom"
- colorPalette: Array of exactly 5 hex color strings representing the cover's color mood
- mood: One sentence describing the visual feeling of the cover

Return only valid JSON with no markdown or code fences.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    })

    const data = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json(data)
  } catch (error) {
    console.error('generate-concept error:', error)
    return NextResponse.json({ error: 'Failed to generate cover concept' }, { status: 500 })
  }
}
