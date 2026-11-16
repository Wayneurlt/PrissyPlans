import { z } from 'zod'
import { ENQUIRY_STATUSES } from '#shared/config/enquiry'

const statusKeys = ENQUIRY_STATUSES.map(s => s.key) as [string, ...string[]]

const slug = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only')
const optional = (max: number) => z.string().trim().max(max).optional().or(z.literal('')).transform(v => v || null)
const optionalDate = z.string().trim().optional().or(z.literal('')).transform(v => (v ? new Date(v) : null)).refine(v => v === null || !Number.isNaN(v.getTime()), 'Invalid date')
const stringList = z.array(z.string().trim().min(1).max(200)).max(30).default([])

export const loginSchema = z.object({
  email: z.email('Enter a valid email address').max(160),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
})

export const serviceInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug,
  tagline: optional(160),
  summary: z.string().trim().min(10).max(400),
  description: z.string().trim().min(20).max(8000),
  includes: stringList,
  suitableFor: stringList,
  categoryId: optional(60),
  coverMediaId: optional(60),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  seoTitle: optional(160),
  seoDescription: optional(320),
})
export type ServiceInput = z.infer<typeof serviceInputSchema>

export const portfolioInputSchema = z.object({
  title: z.string().trim().min(2).max(140),
  slug,
  summary: optional(400),
  description: optional(8000),
  categoryId: optional(60),
  eventDate: optionalDate,
  location: optional(140),
  venue: optional(140),
  guestCount: z.union([z.coerce.number().int().min(1).max(100000), z.literal(''), z.null()]).optional().transform(v => (v === '' || v === undefined ? null : v)),
  coverMediaId: optional(60),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isSample: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  seoTitle: optional(160),
  seoDescription: optional(320),
})
export type PortfolioInput = z.infer<typeof portfolioInputSchema>

export const testimonialInputSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  eventType: optional(80),
  quote: z.string().trim().min(10).max(2000),
  rating: z.union([z.coerce.number().int().min(1).max(5), z.literal(''), z.null()]).optional().transform(v => (v === '' || v === undefined ? null : v)),
  eventDate: optionalDate,
  photoMediaId: optional(60),
  isPublished: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
})
export type TestimonialInput = z.infer<typeof testimonialInputSchema>

export const eventCategoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug,
  description: optional(300),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  showInPortfolio: z.boolean().default(true),
  showInEnquiry: z.boolean().default(true),
  isActive: z.boolean().default(true),
})

export const serviceCategoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug,
  description: optional(300),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
})

export const enquiryUpdateSchema = z.object({
  status: z.enum(statusKeys).optional(),
  followUpAt: optionalDate.optional(),
  note: z.string().trim().max(4000).optional().or(z.literal('')).transform(v => v || undefined),
})

export const enquiryNoteSchema = z.object({
  body: z.string().trim().min(1, 'Write a note first').max(4000),
  type: z.enum(['NOTE', 'FOLLOW_UP']).default('NOTE'),
  followUpAt: optionalDate.optional(),
})

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
})

export const settingsUpdateSchema = z.object({
  values: z.record(z.string().min(1).max(80), z.string().max(20000)),
})

export const imageMetaSchema = z.object({
  caption: optional(300).optional(),
  altText: optional(300).optional(),
})
