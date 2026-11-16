import type { PlaceholderKey } from './placeholders'

/**
 * Event inspiration themes. These are proposed style directions, not confirmed
 * services or completed projects. Imagery is illustrative stock photography.
 */
export interface InspirationTheme {
  slug: string
  name: string
  tagline: string
  description: string
  palette: string[]
  image: PlaceholderKey
  secondaryImage?: PlaceholderKey
  suitedTo: string[]
}

export const INSPIRATION_THEMES: InspirationTheme[] = [
  {
    slug: 'classic-elegance',
    name: 'Classic Elegance',
    tagline: 'Timeless, refined, unhurried.',
    description: 'Crisp linens, tall candles, garden roses and soft candlelight. A look that photographs beautifully and never dates.',
    palette: ['#F6F1E8', '#E5C6B8', '#9B725E', '#3B0019'],
    image: 'inspClassic',
    secondaryImage: 'pfWedding5',
    suitedTo: ['Weddings', 'Anniversaries', 'Gala dinners'],
  },
  {
    slug: 'modern-minimalist',
    name: 'Modern Minimalist',
    tagline: 'Clean lines, considered details.',
    description: 'Restrained palettes, sculptural florals and plenty of breathing room. Every object earns its place.',
    palette: ['#FFFFFF', '#EFE7DA', '#292321', '#9B725E'],
    image: 'inspMinimal',
    secondaryImage: 'heroInspiration',
    suitedTo: ['Engagements', 'Corporate launches', 'Intimate dinners'],
  },
  {
    slug: 'pretty-in-pink',
    name: 'Pretty in Pink',
    tagline: 'Blush, peony and rose.',
    description: 'Layers of pink from blush to raspberry, with gold accents and playful floral installations.',
    palette: ['#F7EDE8', '#E5C6B8', '#D2A897', '#C9A96E'],
    image: 'inspPink',
    secondaryImage: 'introDetail',
    suitedTo: ['Bridal showers', 'Baby showers', 'Birthdays'],
  },
  {
    slug: 'black-and-gold',
    name: 'Black & Gold',
    tagline: 'Dramatic, glamorous, after dark.',
    description: 'Deep charcoal backdrops, warm gold metallics, candlelight and a stage-worthy sense of occasion.',
    palette: ['#1C1817', '#3B0019', '#C9A96E', '#ECE7C5'],
    image: 'inspBlackGold',
    secondaryImage: 'heroContact',
    suitedTo: ['Milestone birthdays', 'Award nights', 'End-of-year parties'],
  },
  {
    slug: 'boho-chic',
    name: 'Boho Chic',
    tagline: 'Relaxed textures, natural tones.',
    description: 'Pampas, rattan, draped fabric and loose, wild florals. Effortless and warm, indoors or out.',
    palette: ['#F6F1E8', '#D2A897', '#9B725E', '#7A5747'],
    image: 'inspBoho',
    secondaryImage: 'pfWedding2',
    suitedTo: ['Garden weddings', 'Bridal showers', 'Private celebrations'],
  },
  {
    slug: 'romantic-garden',
    name: 'Romantic Garden',
    tagline: 'In full bloom.',
    description: 'Abundant greenery, climbing florals and dappled light. Celebrations that feel grown rather than built.',
    palette: ['#F6F1E8', '#E5C6B8', '#6E7E5B', '#9B725E'],
    image: 'inspGarden',
    secondaryImage: 'pfWedding3',
    suitedTo: ['Weddings', 'Engagements', 'Daytime parties'],
  },
  {
    slug: 'luxury-neutral',
    name: 'Luxury Neutral',
    tagline: 'Quiet luxury in cream and taupe.',
    description: 'Tone-on-tone neutrals, textured fabrics and sculptural blooms. Understated, polished, expensive-looking.',
    palette: ['#FFFFFF', '#F6F1E8', '#E5C6B8', '#9B725E'],
    image: 'inspNeutral',
    secondaryImage: 'heroServices',
    suitedTo: ['Weddings', 'Corporate dinners', 'Engagements'],
  },
  {
    slug: 'vibrant-celebrations',
    name: 'Vibrant Celebrations',
    tagline: 'Colour, energy and joy.',
    description: 'Bold palettes, balloon installations, confetti moments and playful styling that invites everyone to join in.',
    palette: ['#F7EDE8', '#E9A6A6', '#F2C14E', '#3B0019'],
    image: 'inspVibrant',
    secondaryImage: 'pfBirthday3',
    suitedTo: ['Birthdays', 'Baby showers', 'Team celebrations'],
  },
]
