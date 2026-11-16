import type { Prisma } from '~~/prisma/generated/client'
import { ENQUIRY_STATUSES } from '#shared/config/enquiry'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const prisma = usePrisma()
  const query = getQuery(event)

  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
  const status = typeof query.status === 'string' && ENQUIRY_STATUSES.some(s => s.key === query.status) ? query.status : undefined
  const eventType = typeof query.eventType === 'string' && query.eventType ? query.eventType.slice(0, 80) : undefined
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(5, Number(query.pageSize) || 20))

  const where: Prisma.EventEnquiryWhereInput = {
    ...(status ? { status: status as Prisma.EventEnquiryWhereInput['status'] } : {}),
    ...(eventType ? { eventTypeLabel: eventType } : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: 'insensitive' } },
            { fullName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [items, total, byStatus, eventTypes] = await Promise.all([
    prisma.eventEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, reference: true, status: true, fullName: true, email: true, phone: true,
        eventTypeLabel: true, eventDate: true, dateIsFlexible: true, location: true, guestCount: true,
        budgetLabel: true, preferredContact: true, createdAt: true, followUpAt: true,
        services: { select: { label: true } },
        _count: { select: { images: true, notes: true } },
      },
    }),
    prisma.eventEnquiry.count({ where }),
    prisma.eventEnquiry.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.eventEnquiry.findMany({ distinct: ['eventTypeLabel'], select: { eventTypeLabel: true }, orderBy: { eventTypeLabel: 'asc' } }),
  ])

  const statusCounts: Record<string, number> = {}
  for (const row of byStatus) statusCounts[row.status] = row._count._all

  return {
    items,
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    statusCounts,
    eventTypes: eventTypes.map(e => e.eventTypeLabel),
  }
})
