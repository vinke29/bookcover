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

VARIANT 3 — AI-invented direction #1
Study this book's genre, mood, and description carefully. Invent a BOLD, UNEXPECTED cover aesthetic that would make this book stand out on a shelf next to conventional covers.
DO NOT choose Cinematic or Literary Clean — those are taken. Push into more surprising territory.
Draw from: constructivist geometric, liminal space photography, Art Deco, graphic novel aesthetic, high-fashion editorial, Japanese woodblock print, painterly portrait (face-forward), conceptual still life, brutalist minimalism, photographic collage, mid-century modern illustration.
Choose the single direction that best fits this specific book's emotional world.
Give it a creative, descriptive styleName that names the AESTHETIC (e.g. "Liminal Space", "Constructivist Geometric", "Art Deco", "High-Fashion Editorial").
Apply composition law. Apply all genre/font rules from Parts 1-2.
Choose overlay, fonts, sizing, and layout that authentically serve the chosen aesthetic.

VARIANT 4 — AI-invented direction #2
Invent a SECOND bold aesthetic, completely different from Variant 3 above.
DO NOT choose Cinematic or Literary Clean. DO NOT repeat Variant 3's direction.
Aim for contrast with Variant 3 — if Variant 3 was dark and dramatic, Variant 4 might be light and graphic, or vice versa.
Same creative pool: constructivist geometric, liminal space, Art Deco, graphic novel, high-fashion editorial, Japanese woodblock, painterly portrait, conceptual still life, brutalist minimalism, photographic collage, mid-century modern.
Give it a unique styleName. Apply composition law. Apply all genre/font rules.
Choose overlay, fonts, sizing, and layout that authentically serve the chosen aesthetic.
` : batchIndex === 1 ? `
VARIANT 1 — styleName: "Typographic Minimalism"
Pure typographic minimalism — the TYPE IS the design. Image is reduced to texture, giant text commands the cover.
imagePrompt: abstract textural background — muted, desaturated painterly washes of color OR close-up environmental texture that evokes the book's emotional world. The image exists as a canvas for typography, NOT as a scene. Apply genre color palette and mood from Part 1. No subjects, no figures, no environments — pure texture and atmosphere.
overlay: {"type":"tint","opacity":0.08} to {"type":"tint","opacity":0.14}
titleFont: "Bebas Neue" (Thriller/Crime/Action) OR "Montserrat" (others) OR "Abril Fatface" (Literary/Romance/Drama)
titleTransform: "uppercase"
titleAlign: "center"
titleSize: 96-110
titleYPercent: 36-52
titleWidthFill: true (ONLY if title is 1-3 words, otherwise false)
titleColor: "#ffffff"
authorFont: "Montserrat"
authorSize: 12-14
authorYPercent: 91-93
ornament: false
showDivider: false
accentLines: false

VARIANT 2 — AI-invented direction
Study this book's genre, mood, and description. Invent a bold, unexpected cover aesthetic — NOT Typographic Minimalism, NOT Cinematic, NOT Literary Clean, NOT Vintage Poster.
Draw from: constructivist geometric, liminal space photography, Art Deco, graphic novel aesthetic, high-fashion editorial, Japanese woodblock print, painterly portrait, conceptual still life, brutalist minimalism, photographic collage, mid-century modern illustration.
Choose what best fits this specific book. Give it a descriptive styleName (e.g. "Liminal Space", "Constructivist Geometric", "Art Deco").
Apply composition law. Apply genre/font rules from Parts 1-2. Choose layout that authentically serves the aesthetic.

VARIANT 3 — AI-invented direction #2
Invent a SECOND distinct aesthetic, different from Variant 2 above.
Aim for contrast — if Variant 2 was dark/dramatic, this might be light/graphic or vice versa.
Same pool: constructivist geometric, liminal space, Art Deco, graphic novel, high-fashion editorial, Japanese woodblock, painterly portrait, conceptual still life, brutalist minimalism, photographic collage, mid-century modern.
Give it a unique styleName. Apply composition law. Apply genre/font rules.

VARIANT 4 — styleName: "Vintage Poster"
Classic vintage poster aesthetic — warm, graphic, nostalgic. Top-heavy composition with clear banner area.
imagePrompt: vintage illustration style — flat graphic shapes, bold colors, period-appropriate imagery. Think WPA poster design, 1940s travel poster aesthetics, or mid-century pulp illustration. Apply genre subject from Part 1 in this poster style. Rich warm palette with deliberate color blocking.
overlay: vignette topOpacity 0.62-0.75, bottomOpacity 0.28-0.40
titleFont: "EB Garamond" or "Playfair Display"
titleTransform: "uppercase"
titleSize: 48-62
titleYPercent: 12-22
titleColor: "#f5e6c8"
showDivider: true
dividerStyle: "dots"
authorColor: "rgba(220,195,150,0.85)"
authorYPercent: 91-94
ornament: true
accentLines: false
` : `
Generate 4 genuinely UNEXPECTED wildcard cover styles for this book. These should feel radically different from anything seen before.
Push beyond conventional book covers — try: graphic novel panel layout, high-fashion editorial black & white, bold painterly portrait (face-forward if genre allows), conceptual still life as visual metaphor, moody liminal space photography aesthetic, constructivist geometric, Japanese woodblock influenced, stark brutalist, or any other bold artistic direction.
Each variant MUST have a unique styleName that describes the AESTHETIC (not the genre) and a genuinely distinct imagePrompt and customLayout.
Apply all the same genre/font rules from Parts 1-2. Mix archetypes freely.
At least one variant should use titleWidthFill: true (if title is 1-3 words) with Abril Fatface.
At least one variant should use a light/clean aesthetic (solid-block overlay or very low tint).
Make each one feel like a different creative director's bold vision for this exact book.
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
