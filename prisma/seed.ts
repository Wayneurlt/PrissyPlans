/**
 * Seed: event categories, service categories, services, website settings and
 * clearly-labelled sample portfolio projects using placeholder imagery.
 *
 * It never creates fake enquiries, fake testimonials or admin users.
 * Admin users are created with `npm run admin:create`.
 *
 * Safe to re-run: records are upserted by slug/key. Existing admin edits to
 * service text are preserved (only missing records are created).
 */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client'
import { SETTING_DEFINITIONS } from '../shared/config/settings'
import { PLACEHOLDER_IMAGES, placeholderUrl, type PlaceholderImage } from '../shared/config/placeholders'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const SAMPLE_NOTE = 'Illustrative sample using temporary stock imagery to preview the portfolio layout. This is not a Prissy Plans Events project and will be replaced with real event photography.'

async function media(img: PlaceholderImage) {
  const publicId = `placeholder:${img.key}`
  return prisma.mediaAsset.upsert({
    where: { publicId },
    create: {
      provider: 'EXTERNAL',
      kind: 'IMAGE',
      publicId,
      url: placeholderUrl(img),
      altText: img.alt,
      folder: 'placeholders',
      isPlaceholder: true,
    },
    update: { url: placeholderUrl(img), altText: img.alt },
  })
}

async function seedEventCategories() {
  const categories = [
    { name: 'Weddings', slug: 'weddings', description: 'Ceremonies, receptions and everything in between.' },
    { name: 'Engagements', slug: 'engagements', description: 'Proposals, engagement parties and ruracio celebrations.' },
    { name: 'Birthdays', slug: 'birthdays', description: 'Milestone and intimate birthday celebrations.' },
    { name: 'Baby Showers', slug: 'baby-showers', description: 'Gentle, joyful celebrations for growing families.' },
    { name: 'Bridal Showers', slug: 'bridal-showers', description: 'Pre-wedding celebrations styled for the bride-to-be.' },
    { name: 'Corporate Events', slug: 'corporate-events', description: 'Launches, dinners, conferences and team celebrations.' },
    { name: 'Private Celebrations', slug: 'private-celebrations', description: 'Dinners, anniversaries, graduations and private parties.' },
  ]
  const map = new Map<string, string>()
  for (const [i, c] of categories.entries()) {
    const row = await prisma.eventCategory.upsert({
      where: { slug: c.slug },
      create: { ...c, sortOrder: i },
      update: { sortOrder: i },
    })
    map.set(c.slug, row.id)
  }
  return map
}

async function seedServiceCategories() {
  const categories = [
    { name: 'Celebrations', slug: 'celebrations', description: 'Weddings, birthdays, showers and private occasions.' },
    { name: 'Corporate', slug: 'corporate', description: 'Business events, launches and team experiences.' },
    { name: 'Core Services', slug: 'core-services', description: 'Planning, styling and coordination for any event.' },
  ]
  const map = new Map<string, string>()
  for (const [i, c] of categories.entries()) {
    const row = await prisma.serviceCategory.upsert({
      where: { slug: c.slug },
      create: { ...c, sortOrder: i },
      update: { sortOrder: i },
    })
    map.set(c.slug, row.id)
  }
  return map
}

