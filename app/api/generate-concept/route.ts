import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const bookInfo = await req.json()

    const prompt = `You are an award-winning book cover art director. Design the complete visual concept for this book.

Book:
Title: ${bookInfo.title}
Author: ${bookInfo.author || 'Unknown'}
Genre: ${bookInfo.genre}
Mood: ${bookInfo.mood || 'not specified'}
Description: ${bookInfo.blurb || 'not provided'}

Return a single flat JSON object (no nesting, no section wrappers) with ALL fields listed at the end.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — imagePrompt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write a rich, specific image generation prompt. Structure it as:
[DETAILED SCENE DESCRIPTION] + [GENRE ART STYLE] + [MOOD MODIFIER] + [COMPOSITION RULE] + [QUALITY SUFFIX]

━━ COMPOSITION LAW (applies to every genre) ━━
Subject and primary visual interest MUST occupy the LOWER 55–65% of the frame.
The UPPER 35–45% must be atmospheric negative space (open sky, mist, fog, darkness, clouds, light) — this space is reserved for the book title.
Use 3–5 depth layers: far atmospheric background → mid-distance environment → primary subject → optional foreground framing.
Always include: "subject in lower two-thirds of frame, open atmospheric space in upper third, no text, no letters, no typography"

━━ GENRE ART STYLE — use EXACTLY the style for the genre ━━

FANTASY (epic, high fantasy, cozy fantasy, unicorns, magic, fae, mythical creatures):
"lush painterly fantasy illustration, luminous digital oil painting with masterful chiaroscuro, volumetric god rays piercing through ancient trees or clouds, rich jewel-toned palette of deep sapphire and forest emerald and burnished gold, magical particles of light and floating dust in air, intricate environmental detail with visible painterly brushwork, soft atmospheric bokeh depth in background, cinematic concept art quality inspired by Alan Lee watercolor technique and Craig Mullins painterly precision"
Color note: warm golden or amber light as primary light source, cool moonlight or magical glow as fill.

COZY MYSTERY (cottage, village, amateur sleuth, tea, cats, libraries, quaint settings):
"charming illustrated book cover art, warm watercolor and gouache texture with confident flat color fills, palette of honey amber and dusty sage and cream and rose, Coralie Bickford-Smith decorative Penguin Clothbound style meets Nordic editorial illustration, soft warm candlelight glow through cottage windows or afternoon golden-hour light through leaves, cozy inviting domestic atmosphere with illustrated objects arranged with care, no harsh shadows or darkness, illustrated storybook quality"
CRITICAL: This must look like a cozy illustrated storybook, never like a thriller or epic fantasy. No darkness. No drama. Just warmth.

THRILLER / PSYCHOLOGICAL THRILLER:
"dark cinematic digital painting, stark chiaroscuro with deep blacks and single source of harsh directional light, palette almost fully desaturated with ONE vivid accent color — either deep arterial crimson OR electric amber — against grey-black environment, eerie threatening stillness, environmental storytelling: empty rooms, abandoned spaces, single ominous object, reflective wet surfaces, atmospheric dread. NO human figures — only environments, shadows, and objects"
Color note: 90% desaturated, 10% vivid accent.

CRIME / NOIR:
"film noir digital painting, rain-slicked urban nightscape with neon reflections pooling in puddles, Edward Hopper isolation and light quality meets J.C. Leyendecker technique, palette of coal black and steel grey with one neon accent (cobalt blue or acid yellow), harsh geometry of city architecture casting dramatic shadows, single artificial light source in far distance, atmospheric haze"

ROMANCE (contemporary, sweet, clean, beach read, small-town, second chance):
"warm editorial illustration with soft golden-hour painterly quality, peach and amber and blush tones, soft cinematic bokeh in background, intimate and inviting composition, stylized illustrated characters or romantic environment — NOT photorealistic — painterly impressionist style with warm glowing light, Penguin Random House editorial romance art direction"

DARK ROMANCE / ROMANTASY (fae, magic courts, possessive love interests, high-stakes):
"dark romantic fantasy illustration in the tradition of Charlie Bowater, moody chiaroscuro with deep jewel tones — blood burgundy, midnight sapphire, molten gold rim-light — dramatic interplay between magical fire or moonlight against deep shadow, intricate environmental detail, brooding and electrically charged atmosphere, lush and dangerous"

LITERARY FICTION (upmarket, book club, literary):
"fine art conceptual illustration, muted sophisticated palette of dusty sage and worn linen and faded denim and charcoal, Edward Hopper quality of light and loneliness, single powerful visual metaphor that suggests the book without depicting it literally, thoughtful spare composition with emotional weight, oil painting surface texture, Booker Prize and FSG cover aesthetic. USE: evocative objects, empty spaces, silhouettes, symbolic imagery, beautiful environments. NO faces."

HISTORICAL FICTION (any era, period):
"classical oil painting with rich impasto texture and visible brushwork, Pre-Raphaelite richness of color and detail in the tradition of William Waterhouse and John Singer Sargent, warm period palette of aged gold and deep crimson and forest green and walnut brown, exquisite period-appropriate detail in costume or architecture, soft natural window light or warm golden-hour, intimate human-scale composition"

SCI-FI SPACE OPERA / EPIC / MILITARY:
"cinematic science fiction concept art in the tradition of John Harris atmospheric matte painting, awe-inspiring cosmic or planetary scale, tiny human or ship element against vast alien environment, dramatic volumetric atmosphere lighting with blue-violet-warm-orange temperature split, alien grandeur and epic scope, sense of deep space vastness"

SCI-FI CYBERPUNK / DYSTOPIAN / NEAR-FUTURE:
"cyberpunk digital painting with Blade Runner 2049 color grading, rain-soaked neon-lit urban environment, orange and teal temperature split, holographic light elements bleeding through haze, gritty textured surfaces with luminous highlights, atmospheric city depth with layers of environmental detail"

HORROR (psychological, gothic, supernatural, atmospheric):
"atmospheric horror digital painting, palette of ash grey and bone white and deep black with one wrong-colored accent — acid green or bile yellow or dried-blood crimson — psychological dread achieved through environmental distortion and uncanny stillness, wrong proportions that feel almost normal, liminal space quality, Zdzisław Beksiński expressionist technique meets James Jean painterly elegance. NO gore. USE: environments, architecture, shadows, twisted nature, symbolic wrongness."

YA (young adult fantasy, contemporary YA, YA romance):
"young adult book cover illustration, vibrant dynamic palette, bold dramatic backlighting creating rim-light halo around subject, stylized expressive illustrated characters or magical environment, Charlie Bowater and Laia López painterly style, intricate detail that rewards close inspection, energy and emotional intensity"

ADVENTURE (action, exploration, historical adventure, pirate, jungle):
"classic adventure illustration in the golden age tradition of N.C. Wyeth and Howard Pyle, dynamic heroic composition frozen at a decisive moment, warm saturated golden-hour light with deep atmospheric shadow, rich earth tones against vivid sky, sweeping landscape scale that makes subject feel heroic"

━━ MOOD MODIFIER — append to the art style ━━
Genre art style ALWAYS comes first. Mood is a modifier applied WITHIN the genre style:

Whimsical & Magical: "soft magical glow emanating from within scene, floating luminous particles and fireflies, pastel warmth, enchanted storybook feeling, gentle sparkle accents"
Romantic & Soft: "golden-hour impressionist softness, dreamy bokeh hazing background, warmth and longing, gentle diffuse light, intimate scale"
Epic & Grand: "dramatic sweeping wide composition, volumetric god rays breaking through clouds, heroic scale and grandeur, majestic cinematic atmosphere" — NOTE: for Cozy Mystery this means a grandly composed warm illustrated scene, NOT a dark or epic fantasy scene
Dark & Gritty: "heavily desaturated and grain-textured, oppressive shadows, rough weathered surfaces, film noir darkness"
Mysterious & Suspenseful: "deep atmospheric fog and mist layering, partial concealment of subject, ominous depth receding into darkness, tension of hidden information"
Heartwarming & Uplifting: "warm golden light flooding the scene, bright open sky, optimistic color temperature, inviting and cheerful"
Melancholic & Reflective: "muted overcast light quality, long afternoon shadows, autumn warmth draining to cool, quiet contemplative sadness"
Tense & Urgent: "harsh artificial lighting, strong compositional diagonals creating instability, compressed claustrophobic framing"
Playful & Fun: "bright saturated cheerful color palette, flat editorial illustration fun, charming whimsical details everywhere"
Eerie & Unsettling: "uncanny wrong lighting coming from no clear source, liminal space atmosphere, psychological unease from near-normal-but-wrong composition"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — titleFont
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Select from EXACTLY this list: Abril Fatface, Dancing Script, Pacifico, Playfair Display, EB Garamond, Cinzel, Lora, Bebas Neue, Oswald, Montserrat, Raleway, Georgia, Impact, Courier New

STRICT GENRE FONT RULES — violations ruin the cover:

Bebas Neue → ONLY: Thriller, Crime, Action-Adventure. FORBIDDEN for Fantasy, Cozy, Romance, Literary, Historical, YA, Horror.
Oswald → ONLY: Thriller, Crime, Contemporary Fiction, Cyberpunk Sci-Fi. FORBIDDEN for Fantasy, Cozy, Romance, Literary, Historical.

Fantasy (epic): Cinzel (1st choice), EB Garamond, Playfair Display
Fantasy (cozy/whimsical): Playfair Display italic, EB Garamond, Dancing Script
Cozy Mystery: EB Garamond (1st choice), Lora, Playfair Display, Dancing Script (whimsical variant)
Romance (contemporary/warm): Dancing Script (1st choice), Lora, Playfair Display
Dark Romance / Romantasy: Cinzel (1st choice), Playfair Display, EB Garamond
Literary Fiction: Playfair Display (1st choice), EB Garamond, Georgia, Lora
Historical Fiction: EB Garamond (1st choice), Cinzel, Playfair Display
Sci-Fi (space opera): Cinzel, Raleway, Montserrat
Sci-Fi (cyberpunk): Raleway, Montserrat, Oswald
Horror (literary/psychological): Playfair Display, Georgia, EB Garamond
Horror (pulp): Oswald
YA Fantasy: Cinzel, Raleway, Dancing Script
YA Contemporary: Abril Fatface, Dancing Script, Pacifico, Raleway
Adventure: Abril Fatface, Bebas Neue, Oswald
Bold graphic stacked (titleWidthFill: true): Abril Fatface (1st choice), Bebas Neue (thriller only)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — Layout Design Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design the customLayout based on which of these 5 overlay archetypes fits the book:

ARCHETYPE 1 — IMAGE-HERO (romance, YA, cozy mystery, women's fiction, contemporary):
The artwork IS the cover. Overlay opacity 0.00–0.12 (or "none"). The illustration fills the frame gloriously, text is a stylish guest.
titleFont: script or elegant serif per genre rules above. titleSize 70–90px. titleItalic: true for script/serif. titleYPercent 42–58. textBackdrop: null.
titleColor MUST be "#ffffff". authorColor "rgba(255,255,255,0.80)".

ARCHETYPE 2 — TEXT-HERO (literary fiction, upmarket fiction, book club):
Heavy overlay recedes the image to a texture backdrop. overlay opacity 0.45–0.62.
titleFont: Playfair Display or EB Garamond. titleSize 84–108px. titleWidthFill: false. titleYPercent 44–52.
titleColor MUST be "#ffffff". authorColor "rgba(255,255,255,0.78)".

ARCHETYPE 3 — BOLD STACKED (commercial fiction, beach reads, simple 1–3 word titles):
titleWidthFill: true — each word auto-sizes to fill the full canvas width, stacked.
ONLY use titleWidthFill: true when title has 1–3 words. 4+ words → use ARCHETYPE 1 or 2 instead.
titleFont: Abril Fatface. overlay 0.05–0.20. titleYPercent: 45–60 (NEVER below 45 with widthFill).
titleColor MUST be "#ffffff".

ARCHETYPE 4 — DARK GENRE (thriller, crime, horror, dark fantasy):
Heavy vignette, topOpacity 0.65–0.78, bottomOpacity 0.75–0.88.
Oswald or Bebas Neue 74–95px UPPERCASE at titleYPercent 16–26.
Possible accentBar in red or amber.
titleColor MUST be "#ffffff".

ARCHETYPE 5 — PRESTIGE GENRE (fantasy epic, historical, romantasy, literary sci-fi):
Moderate vignette, bottomOpacity 0.60–0.80. Cinzel or EB Garamond 58–80px.
ornament: true usually. Possible border (historical). titleYPercent 16–26.
titleColor MUST be "#ffffff".

GLOBAL COLOR LAW — applies to EVERY genre and archetype:
titleColor MUST be "#ffffff" except for solid-block layouts where text sits on a light panel.
NEVER use: teal, blue, gold, rose, sage, slate, or any colored text over an illustration.
White text is the only color that survives over any artwork. This is non-negotiable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIELDS TO RETURN (ALL required in flat JSON):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- imagePrompt: string (compose using Part 1 rules — rich scene + genre style + mood modifier + composition law)
- titleFont: string (from Part 2 rules)
- titleColor: hex (follow Global Color Law above — almost always "#ffffff")
- authorColor: hex or rgba string
- layout: "top" | "center" | "bottom"
- colorPalette: array of exactly 5 hex colors for the cover mood
- mood: one sentence describing the visual feeling
- customLayout: object with ALL fields below (design per Part 3 archetypes):
  - overlay: one of: {"type":"tint","opacity":0.06} | {"type":"tint","opacity":0.52} | {"type":"vignette","topOpacity":0.65,"bottomOpacity":0.88} | {"type":"band","bandRatio":0.40,"opacity":0.94} | {"type":"solid-block","position":"bottom","heightRatio":0.32,"color":"#f0ede5"} | {"type":"none"}
  - colorTint: null or "rgba(r,g,b,a)" string (use for historical sepia, horror cold tint, etc.)
  - titleFont: font name (same as top-level titleFont)
  - titleSize: 36–110px (provide even when titleWidthFill is true)
  - titleColor: "#ffffff" (almost always — see Global Color Law)
  - titleAlign: "left" | "center" | "right"
  - titleTransform: "none" | "uppercase"
  - titleYPercent: 10–88
  - titleItalic: boolean
  - titleRotation: -8 to 8 degrees (small rotation adds personality for romance/cozy/YA; 0 for thriller/literary)
  - titleWidthFill: boolean (true ONLY for 1–3 word titles in ARCHETYPE 3)
  - authorFont: font name
  - authorSize: 12–22
  - authorColor: hex or rgba
  - authorAlign: "left" | "center" | "right"
  - authorYPercent: 87–96
  - showDivider: boolean
  - dividerStyle: "line" | "dots" | "diamond"
  - accentLines: boolean
  - accentLineColor: null or color string
  - accentBar: null or {"color":"#hex","height":3}
  - ornament: boolean (true for Fantasy, Romantasy, Historical, Romance when elegant)
  - border: null or {"padding":14,"color":"rgba(245,230,200,0.45)","lineWidth":1}
  - textBackdrop: null or {"opacity":0.5,"padding":16}
  - noShadow: boolean (ONLY true for solid-block with dark text on light background)

Return only valid JSON. No markdown, no code fences, no explanation.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.75,
    })

    const data = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json(data)
  } catch (error) {
    console.error('generate-concept error:', error)
    return NextResponse.json({ error: 'Failed to generate cover concept' }, { status: 500 })
  }
}
