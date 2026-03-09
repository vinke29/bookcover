import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { batchIndex = 0, ...bookInfo } = await req.json()

    const prompt = `You are an award-winning book cover art director. Design 4 completely different cover concepts for this book.

Book:
Title: ${bookInfo.title}
Author: ${bookInfo.author || 'Unknown'}
Genre: ${bookInfo.genre}
Mood: ${bookInfo.mood || 'not specified'}
Description: ${bookInfo.blurb || 'not provided'}

Return a JSON object: { "variants": [ ...exactly 4 objects... ] }
Each variant object contains ALL the fields listed at the end, PLUS a "styleName" field.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — imagePrompt rules (apply within each variant's style)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━ COMPOSITION LAW (for Cinematic, Bold, Atmospheric variants) ━━
Subject and primary visual interest MUST occupy the LOWER 55–65% of the frame.
The UPPER 35–45% must be atmospheric negative space — reserved for the book title.
Always include: "subject in lower two-thirds of frame, open atmospheric space in upper third, no text, no letters, no typography"

━━ GENRE ART STYLE ━━

FANTASY (epic, high fantasy, cozy fantasy, magic, fae, mythical):
"lush painterly fantasy illustration, luminous digital oil painting with masterful chiaroscuro, volumetric god rays piercing through ancient trees or clouds, rich jewel-toned palette of deep sapphire and forest emerald and burnished gold, magical particles of light and floating dust in air, intricate environmental detail with visible painterly brushwork, soft atmospheric bokeh depth in background, cinematic concept art quality inspired by Alan Lee watercolor technique and Craig Mullins painterly precision"

COZY MYSTERY:
"charming illustrated book cover art, warm watercolor and gouache texture, palette of honey amber and dusty sage and cream and rose, Coralie Bickford-Smith decorative Penguin Clothbound style meets Nordic editorial illustration, soft warm candlelight glow, cozy inviting domestic atmosphere, illustrated storybook quality"

THRILLER / PSYCHOLOGICAL THRILLER:
"dark cinematic digital painting, stark chiaroscuro with deep blacks and single source of harsh directional light, palette almost fully desaturated with ONE vivid accent color — either deep arterial crimson OR electric amber — against grey-black environment, eerie threatening stillness, NO human figures — only environments, shadows, and objects"

CRIME / NOIR:
"film noir digital painting, rain-slicked urban nightscape with neon reflections pooling in puddles, Edward Hopper isolation and light quality meets J.C. Leyendecker technique, palette of coal black and steel grey with one neon accent, harsh geometry of city architecture casting dramatic shadows"

ROMANCE:
"warm editorial illustration with soft golden-hour painterly quality, peach and amber and blush tones, soft cinematic bokeh in background, intimate and inviting composition, painterly impressionist style with warm glowing light"

DARK ROMANCE / ROMANTASY:
"dark romantic fantasy illustration, moody chiaroscuro with deep jewel tones — blood burgundy, midnight sapphire, molten gold rim-light — dramatic interplay between magical fire or moonlight against deep shadow, intricate environmental detail, brooding atmosphere"

LITERARY FICTION:
"fine art conceptual illustration, muted sophisticated palette, Edward Hopper quality of light and loneliness, single powerful visual metaphor, thoughtful spare composition with emotional weight, oil painting surface texture, FSG cover aesthetic. USE: evocative objects, empty spaces, silhouettes, symbolic imagery. NO faces."

HISTORICAL FICTION:
"classical oil painting with rich impasto texture, Pre-Raphaelite richness, warm period palette of aged gold and deep crimson and forest green and walnut brown, exquisite period-appropriate detail, soft natural window light"

SCI-FI SPACE OPERA:
"cinematic science fiction concept art, awe-inspiring cosmic or planetary scale, tiny human or ship element against vast alien environment, dramatic volumetric atmosphere lighting with blue-violet-warm-orange temperature split"

SCI-FI CYBERPUNK:
"cyberpunk digital painting, Blade Runner 2049 color grading, rain-soaked neon-lit urban environment, orange and teal temperature split, holographic light elements bleeding through haze"

HORROR:
"atmospheric horror digital painting, palette of ash grey and bone white and deep black with one wrong-colored accent, psychological dread achieved through environmental distortion and uncanny stillness. NO gore. USE: environments, architecture, shadows, twisted nature."

YA:
"young adult book cover illustration, vibrant dynamic palette, bold dramatic backlighting creating rim-light halo around subject, stylized expressive illustrated characters or magical environment, Charlie Bowater and Laia López painterly style"

ADVENTURE:
"classic adventure illustration in the golden age tradition of N.C. Wyeth and Howard Pyle, dynamic heroic composition frozen at a decisive moment, warm saturated golden-hour light with deep atmospheric shadow, rich earth tones against vivid sky"

━━ MOOD MODIFIER ━━
Apply as modifier within genre style:
Whimsical & Magical: "soft magical glow emanating from within scene, floating luminous particles and fireflies, pastel warmth, enchanted storybook feeling"
Romantic & Soft: "golden-hour impressionist softness, dreamy bokeh hazing background, warmth and longing, gentle diffuse light"
Epic & Grand: "dramatic sweeping wide composition, volumetric god rays breaking through clouds, heroic scale and grandeur, majestic cinematic atmosphere"
Dark & Gritty: "heavily desaturated and grain-textured, oppressive shadows, rough weathered surfaces"
Mysterious & Suspenseful: "deep atmospheric fog and mist layering, partial concealment of subject, ominous depth receding into darkness"
Heartwarming & Uplifting: "warm golden light flooding the scene, bright open sky, optimistic color temperature, inviting and cheerful"
Melancholic & Reflective: "muted overcast light quality, long afternoon shadows, autumn warmth draining to cool, quiet contemplative sadness"
Eerie & Unsettling: "uncanny wrong lighting, liminal space atmosphere, psychological unease from near-normal-but-wrong composition"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — Font rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Select from: Abril Fatface, Dancing Script, Pacifico, Playfair Display, EB Garamond, Cinzel, Lora, Bebas Neue, Oswald, Montserrat, Raleway, Georgia, Impact, Courier New

Bebas Neue → ONLY Thriller, Crime, Action-Adventure
Oswald → ONLY Thriller, Crime, Contemporary Fiction, Cyberpunk
Fantasy (epic): Cinzel, EB Garamond, Playfair Display
Fantasy (cozy): Playfair Display italic, EB Garamond, Dancing Script
Cozy Mystery: EB Garamond, Lora, Playfair Display
Romance: Dancing Script, Lora, Playfair Display
Dark Romance / Romantasy: Cinzel, Playfair Display, EB Garamond
Literary Fiction: Playfair Display, EB Garamond, Georgia, Lora
Historical Fiction: EB Garamond, Cinzel, Playfair Display
Sci-Fi: Cinzel/Raleway/Montserrat (space opera), Raleway/Montserrat/Oswald (cyberpunk)
Horror: Playfair Display, Georgia, EB Garamond
YA: Cinzel, Raleway, Dancing Script
Adventure: Abril Fatface, Bebas Neue, Oswald

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — The 4 mandatory variant styles (Batch ${batchIndex})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${batchIndex === 0 ? `
VARIANT 1 — styleName: "Cinematic"
Use the genre art style + mood modifier from Parts 1–2. Select the most compelling dramatic archetype.
Apply composition law (subject lower 55-65%, open space upper 35-45%).
overlay: vignette with topOpacity 0.55-0.72, bottomOpacity 0.60-0.78
titleYPercent: 16-26
titleColor: "#ffffff"
authorColor: "rgba(255,255,255,0.72)"
titleFont: per genre rules above
titleTransform: "uppercase" for thriller/crime/adventure, "none" for everything else
ornament: true for fantasy/romance/historical, false otherwise

