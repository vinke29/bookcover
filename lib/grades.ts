export interface ColorGrade {
  id: string
  name: string
  /** CSS filter string applied to ctx when drawing the background image */
  filter: string
  /** Optional tinted overlay drawn after the image using a blend mode */
  tint?: { color: string; opacity: number; mode: GlobalCompositeOperation }
  /** Representative color shown in the picker swatch */
  swatch: string
}

export const COLOR_GRADES: ColorGrade[] = [
  {
    id: 'none',
    name: 'None',
    filter: 'none',
    swatch: '#52525b',
  },
  {
    id: 'warm',
    name: 'Warm',
    filter: 'brightness(1.05) saturate(1.15)',
    tint: { color: '#c8601a', opacity: 0.14, mode: 'multiply' },
    swatch: '#f97316',
  },
  {
    id: 'cool',
    name: 'Cool',
    filter: 'brightness(0.96) saturate(0.88)',
    tint: { color: '#1a4fc8', opacity: 0.16, mode: 'multiply' },
    swatch: '#3b82f6',
  },
  {
    id: 'fade',
    name: 'Fade',
    filter: 'brightness(1.1) contrast(0.80) saturate(0.70)',
    swatch: '#d4d4d8',
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    filter: 'contrast(1.40) saturate(1.25) brightness(0.86)',
    swatch: '#18181b',
  },
  {
    id: 'golden',
    name: 'Golden',
    filter: 'brightness(1.08) saturate(1.35)',
    tint: { color: '#c8940a', opacity: 0.20, mode: 'multiply' },
    swatch: '#eab308',
  },
  {
    id: 'noir',
    name: 'Noir',
    filter: 'saturate(0) contrast(1.45) brightness(0.88)',
    swatch: '#404040',
  },
  {
    id: 'muted',
    name: 'Muted',
    filter: 'saturate(0.42) contrast(0.88) brightness(1.07)',
    swatch: '#8b8b9a',
  },
]
