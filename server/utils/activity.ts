interface ActivityInput {
  actorId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  summary: string
}

/** Records an admin/system action for the dashboard's recent activity feed. */
export async function logActivity(input: ActivityInput) {
  try {
    await usePrisma().activityLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary.slice(0, 300),
      },
    })
  }
  catch (error) {
    console.error('[activity] failed to log', error)
  }
}
