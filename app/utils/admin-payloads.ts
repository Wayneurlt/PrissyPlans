import { toDateInputValue } from '#shared/utils/format'

/** Picks the editable fields of a portfolio project for a PUT request. */
export function pickProject(p: Record<string, unknown>) {
  return {
    title: p.title,
    slug: p.slug,
    summary: p.summary ?? '',
    description: p.description ?? '',
    categoryId: p.categoryId ?? '',
    eventDate: toDateInputValue(p.eventDate as string | null),
    location: p.location ?? '',
    venue: p.venue ?? '',
    guestCount: p.guestCount ?? '',
    coverMediaId: p.coverMediaId ?? '',
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
    isSample: p.isSample,
    sortOrder: p.sortOrder,
    seoTitle: p.seoTitle ?? '',
    seoDescription: p.seoDescription ?? '',
  }
}

/** Picks the editable fields of a service for a PUT request. */
export function pickService(s: Record<string, unknown>) {
  return {
    name: s.name,
    slug: s.slug,
    tagline: s.tagline ?? '',
    summary: s.summary,
    description: s.description,
    includes: s.includes ?? [],
    suitableFor: s.suitableFor ?? [],
    categoryId: s.categoryId ?? '',
    coverMediaId: s.coverMediaId ?? '',
    isPublished: s.isPublished,
    isFeatured: s.isFeatured,
    sortOrder: s.sortOrder,
    seoTitle: s.seoTitle ?? '',
    seoDescription: s.seoDescription ?? '',
  }
}
