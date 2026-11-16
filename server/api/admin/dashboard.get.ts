export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const prisma = usePrisma()
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [total, byStatus, last30, upcoming, recentEnquiries, activity, publishedProjects, publishedServices, publishedTestimonials] = await Promise.all([
    prisma.eventEnquiry.count(),
    prisma.eventEnquiry.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.eventEnquiry.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.eventEnquiry.findMany({
      where: { eventDate: { gte: startOfToday }, status: { in: ['CONSULTATION_SCHEDULED', 'PROPOSAL_SENT', 'CONFIRMED'] } },
      orderBy: { eventDate: 'asc' },
      take: 8,
      select: { id: true, reference: true, fullName: true, eventTypeLabel: true, eventDate: true, status: true, location: true },
    }),
    prisma.eventEnquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, reference: true, fullName: true, eventTypeLabel: true, eventDate: true, status: true, createdAt: true, budgetLabel: true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { actor: { select: { name: true } } },
    }),
    prisma.portfolioProject.count({ where: { isPublished: true } }),
    prisma.service.count({ where: { isPublished: true } }),
    prisma.testimonial.count({ where: { isPublished: true } }),
  ])

  const statusCounts: Record<string, number> = {}
  for (const row of byStatus) statusCounts[row.status] = row._count._all

  return {
    stats: {
      total,
      new: statusCounts.NEW ?? 0,
      contacted: statusCounts.CONTACTED ?? 0,
      consultation: statusCounts.CONSULTATION_SCHEDULED ?? 0,
      proposal: statusCounts.PROPOSAL_SENT ?? 0,
      confirmed: statusCounts.CONFIRMED ?? 0,
      completed: statusCounts.COMPLETED ?? 0,
      declined: statusCounts.DECLINED ?? 0,
      last30,
      publishedProjects,
      publishedServices,
      publishedTestimonials,
    },
    upcoming,
    recentEnquiries,
    activity: activity.map(a => ({ id: a.id, action: a.action, entityType: a.entityType, entityId: a.entityId, summary: a.summary, createdAt: a.createdAt, actor: a.actor?.name ?? 'System' })),
    config: {
      uploads: isCloudinaryConfigured(),
      mail: isMailConfigured(),
      adminEmail: Boolean(await getAdminNotificationEmail()),
      whatsapp: Boolean(await getWhatsAppNumber()),
    },
  }
})
