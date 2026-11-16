import type { Prisma } from '~~/prisma/generated/client'

/** Read-side queries for the public website (services, portfolio, testimonials). */

const serviceListInclude = {
  coverMedia: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ServiceInclude

const serviceDetailInclude = {
  ...serviceListInclude,
  images: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.ServiceInclude

const projectListInclude = {
  coverMedia: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.PortfolioProjectInclude

const projectDetailInclude = {
  ...projectListInclude,
  images: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.PortfolioProjectInclude

export function serializeService(service: Prisma.ServiceGetPayload<{ include: typeof serviceListInclude }> & { images?: Array<{ id: string, caption?: string | null, media: Parameters<typeof toPublicMedia>[0] }> }) {
  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    tagline: service.tagline,
    summary: service.summary,
    description: service.description,
    includes: service.includes,
    suitableFor: service.suitableFor,
    category: service.category,
    coverMedia: toPublicMedia(service.coverMedia),
    images: service.images?.map(i => ({ id: i.id, media: toPublicMedia(i.media) })) ?? [],
    isFeatured: service.isFeatured,
    seoTitle: service.seoTitle,
    seoDescription: service.seoDescription,
  }
}

export function serializeProject(project: Prisma.PortfolioProjectGetPayload<{ include: typeof projectListInclude }> & { images?: Array<{ id: string, caption: string | null, media: Parameters<typeof toPublicMedia>[0] }> }) {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.description,
    category: project.category,
    eventDate: project.eventDate,
    location: project.location,
    venue: project.venue,
    guestCount: project.guestCount,
    coverMedia: toPublicMedia(project.coverMedia),
    images: project.images?.map(i => ({ id: i.id, caption: i.caption, media: toPublicMedia(i.media) })) ?? [],
    isFeatured: project.isFeatured,
    isSample: project.isSample,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
  }
}

export type PublicService = ReturnType<typeof serializeService>
export type PublicProject = ReturnType<typeof serializeProject>

export async function listPublishedServices(options: { featured?: boolean, limit?: number } = {}) {
  const prisma = usePrisma()
  const rows = await prisma.service.findMany({
    where: { isPublished: true, ...(options.featured ? { isFeatured: true } : {}) },
    include: serviceListInclude,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    take: options.limit,
  })
  return rows.map(serializeService)
}

export async function getPublishedService(slug: string) {
  const prisma = usePrisma()
  const row = await prisma.service.findFirst({ where: { slug, isPublished: true }, include: serviceDetailInclude })
  return row ? serializeService(row) : null
}

export async function listPublishedProjects(options: { category?: string, featured?: boolean, limit?: number } = {}) {
  const prisma = usePrisma()
  const rows = await prisma.portfolioProject.findMany({
    where: {
      isPublished: true,
      ...(options.featured ? { isFeatured: true } : {}),
      ...(options.category ? { category: { slug: options.category } } : {}),
    },
    include: projectListInclude,
    orderBy: [{ sortOrder: 'asc' }, { eventDate: 'desc' }, { createdAt: 'desc' }],
    take: options.limit,
  })
  return rows.map(serializeProject)
}

export async function getPublishedProject(slug: string) {
  const prisma = usePrisma()
  const row = await prisma.portfolioProject.findFirst({ where: { slug, isPublished: true }, include: projectDetailInclude })
  if (!row) return null
  const related = await prisma.portfolioProject.findMany({
    where: { isPublished: true, id: { not: row.id }, ...(row.categoryId ? { categoryId: row.categoryId } : {}) },
    include: projectListInclude,
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    take: 3,
  })
  return { project: serializeProject(row), related: related.map(serializeProject) }
}

export async function listPortfolioCategories() {
  const prisma = usePrisma()
  const rows = await prisma.eventCategory.findMany({
    where: { isActive: true, showInPortfolio: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, slug: true, description: true, _count: { select: { projects: { where: { isPublished: true } } } } },
  })
  return rows.map(r => ({ id: r.id, name: r.name, slug: r.slug, description: r.description, projectCount: r._count.projects }))
}

export async function listPublishedTestimonials(limit = 12) {
  const prisma = usePrisma()
  const rows = await prisma.testimonial.findMany({
    where: { isPublished: true },
    include: { photoMedia: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  })
  return rows.map(t => ({
    id: t.id,
    clientName: t.clientName,
    eventType: t.eventType,
    quote: t.quote,
    rating: t.rating,
    eventDate: t.eventDate,
    photo: toPublicMedia(t.photoMedia),
  }))
}
