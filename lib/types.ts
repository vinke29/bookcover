export interface BookInfo {
  title: string
  subtitle: string
  author: string
  genre: string
  blurb: string
  mood: string
}

export interface CoverConcept {
  styleName?: string
  imagePrompt: string
  titleFont: string
  titleColor: string
  authorColor: string
  layout: 'top' | 'center' | 'bottom'
  colorPalette: string[]
  mood: string
  customLayout?: CustomLayout
}

export interface GeneratedVariant {
  concept: CoverConcept | null
  imageUrl: string | null
  cdnUrl: string | null
  isLoading: boolean
  error: string | null
}

/**
 * AI-designed layout returned by the concept API.
 * All positions are percentages (0–100) of canvas height/width.
 */
export interface CustomLayout {
  overlay: OverlayStyle
  colorTint: string | null          // e.g. "rgba(130,80,20,0.28)" or null
  titleFont: string
  titleSize: number                  // px, 36–120
  titleColor: string
  titleAlign: 'left' | 'center' | 'right'
  titleTransform: 'none' | 'uppercase'
  titleYPercent: number              // 0–100, vertical center of title block
  titleItalic: boolean
  titleRotation: number        // degrees
  titleWidthFill: boolean      // auto-size each word to fill canvas width
  authorFont: string
  authorSize: number                 // px, 11–24
  authorColor: string
  authorAlign: 'left' | 'center' | 'right'
  authorYPercent: number             // 0–100
  showDivider: boolean
  dividerStyle: 'line' | 'dots' | 'diamond'
  accentLines: boolean
  accentLineColor: string | null
  accentBar: { color: string; height: number } | null
  ornament: boolean
  border: { padding: number; color: string; lineWidth: number } | null
  textBackdrop: { opacity: number; padding: number } | null
  noShadow: boolean
}

export interface TextStyle {
  fontFamily: string
  fontSize: number
  color: string
  strokeWidth?: number
  strokeColor?: string
  italic?: boolean
  fontWeight?: 'normal' | 'bold'
  lineHeight?: number      // multiplier, default 1.2
  letterSpacing?: number  // extra px between chars, default 0
  rotation?: number        // degrees, positive = clockwise
  widthFill?: boolean      // auto-size each word to fill canvas width
}

export interface Position {
  x: number
  y: number
}

export type OverlayStyle =
  | { type: 'vignette'; topOpacity: number; bottomOpacity: number }
  | { type: 'tint'; opacity: number }
  | { type: 'band'; bandRatio: number; opacity: number }
  | { type: 'solid-block'; position: 'top' | 'bottom'; heightRatio: number; color: string }
  | { type: 'none' }

export interface Template {
  id: string
  name: string
  titleStyle: TextStyle
  authorStyle: TextStyle
  titlePos: Position
  authorPos: Position
  /** How the x coordinate is interpreted for text drawing */
  titleAlign: 'left' | 'center' | 'right'
  authorAlign: 'left' | 'center' | 'right'
  /** Apply toUpperCase() to title before drawing */
  titleTransform: 'none' | 'uppercase'
  overlayStyle: OverlayStyle
  /** Optional RGBA color tint applied over the image before the overlay */
  colorTint?: string
  /** Inset rectangular border frame drawn over everything */
  border?: { padding: number; color: string; lineWidth: number }
  showDivider: boolean
  dividerStyle: 'line' | 'dots' | 'diamond'
  accentLines: boolean
  accentLineColor?: string
  /** Colored bar drawn just below the title block */
  accentBar?: { color: string; height: number }
  /** Small ornamental glyph drawn above the title */
  ornament?: boolean
  /** Skip text shadow (for templates with light backgrounds) */
  noShadow?: boolean
  /** Semi-transparent full-width band drawn behind the title block */
  textBackdrop?: { opacity: number; padding: number }
}