async function seedServices(categoryIds: Map<string, string>) {
  const services = [
    {
      slug: 'weddings-engagements',
      name: 'Weddings & Engagements',
      tagline: 'From the first yes to the last dance.',
      summary: 'Full planning, decoration and coordination for weddings, engagement parties and traditional celebrations.',
      description: 'Your wedding should feel like you. We begin with your story, your culture and the atmosphere you want your guests to remember, then design a celebration that holds all of it beautifully.\n\nFrom venue sourcing and supplier management to ceremony styling, reception décor and on-the-day coordination, we take care of every detail so you can be fully present for the moments that matter.',
      includes: ['Concept, mood boards and colour direction', 'Venue sourcing and supplier coordination', 'Ceremony and reception styling', 'Floral, lighting and tablescape design', 'Timeline planning and guest logistics', 'On-the-day coordination'],
      suitableFor: ['Couples planning a wedding or engagement', 'Traditional and ruracio celebrations', 'Intimate ceremonies and grand receptions', 'Destination and garden weddings'],
      category: 'celebrations',
      image: PLACEHOLDER_IMAGES.serviceWeddings,
      featured: true,
    },
    {
      slug: 'birthdays-private-celebrations',
      name: 'Birthdays & Private Celebrations',
      tagline: 'Milestones deserve a moment.',
      summary: 'Styled birthday parties, anniversaries, graduations and private dinners with personality and polish.',
      description: 'Whether it is a milestone birthday, a surprise dinner or an anniversary with the people you love most, we design celebrations that feel personal and look effortless.\n\nWe shape the theme, style the space, arrange entertainment and catering partners, and coordinate the day so you can simply enjoy it.',
      includes: ['Theme and styling concept', 'Venue and supplier sourcing', 'Décor, balloons, florals and table styling', 'Cake, catering and entertainment coordination', 'Guest list and invitation support', 'Event-day coordination'],
      suitableFor: ['Milestone birthdays', 'Anniversaries and graduations', 'Surprise parties and private dinners', 'Family gatherings'],
      category: 'celebrations',
      image: PLACEHOLDER_IMAGES.serviceBirthdays,
      featured: true,
    },
    {
      slug: 'baby-bridal-showers',
      name: 'Baby & Bridal Showers',
      tagline: 'Soft, joyful and thoughtfully styled.',
      summary: 'Beautifully styled showers that celebrate new chapters, from intimate brunches to full-scale parties.',
      description: 'Showers are about anticipation and love. We create warm, photogenic settings with styled backdrops, tablescapes, games and favours, tailored to the guest of honour.\n\nWe handle the planning details and styling so the host can relax and celebrate with everyone else.',
      includes: ['Theme, palette and styling concept', 'Backdrops, balloons and floral styling', 'Dessert and grazing table design', 'Games, favours and keepsake details', 'Venue and catering coordination', 'Set-up and pack-down'],
      suitableFor: ['Baby showers and gender reveals', 'Bridal showers and hen celebrations', 'Intimate brunches and garden parties'],
      category: 'celebrations',
      image: PLACEHOLDER_IMAGES.serviceShowers,
      featured: true,
    },
    {
      slug: 'corporate-events',
      name: 'Corporate Events',
      tagline: 'Professional, polished, on brand.',
      summary: 'Launches, galas, conferences, team days and end-of-year parties, planned with precision and styled with care.',
      description: 'Corporate events carry your brand into the room. We plan and style experiences that are organised, on message and genuinely enjoyable for your guests.\n\nFrom venue and AV coordination to branded décor, run-of-show management and guest experience, we make sure every element reflects your organisation well.',
      includes: ['Event concept and brand-aligned styling', 'Venue, catering and AV coordination', 'Run-of-show and programme management', 'Stage, registration and branded décor', 'Guest management and logistics', 'On-site coordination team'],
      suitableFor: ['Product launches and brand activations', 'Gala dinners and award nights', 'Conferences, retreats and team-building days', 'End-of-year and appreciation events'],
      category: 'corporate',
      image: PLACEHOLDER_IMAGES.serviceCorporate,
      featured: true,
    },
    {
      slug: 'event-planning',
      name: 'Event Planning',
      tagline: 'Structure behind the magic.',
      summary: 'End-to-end planning that turns your idea into a clear concept, timeline, budget and supplier plan.',
      description: 'Great events are planned long before the day. We work with you to define the vision, set a realistic budget, source trusted suppliers and build a timeline that keeps everything on track.\n\nYou get a single point of contact, regular updates and the confidence that nothing has been missed.',
      includes: ['Vision and concept development', 'Budget planning and tracking', 'Venue sourcing and site visits', 'Supplier sourcing, briefing and contracts', 'Master timeline and checklists', 'Regular planning meetings'],
      suitableFor: ['Anyone planning an event from scratch', 'Busy hosts who need an organised partner', 'Events with multiple suppliers and moving parts'],
      category: 'core-services',
      image: PLACEHOLDER_IMAGES.servicePlanning,
      featured: true,
    },
    {
      slug: 'event-decoration-styling',
      name: 'Event Decoration & Styling',
      tagline: 'Spaces that tell your story.',
      summary: 'Creative direction and décor that transform any venue, from florals and tablescapes to lighting and backdrops.',
      description: 'Styling is where an event becomes an experience. We design the look and feel of your celebration and bring it to life with florals, fabrics, lighting, furniture and finishing details.\n\nEvery element is chosen to work together, so the space feels cohesive, elegant and unmistakably yours.',
      includes: ['Mood boards and design concept', 'Floral design and installations', 'Tablescapes, linen and place settings', 'Backdrops, draping and lighting', 'Furniture and prop hire coordination', 'Set-up and styling on the day'],
      suitableFor: ['Clients who have a venue and need the look', 'Weddings, showers, birthdays and corporate dinners', 'Themed and colour-led celebrations'],
      category: 'core-services',
      image: PLACEHOLDER_IMAGES.serviceDecoration,
      featured: true,
    },
    {
      slug: 'event-coordination',
      name: 'Event Coordination',
      tagline: 'Calm on the day, every time.',
      summary: 'On-the-day and month-of coordination that manages suppliers, timings and guests so you can be present.',
      description: 'You have planned the details; we make sure they happen. Our coordination service takes over in the weeks before your event, confirms every supplier and runs the day from first arrival to final farewell.\n\nIf anything shifts, we handle it quietly behind the scenes.',
      includes: ['Final supplier confirmations', 'Detailed run sheet and timeline', 'Rehearsal and set-up supervision', 'Supplier and venue liaison on the day', 'Guest flow and programme management', 'Pack-down oversight'],
      suitableFor: ['Couples and hosts who planned their own event', 'Events with many suppliers and a tight schedule', 'Anyone who wants to relax on the day'],
      category: 'core-services',
      image: PLACEHOLDER_IMAGES.serviceCoordination,
      featured: true,
    },
  ]

  for (const [i, s] of services.entries()) {
    const cover = await media(s.image)
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } })
    if (existing) {
      // Keep admin edits; only ensure a cover image exists.
      if (!existing.coverMediaId) await prisma.service.update({ where: { id: existing.id }, data: { coverMediaId: cover.id } })
      continue
    }
    await prisma.service.create({
      data: {
        slug: s.slug,
        name: s.name,
        tagline: s.tagline,
        summary: s.summary,
        description: s.description,
        includes: s.includes,
        suitableFor: s.suitableFor,
        categoryId: categoryIds.get(s.category) ?? null,
        coverMediaId: cover.id,
        isPublished: true,
        isFeatured: s.featured,
        sortOrder: i,
        images: { create: [{ mediaId: cover.id, sortOrder: 0 }] },
      },
    })
  }
}