VARIANT 2 — styleName: "Literary Clean"
This is a LIGHT BACKGROUND cover inspired by Penguin and FSG literary fiction design.
imagePrompt: IGNORE the dark cinematic genre styles above. Use ONLY: "isolated [relevant subject or symbolic object from the book], hand-painted watercolor illustration, subject centered in lower 50% of frame, vast cream off-white negative space above, soft brushwork with gentle edges, editorial illustration aesthetic, no dramatic lighting, no dark backgrounds, clean minimal, painterly, no text, no letters, no typography"
overlay MUST be EXACTLY: {"type":"solid-block","position":"top","heightRatio":0.38,"color":"#f5f0eb"}
titleYPercent: 18-26 (MUST be inside the cream block, i.e. less than 38)
titleColor: choose ONE rich accent color — terracotta "#c45c2a", deep navy "#1c2b4a", forest green "#2d4a35", burgundy "#6b1d2a", slate blue "#2a3d5c", warm brown "#5c3317" — NEVER white
noShadow: true
titleFont: "Playfair Display" (italic preferred) or "EB Garamond"
titleItalic: true
authorColor: same family as titleColor, rgba with 0.80 opacity
authorYPercent: 90-93
titleSize: 52-72
titleWidthFill: false

VARIANT 3 — styleName: "Bold"
imagePrompt: same genre but with strong graphic composition, high-contrast, subject filling lower 40-50%, bold visual impact
Apply composition law.
titleWidthFill: true if title has 1-3 words, false otherwise
titleFont: "Abril Fatface"
titleSize: 88-110
overlay: {"type":"tint","opacity":0.08} to {"type":"tint","opacity":0.16}
titleYPercent: 42-56
titleColor: "#ffffff"
titleTransform: "none"
ornament: false
accentBar: null
accentLines: false

