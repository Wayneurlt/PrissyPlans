export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const prisma = usePrisma()
  const [eventCategories, serviceCategories] = await Promise.all([
    prisma.eventCategory.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { projects: true, enquiries: true } } } }),
    prisma.serviceCategory.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { services: true } } } }),
  ])
  return {
    eventCategories: eventCategories.map(c => ({ ...c, projectCount: c._count.projects, enquiryCount: c._count.enquiries })),
    serviceCategories: serviceCategories.map(c => ({ ...c, serviceCount: c._count.services })),
  }
})
