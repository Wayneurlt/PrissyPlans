import type { PublicProject, PublicService } from '~~/server/services/catalogue.service'

/** JSON-serialised shapes (dates arrive as strings over the wire). */
export type ProjectDTO = Omit<PublicProject, 'eventDate'> & { eventDate: string | Date | null }
export type ServiceDTO = PublicService
