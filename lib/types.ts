export interface BookInfo {
  title: string
  author: string
  genre: string
  blurb: string
  mood: string
}

export interface CoverConcept {
  imagePrompt: string
  titleFont: string
  titleColor: string
  authorColor: string
  layout: 'top' | 'center' | 'bottom'
  colorPalette: string[]
  mood: string
}

export interface TextStyle {
  fontFamily: string
  fontSize: number
  color: string
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
}
