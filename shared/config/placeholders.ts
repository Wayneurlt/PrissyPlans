/**
 * TEMPORARY VISUAL ASSETS
 * ----------------------------------------------------------------------------
 * Prissy Plans Events has not yet supplied event photography. Until it does, the
 * site uses curated stock photographs from Unsplash (served through its CDN).
 *
 * These are placeholders only. They are NEVER presented as completed Prissy Plans
 * Events projects: seeded sample projects are flagged `isSample` and carry a
 * visible "placeholder imagery" label on the public site.
 *
 * To replace an image: upload the real photograph through the admin dashboard
 * (portfolio / services / settings) or change the Unsplash photo id below and
 * re-run the seed. Hero and page-level imagery is keyed here so a single edit
 * swaps the asset everywhere it is used.
 */

export interface PlaceholderImage {
  /** Unsplash photo id (the part after `photo-` in the URL). */
  id: string
  alt: string
  /** Stable key used by seed data and page templates. */
  key: string
}

const u = (key: string, id: string, alt: string): PlaceholderImage => ({ key, id, alt })

export const PLACEHOLDER_IMAGES = {
  // Hero & page headers
  heroHome: u('heroHome', '1510076857177-7470076d4098', 'Draped event hall glowing with warm fairy lights'),
  heroAbout: u('heroAbout', '1525772764200-be829a350797', 'Tablescape with blush roses and tall candles'),
  heroServices: u('heroServices', '1519225421980-715cb0215aed', 'Long garden dining table styled for a celebration'),
  heroPortfolio: u('heroPortfolio', '1587271407850-8d438ca9fdf2', 'Grand stage styled in gold and florals'),
  heroInspiration: u('heroInspiration', '1522413452208-996ff3f3e740', 'Place settings along a greenery runner'),
  heroContact: u('heroContact', '1464047736614-af63643285bf', 'Soft bokeh of string lights at an evening event'),
  heroEnquire: u('heroEnquire', '1469371670807-013ccf25f16a', 'Outdoor ceremony aisle with floral arch and gold chairs'),

  // Introduction / about
  introPortrait: u('introPortrait', '1550005809-91ad75fb315f', 'Couple holding a neutral-toned bridal bouquet'),
  introDetail: u('introDetail', '1487530811176-3780de880c2d', 'Close-up of a rose and peony bouquet'),
  aboutStory: u('aboutStory', '1519741497674-611481863552', 'Bride holding a bouquet in soft evening light'),
  aboutPhilosophy: u('aboutPhilosophy', '1515934751635-c81c6bc9a2d8', 'Wedding rings nestled in blush flowers'),

  // Services
  serviceWeddings: u('serviceWeddings', '1469371670807-013ccf25f16a', 'Floral ceremony arch with rows of gold chairs'),
  serviceBirthdays: u('serviceBirthdays', '1464349153735-7db50ed83c84', 'Birthday cake with glowing candles'),
  serviceShowers: u('serviceShowers', '1530103862676-de8c9debad1d', 'Pastel balloons gathered for a celebration'),
  serviceCorporate: u('serviceCorporate', '1540575467063-178a50c2df87', 'Audience seated at a corporate event'),
  servicePlanning: u('servicePlanning', '1519225421980-715cb0215aed', 'Long table set for an outdoor celebration'),
  serviceDecoration: u('serviceDecoration', '1525772764200-be829a350797', 'Roses and candlelight on a styled table'),
  serviceCoordination: u('serviceCoordination', '1511795409834-ef04bbd61622', 'Dinner table with florals ready for guests'),
  serviceEngagements: u('serviceEngagements', '1465495976277-4387d4b0b4c6', 'Couple holding hands with engagement rings and bouquet'),
  servicePrivate: u('servicePrivate', '1515169067868-5387ec356754', 'Guests talking at a candlelit dinner party'),

  // Portfolio sample projects
  pfWedding1: u('pfWedding1', '1583939003579-730e3918a45a', 'Newlyweds celebrating with their bridal party'),
  pfWedding2: u('pfWedding2', '1522673607200-164d1b6ce486', 'Two styled chairs on a lawn with florals'),
  pfWedding3: u('pfWedding3', '1523438885200-e635ba2c371e', 'Garden gazebo dressed with flowers'),
  pfWedding4: u('pfWedding4', '1606216794074-735e91aa2c92', 'Couple walking together on their wedding day'),
  pfWedding5: u('pfWedding5', '1519167758481-83f550bb49b3', 'Ballroom reception with chandeliers'),
  pfWedding6: u('pfWedding6', '1591604466107-ec97de577aff', 'Couple portrait by the water'),
  pfEngagement1: u('pfEngagement1', '1606800052052-a08af7148866', 'Gold wedding rings on soft fabric'),
  pfEngagement2: u('pfEngagement2', '1527525443983-6e60c75fff46', 'Couple holding hands over a tree trunk'),
  pfBirthday1: u('pfBirthday1', '1558636508-e0db3814bd1d', 'Happy birthday lettering with decorations'),
  pfBirthday2: u('pfBirthday2', '1602631985686-1bb0e6a8696e', 'Outdoor birthday party with bunting'),
  pfBirthday3: u('pfBirthday3', '1513151233558-d860c5398176', 'Confetti falling against a teal backdrop'),
  pfBaby1: u('pfBaby1', '1543342384-1f1350e27861', 'Parents cradling a newborn'),
  pfBaby2: u('pfBaby2', '1530103862676-de8c9debad1d', 'Pastel balloons for a shower'),
  pfCorporate1: u('pfCorporate1', '1540575467063-178a50c2df87', 'Guests seated at a conference'),
  pfCorporate2: u('pfCorporate2', '1511578314322-379afb476865', 'Rows of seating at a corporate venue'),
  pfCorporate3: u('pfCorporate3', '1475721027785-f74eccf877e2', 'Microphone on stage at an event'),
  pfPrivate1: u('pfPrivate1', '1527529482837-4698179dc6ce', 'Friends raising glasses at a party'),
  pfPrivate2: u('pfPrivate2', '1519671482749-fd09be7ccebf', 'Guests toasting at a dinner party'),
  pfPrivate3: u('pfPrivate3', '1464366400600-7168b8af9bc3', 'Rustic reception hall with set tables'),

  // Inspiration themes
  inspClassic: u('inspClassic', '1525772764200-be829a350797', 'Roses and candles on a classic table'),
  inspMinimal: u('inspMinimal', '1522673607200-164d1b6ce486', 'Minimal ceremony chairs on a lawn'),
  inspPink: u('inspPink', '1508808703020-ef18109db02f', 'Pink and white blooms'),
  inspBlackGold: u('inspBlackGold', '1587271407850-8d438ca9fdf2', 'Gold stage styling with warm lighting'),
  inspBoho: u('inspBoho', '1529636798458-92182e662485', 'Bouquet with a draped boho arch'),
  inspGarden: u('inspGarden', '1523438885200-e635ba2c371e', 'Romantic garden gazebo in bloom'),
  inspNeutral: u('inspNeutral', '1550005809-91ad75fb315f', 'Neutral tones with a soft bouquet'),
  inspVibrant: u('inspVibrant', '1530103862676-de8c9debad1d', 'Colourful balloons for a lively celebration'),

  // Misc
  ctaFinal: u('ctaFinal', '1510076857177-7470076d4098', 'Warmly lit event hall'),
  process: u('process', '1507504031003-b417219a0fde', 'Mr & Mrs signage in a garden'),
} as const satisfies Record<string, PlaceholderImage>

export type PlaceholderKey = keyof typeof PLACEHOLDER_IMAGES

export const UNSPLASH_BASE = 'https://images.unsplash.com/photo-'

/** Full CDN URL used when a raw URL is needed (seeds, Open Graph, email). */
export function placeholderUrl(img: PlaceholderImage, width = 1600) {
  return `${UNSPLASH_BASE}${img.id}?auto=format&fit=crop&w=${width}&q=80`
}

/** `src` to pass to `<NuxtImg provider="unsplash">`. */
export function placeholderSrc(img: PlaceholderImage) {
  return `/photo-${img.id}`
}
