import { enquiryNoteSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readValidatedBodyOrFail(event, enquiryNoteSchema)
  const prisma = usePrisma()

  const exists = await prisma.eventEnquiry.findUnique({ where: { id }, select: { id: true } })
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Enquiry not found' })

  const note = await prisma.enquiryNote.create({
    data: { enquiryId: id, authorId: admin.id, type: input.type, body: input.body, followUpAt: input.followUpAt ?? null },
    include: { author: { select: { name: true } } },
  })
  await prisma.eventEnquiry.update({
    where: { id },
    data: { lastActivityAt: new Date(), ...(input.type === 'FOLLOW_UP' && input.followUpAt ? { followUpAt: input.followUpAt } : {}) },
  })
  return { id: note.id, type: note.type, body: note.body, followUpAt: note.followUpAt, createdAt: note.createdAt, author: note.author?.name ?? admin.name }
})
