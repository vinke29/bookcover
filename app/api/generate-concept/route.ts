import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const bookInfo = await req.json()

    const prompt = `You are an award-winning book cover designer with deep knowledge of typography, composition, and genre conventions.

Book to design for:
Title: ${bookInfo.title}
Author: ${bookInfo.author || 'Unknown'}
Genre: ${bookInfo.genre}
Mood: ${bookInfo.mood || 'not specified'}
Description: ${bookInfo.blurb || 'not provided'}

Return a single flat JSON object with ALL of these fields at the top level (no nesting, no section wrappers):

- imagePrompt: Detailed image generation prompt. STYLE RULE: This must look like a premium published book cover illustration — NOT a photograph, NOT stock imagery. Use one of these specific styles based on genre: thriller/mystery/horror → "dark cinematic digital painting, dramatic chiaroscuro lighting, deep shadows, muted palette with one vivid accent color, painterly brushwork"; literary/historical → "fine art oil painting style, rich textured brushstrokes, museum-quality composition, muted earthy tones, dramatic natural lighting"; fantasy/sci-fi → "epic concept art, cinematic matte painting, volumetric light, hyperdetailed environment"; romance/YA → "stylized illustration, soft painterly style, warm glowing light, editorial art". CHARACTER RULE: For romance, YA, fantasy, paranormal — stylized painted characters are appropriate, NOT photorealistic. For literary fiction, thriller, mystery, historical, sci-fi, horror — NO human figures; use environments, objects, symbolic imagery, dramatic light/shadow instead. COMPOSITION: strong focal point in BOTTOM 60%, upper 40% as open sky/atmosphere/negative space for title text. Include specific atmospheric details: volumetric light rays, dust particles, fog layers, or dramatic cloud formations. No text, letters, or typography in the image. End with: "premium book cover illustration, painterly art style, cinematic lighting, subject in lower half, atmospheric negative space at top, no text, no letters, ultra detailed, award-winning cover art"
- titleFont: Best-fit font for the genre — one of: Playfair Display, EB Garamond, Cinzel, Bebas Neue, Oswald, Montserrat, Georgia, Impact, Helvetica, Courier New
- titleColor: Hex color (high contrast, readable)
- authorColor: Hex color (slightly more subtle than title)
- layout: "top" | "center" | "bottom"
- colorPalette: Array of exactly 5 hex colors representing the cover's mood
- mood: One sentence describing the visual feeling
- customLayout: (object, see below)

The customLayout field is an object with this structure — design it creatively for the specific book:
Design a completely original layout. The most important decision is overlay opacity — it determines whether the IMAGE or the TEXT is the hero. Wrong opacity = ruined cover.

RULE 1 — IMAGE-HERO genres (romance, YA, cozy mystery, women's fiction, contemporary fiction):
The artwork IS the cover. Overlay opacity MUST be 0.00–0.12 (or type "none"). The illustration fills the frame, text is a stylish guest. Use italic serif or script font (Dancing Script, Playfair Display italic), large 70–90px. titleYPercent 45–58. textBackdrop: null. Think "Beach Read", "The Hating Game", "People We Meet on Vacation" — you can see the whole illustration clearly.
CRITICAL COLOR RULE FOR IMAGE-HERO: titleColor MUST be "#ffffff" (white). Never use pink, coral, gold, rose, or any warm color — these will be invisible against a colorful illustration. White text with drop shadow is THE professional standard for text over illustrated covers. authorColor should be "rgba(255,255,255,0.80)".
Good romance example: overlay {"type":"tint","opacity":0.06}, titleFont "Dancing Script", titleSize 86, titleItalic true, titleColor "#ffffff", authorColor "rgba(255,255,255,0.75)", titleWidthFill false, titleRotation -2

RULE 2 — TEXT-HERO genres (literary fiction, upmarket fiction, book club fiction):
The overlay darkens the image so it reads as texture behind the title. overlay opacity 0.45–0.62. Title 84–108px bold serif, centered, titleYPercent 44–52. titleWidthFill false. The title IS the visual weight of the entire cover.
CRITICAL COLOR RULE FOR TEXT-HERO: titleColor MUST be "#ffffff" (pure white). NEVER use teal, blue, gold, gray, or any color that could blend with the artwork — even with a 50% tint the image is still visible and a colored title will camouflage. authorColor should be "rgba(255,255,255,0.78)".
Good literary example: overlay {"type":"tint","opacity":0.52}, titleFont "Playfair Display", titleSize 96, titleItalic false, titleWidthFill false, titleColor "#ffffff", authorColor "rgba(255,255,255,0.78)"

RULE 3 — BOLD STACKED genres (commercial fiction, feel-good, rom-com, beach reads with simple illustration):
Use titleWidthFill: true — each word auto-sizes to fill the full canvas width, stacked like "The Seven Year Slip". overlay 0.05–0.20. Large bold sans or display font. titleYPercent 45–60.
CRITICAL WIDTHFILL RULES: (a) Only use titleWidthFill: true when the title has 1–3 words. If the title has 4+ words, set titleWidthFill: false and use a large bold font instead. (b) When titleWidthFill is true, ALWAYS set titleYPercent to 45–60 (center of canvas) — never below 45, because each word renders at a very large size and the block needs space above and below. (c) Short punchy titles only: "Daisy", "The Slip", "After You" work great. "The God of the Woods" has 5 words — use titleWidthFill: false for that.
Good stacked example: overlay {"type":"tint","opacity":0.08}, titleFont "Abril Fatface", titleWidthFill true, titleRotation 0, titleYPercent 52

RULE 4 — THRILLER/CRIME: Heavy vignette topOpacity 0.65–0.78, bottomOpacity 0.75–0.88. Oswald or Bebas Neue 74–95px UPPERCASE at titleYPercent 18–26. Possible red accentBar.

RULE 5 — FANTASY/SCI-FI: Moderate vignette bottomOpacity 0.65–0.82. Cinzel or EB Garamond 60–80px. ornament: true. Possible border.

RULE 6 — HISTORICAL: colorTint "rgba(130,80,20,0.22)", EB Garamond, border, dividerStyle "dots".

Available overlay structures (use exact JSON):
{"type":"tint","opacity":0.06}  ← image fully visible, barely-there darkening
{"type":"tint","opacity":0.52}  ← text-hero, image recedes to texture but still visible
{"type":"vignette","topOpacity":0.65,"bottomOpacity":0.88}  ← dark edges, clear center
{"type":"band","bandRatio":0.40,"opacity":0.94}  ← dark band at bottom
{"type":"solid-block","position":"bottom","heightRatio":0.32,"color":"#f0ede5"}
{"type":"none"}  ← no darkening at all

Available fonts: Abril Fatface, Dancing Script, Pacifico, Playfair Display, EB Garamond, Cinzel, Lora, Bebas Neue, Oswald, Montserrat, Raleway, Georgia, Impact, Courier New

customLayout fields (ALL required):
- overlay: one of the structures above
- colorTint: null or "rgba(r,g,b,a)"
- titleFont: font name from list above
- titleSize: 36–110 (ignored when titleWidthFill is true, but still provide a reasonable value)
- titleColor: hex
- titleAlign: "left" | "center" | "right"
- titleTransform: "none" | "uppercase"
- titleYPercent: 10–88
- titleItalic: boolean
- titleRotation: degrees -8 to 8 (0 = straight, small angle adds personality for romance/YA)
- titleWidthFill: boolean (true = each word fills canvas width, "Seven Year Slip" effect)
- authorFont: font name
- authorSize: 12–22
- authorColor: hex
- authorAlign: "left" | "center" | "right"
- authorYPercent: 87–96
- showDivider: boolean
- dividerStyle: "line" | "dots" | "diamond"
- accentLines: boolean
- accentLineColor: null or color string
- accentBar: null or {"color":"#hex","height":3}
- ornament: boolean
- border: null or {"padding":14,"color":"rgba(245,230,200,0.45)","lineWidth":1}
- textBackdrop: null or {"opacity":0.5,"padding":16}
- noShadow: boolean (ONLY true for solid-block with dark text on light bg)

GLOBAL COLOR LAW — applies to every genre, every layout:
titleColor MUST be "#ffffff" for ANY overlay type except solid-block. This is non-negotiable. Teal, blue, gold, rose, sage, slate — all invisible against artwork. White is the only color that is always readable. The only exception: solid-block layouts where the text sits on a solid panel (use dark text there).

Return only valid JSON with no markdown or code fences.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
