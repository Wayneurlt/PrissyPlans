import { enquiryUpdateSchema } from '#shared/schemas/admin'
import { ENQUIRY_STATUSES } from '#shared/config/enquiry'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readValidatedBodyOrFail(event, enquiryUpdateSchema)
  const prisma = usePrisma()

  const existing = await prisma.eventEnquiry.findUnique({ where: { id }, select: { id: true, status: true, reference: true, contactedAt: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Enquiry not found' })

  const data: Record<string, unknown> = { lastActivityAt: new Date() }
  const notes: Array<{ type: 'NOTE' | 'FOLLOW_UP' | 'STATUS_CHANGE', body: string, followUpAt?: Date | null }> = []

  if (input.status && input.status !== existing.status) {
    data.status = input.status
    if (input.status !== 'NEW' && !existing.contactedAt) data.contactedAt = new Date()
    const label = ENQUIRY_STATUSES.find(s => s.key === input.status)?.label ?? input.status
    notes.push({ type: 'STATUS_CHANGE', body: `Status changed to ${label}${input.note ? ` — ${input.note}` : ''}` })
  }
  else if (input.note) {
    notes.push({ type: 'NOTE', body: input.note })
  }

  if (input.followUpAt !== undefined) {
    data.followUpAt = input.followUpAt
    if (input.followUpAt) notes.push({ type: 'FOLLOW_UP', body: `Follow-up scheduled`, followUpAt: input.followUpAt })
  }

  const updated = await prisma.eventEnquiry.update({
    where: { id },
    data: {
      ...data,
      notes: notes.length ? { create: notes.map(n => ({ ...n, authorId: admin.id })) } : undefined,
    },
    select: { id: true, status: true, followUpAt: true, contactedAt: true, lastActivityAt: true },
  })

  if (data.status) {
    await logActivity({ actorId: admin.id, action: 'enquiry.status', entityType: 'enquiry', entityId: id, summary: `${admin.name} moved ${existing.reference} to ${ENQUIRY_STATUSES.find(s => s.key === data.status)?.label}` })
  }
  return updated
})
