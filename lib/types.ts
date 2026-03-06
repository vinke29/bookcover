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