VARIANT 4 — styleName: "Atmospheric"
imagePrompt: abstract and symbolic — evoke the emotional tone rather than depicting the story literally. Color-washed, textural, impressionistic, painterly. Focus on mood, light, and texture over narrative scene.
Apply composition law.
overlay: {"type":"tint","opacity":0.30} to {"type":"tint","opacity":0.42} OR vignette topOpacity 0.50-0.58, bottomOpacity 0.50-0.58
titleFont: "Playfair Display" (italic) or "EB Garamond" — NEVER Bebas Neue or Abril Fatface
titleItalic: true
titleYPercent: 40-52
titleColor: "#ffffff"
titleSize: 56-80
titleWidthFill: false
ornament: true
` : batchIndex === 1 ? `
VARIANT 1 — styleName: "Shadow Band"
A film noir / crime aesthetic. Dark image with heavy shadow band at bottom 40%.
imagePrompt: film noir atmosphere — rain-slicked streets OR isolated room with single lamp OR shadows and fog. Dark, moody, cinematic. Apply genre and mood from Part 1.
Apply composition law.
overlay MUST be EXACTLY: {"type":"band","bandRatio":0.40,"opacity":0.95}
titleYPercent: 74-82 (in the dark band at bottom)
titleFont: "Playfair Display" or "EB Garamond"
titleColor: "#f0ebe0"
titleSize: 52-70
showDivider: true
dividerStyle: "diamond"
authorYPercent: 93-96
authorColor: "rgba(154,144,128,0.90)"
ornament: false

VARIANT 2 — styleName: "Heritage"
Historical / vintage aesthetic. Sepia-toned with inset border frame.
imagePrompt: period-appropriate historical illustration, warm golden-hour light, classical composition. Apply genre and mood from Part 1.
Apply composition law.
colorTint: "rgba(100,65,10,0.22)"
overlay: vignette topOpacity 0.55-0.65, bottomOpacity 0.78-0.88
border: {"padding":14,"color":"rgba(245,230,200,0.40)","lineWidth":1}
titleFont: "EB Garamond"
titleTransform: "uppercase"
titleColor: "#f5e6c8"
titleSize: 46-58
titleYPercent: 68-78
showDivider: true
dividerStyle: "dots"
authorColor: "rgba(200,170,120,0.85)"
authorYPercent: 90-93
ornament: false