async function seedSettings() {
  for (const [index, def] of SETTING_DEFINITIONS.entries()) {
    await prisma.websiteSetting.upsert({
      where: { key: def.key },
      create: { key: def.key, group: def.group, label: def.label, type: def.type, value: def.value, help: def.help, sortOrder: index },
      update: { group: def.group, label: def.label, type: def.type, help: def.help, sortOrder: index },
    })
  }
}

async function seedSampleProjects(categoryIds: Map<string, string>) {
  const P = PLACEHOLDER_IMAGES
  const projects = [
    { slug: 'sample-romantic-garden-wedding', title: 'Romantic Garden Wedding', category: 'weddings', summary: 'Soft florals, draped arches and candlelit tables under open skies.', images: [P.pfWedding3, P.pfWedding2, P.pfWedding1, P.inspBoho], featured: true },
    { slug: 'sample-classic-ballroom-wedding', title: 'Classic Ballroom Wedding', category: 'weddings', summary: 'Chandeliers, champagne tones and a timeless reception layout.', images: [P.pfWedding5, P.heroAbout, P.pfWedding4, P.pfWedding6], featured: true },
    { slug: 'sample-intimate-lakeside-vows', title: 'Intimate Lakeside Vows', category: 'weddings', summary: 'A small ceremony styled in neutral tones with natural textures.', images: [P.pfWedding6, P.introPortrait, P.pfWedding4], featured: false },
    { slug: 'sample-modern-engagement-dinner', title: 'Modern Engagement Dinner', category: 'engagements', summary: 'A refined dinner setting with greenery runners and warm lighting.', images: [P.heroInspiration, P.pfEngagement1, P.pfEngagement2], featured: true },
    { slug: 'sample-gold-and-wine-milestone-birthday', title: 'Gold & Wine Milestone Birthday', category: 'birthdays', summary: 'Rich tones, a statement cake moment and a glowing evening lounge.', images: [P.serviceBirthdays, P.pfBirthday1, P.heroContact, P.pfPrivate2], featured: true },
    { slug: 'sample-garden-birthday-brunch', title: 'Garden Birthday Brunch', category: 'birthdays', summary: 'Bunting, bright blooms and a relaxed daytime celebration.', images: [P.pfBirthday2, P.pfBirthday3, P.serviceShowers], featured: false },
    { slug: 'sample-pastel-baby-shower', title: 'Pastel Baby Shower', category: 'baby-showers', summary: 'Gentle pastels, balloon installations and a styled dessert table.', images: [P.serviceShowers, P.pfBaby1, P.inspPink], featured: true },
    { slug: 'sample-blush-bridal-shower', title: 'Blush Bridal Shower', category: 'bridal-showers', summary: 'Blush florals and elegant place settings for a bride-to-be.', images: [P.inspPink, P.aboutPhilosophy, P.introDetail, P.heroServices], featured: false },
    { slug: 'sample-corporate-gala-dinner', title: 'Corporate Gala Dinner', category: 'corporate-events', summary: 'A branded stage, elegant table styling and a seamless programme.', images: [P.heroPortfolio, P.pfCorporate1, P.pfCorporate3, P.serviceCoordination], featured: true },
    { slug: 'sample-product-launch-evening', title: 'Product Launch Evening', category: 'corporate-events', summary: 'Clean staging and guest flow designed around a brand reveal.', images: [P.pfCorporate2, P.pfCorporate1, P.pfCorporate3], featured: false },
    { slug: 'sample-rooftop-private-celebration', title: 'Rooftop Private Celebration', category: 'private-celebrations', summary: 'String lights, a grazing table and an easy evening atmosphere.', images: [P.pfPrivate1, P.servicePrivate, P.pfPrivate2, P.pfPrivate3], featured: true },
  ]

  for (const [i, p] of projects.entries()) {
    const existing = await prisma.portfolioProject.findUnique({ where: { slug: p.slug } })
    if (existing) continue
    const assets = []
    for (const img of p.images) assets.push(await media(img))
    await prisma.portfolioProject.create({
      data: {
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        description: `${SAMPLE_NOTE}\n\n${p.summary}`,
        categoryId: categoryIds.get(p.category) ?? null,
        coverMediaId: assets[0]!.id,
        isPublished: true,
        isFeatured: p.featured,
        isSample: true,
        sortOrder: i,
        images: { create: assets.map((a, idx) => ({ mediaId: a.id, sortOrder: idx })) },
      },
    })
  }
}

async function main() {
  console.log('Seeding event categories…')
  const eventCategories = await seedEventCategories()
  console.log('Seeding service categories…')
  const serviceCategories = await seedServiceCategories()
  console.log('Seeding services…')
  await seedServices(serviceCategories)
  console.log('Seeding website settings…')
  await seedSettings()
  if (process.env.SEED_SAMPLE_PORTFOLIO !== 'false') {
    console.log('Seeding sample portfolio projects (placeholder imagery, clearly labelled)…')
    await seedSampleProjects(eventCategories)
  }
  console.log('Done. No admin users, enquiries or testimonials are seeded. Run `npm run admin:create` to add an admin.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