VARIANT 3 — styleName: "Editorial"
Magazine / art-book cover. Nearly full-bleed image, left-aligned uppercase sans at top.
imagePrompt: strong editorial composition, striking subject, confident and graphic. Apply genre and mood from Part 1.
Apply composition law.
overlay: {"type":"tint","opacity":0.10} to {"type":"tint","opacity":0.15}
titleFont: "Montserrat" or "Raleway"
titleTransform: "uppercase"
titleAlign: "left"
titleSize: 26-36
titleYPercent: 8-14
titleColor: "#ffffff"
titleWidthFill: false
authorAlign: "left"
authorFont: "Montserrat"
authorYPercent: 92-95
ornament: false
showDivider: false

VARIANT 4 — styleName: "Elegant Script"
Soft and elegant. Flowing script title, ornament, very light tint.
imagePrompt: warm romantic scene, golden-hour light, intimate atmosphere. Apply genre and mood from Part 1.
Apply composition law.
overlay: {"type":"tint","opacity":0.06} to {"type":"tint","opacity":0.10}
titleFont: "Dancing Script"
titleItalic: false
titleSize: 74-92
titleYPercent: 44-54
titleColor: "#ffffff"
titleWidthFill: false
ornament: true
showDivider: true
dividerStyle: "diamond"
authorYPercent: 90-93
` : `
Generate 4 MORE distinct cover styles for this book. Be creative and varied — try unexpected approaches:
Consider: typographic minimalism, split-panel layouts, abstract expressionist, vintage poster, graphic novel aesthetic, high-fashion editorial, painterly portrait, symbolic still life.
Each variant MUST have a unique styleName (e.g. "Typographic", "Vintage Poster", "Split Panel", "Abstract") and genuinely different imagePrompt and customLayout from any previous batch.
Apply all the same genre/font rules from Parts 1-2. Mix archetypes freely.
At least one variant should use titleWidthFill: true (if title is 1-3 words) with Abril Fatface.
At least one variant should use a light/clean aesthetic (solid-block overlay or very low tint).
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIELDS TO RETURN for each variant (all required):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- styleName: string (from variant style above)
- imagePrompt: string (compose per variant's imagePrompt rules)
- titleFont: string
- titleColor: hex or rgba
- authorColor: hex or rgba
- layout: "top" | "center" | "bottom"
- colorPalette: array of exactly 5 hex colors
- mood: one sentence describing the visual feeling
- customLayout: object with ALL fields:
  - overlay: one of: {"type":"tint","opacity":N} | {"type":"vignette","topOpacity":N,"bottomOpacity":N} | {"type":"solid-block","position":"top","heightRatio":N,"color":"#hex"} | {"type":"none"}
  - colorTint: null or "rgba(r,g,b,a)" string
  - titleFont: same as top-level titleFont
  - titleSize: 36-110
  - titleColor: same as top-level titleColor
  - titleAlign: "left" | "center" | "right"
  - titleTransform: "none" | "uppercase"
  - titleYPercent: 10-88
  - titleItalic: boolean
  - titleRotation: 0
  - titleWidthFill: boolean (true ONLY for 1-3 word titles in Bold variant)
  - authorFont: font name
  - authorSize: 12-22
  - authorColor: same as top-level authorColor
  - authorAlign: "left" | "center" | "right"
  - authorYPercent: 87-96
  - showDivider: boolean
  - dividerStyle: "line" | "dots" | "diamond"
  - accentLines: boolean
  - accentLineColor: null or color string
  - accentBar: null
  - ornament: boolean
  - border: null
  - textBackdrop: null
  - noShadow: boolean (MUST be true for Literary Clean, false for others)

Return only valid JSON. No markdown, no code fences, no explanation.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.80,
    })

    const data = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json(data)
  } catch (error) {
    console.error('generate-concept error:', error)
    return NextResponse.json({ error: 'Failed to generate cover concept' }, { status: 500 })
  }
}
