/**
 * API + page integration tests against a running server.
 *
 *   npm run dev                       (or a preview/production build)
 *   TEST_BASE_URL=http://localhost:3000 \
 *   TEST_ADMIN_EMAIL=you@example.com TEST_ADMIN_PASSWORD=... npm test
 *
 * Skipped automatically when TEST_BASE_URL is not set. These tests create a test
 * enquiry and a draft portfolio project, then delete both.
 */
import { describe, expect, it, beforeAll } from 'vitest'

const BASE = process.env.TEST_BASE_URL
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD
const run = BASE ? describe : describe.skip

const future = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

function enquiry(key: string) {
  return {
    submissionKey: key,
    startedAt: Date.now() - 60_000,
    eventType: 'engagement',
    eventDate: future,
    dateIsFlexible: false,
    location: 'Nairobi',
    venueNotConfirmed: true,
    guestCount: 60,
    services: ['decoration', 'coordination'],
    budget: 'undecided',
    vision: 'Automated test enquiry. Safe to delete if it remains.',
    imageIds: [],
    fullName: 'Automated Test',
    phone: '+254 700 000 000',
    email: 'automated-test@example.com',
    preferredContact: 'EMAIL',
    consent: true,
    website: '',
  }
}

async function req(path: string, init: RequestInit & { json?: unknown, cookie?: string } = {}) {
  const headers = new Headers(init.headers)
  if (init.json !== undefined) headers.set('content-type', 'application/json')
  if (init.cookie) headers.set('cookie', init.cookie)
  const res = await fetch(`${BASE}${path}`, { ...init, headers, body: init.json !== undefined ? JSON.stringify(init.json) : init.body, redirect: 'manual' })
  const text = await res.text()
  let body: any = text
  try { body = JSON.parse(text) } catch {}
  return { status: res.status, body, headers: res.headers }
}

run('public website', () => {
  it.each(['/', '/about', '/services', '/portfolio', '/inspiration', '/contact', '/enquire'])('renders %s', async (path) => {
    const res = await req(path)
    expect(res.status).toBe(200)
    expect(String(res.body)).toContain('Prissy Plans Events')
  })

  it('returns 404 for unknown pages', async () => {
    expect((await req('/this-page-does-not-exist')).status).toBe(404)
  })

  it('links every published service to a working detail page', async () => {
    const { body: services } = await req('/api/services')
    expect(services.length).toBeGreaterThan(0)
    for (const s of services) {
      expect((await req(`/services/${s.slug}`)).status).toBe(200)
    }
  })

  it('filters the portfolio by category and serves detail pages', async () => {
    const { body: categories } = await req('/api/categories')
    const withProjects = categories.find((c: any) => c.projectCount > 0)
    if (!withProjects) return
    const { body: filtered } = await req(`/api/portfolio?category=${withProjects.slug}`)
    expect(filtered.length).toBe(withProjects.projectCount)
    expect(filtered.every((p: any) => p.category?.slug === withProjects.slug)).toBe(true)
    expect((await req(`/portfolio/${filtered[0].slug}`)).status).toBe(200)
  })

  it('never exposes private settings', async () => {
    const { body } = await req('/api/settings')
    expect(body).not.toHaveProperty('enquiry.adminEmail')
  })

  it('serves robots.txt and a sitemap', async () => {
    expect(String((await req('/robots.txt')).body)).toContain('Disallow: /admin')
    expect(String((await req('/sitemap.xml')).body)).toContain('<urlset')
  })
})

run('enquiry system', () => {
  let cookie = ''
  let enquiryId = ''

  beforeAll(async () => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return
    const res = await req('/api/admin/auth/login', { method: 'POST', json: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
    cookie = (res.headers.get('set-cookie') || '').split(';')[0] || ''
  })

  it('rejects invalid submissions with field errors', async () => {
    const res = await req('/api/enquiries', { method: 'POST', json: { submissionKey: 'too-short' } })
    expect(res.status).toBe(422)
    expect(res.body.data.fieldErrors).toHaveProperty('eventType')
  })

  it('persists a valid enquiry and returns a reference', async () => {
    const key = `api-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const res = await req('/api/enquiries', { method: 'POST', json: enquiry(key) })
    expect(res.status).toBe(201)
    expect(res.body.reference).toMatch(/^PPE-\d{4}-[A-Z0-9]{5}$/)
    enquiryId = res.body.id

    // Duplicate submission with the same key returns the same enquiry.
    const dup = await req('/api/enquiries', { method: 'POST', json: enquiry(key) })
    expect(dup.status).toBe(200)
    expect(dup.body.duplicate).toBe(true)
    expect(dup.body.id).toBe(enquiryId)

    // Thank-you lookup only exposes non-personal data.
    const thanks = await req(`/api/enquiries/${res.body.reference}`)
    expect(thanks.status).toBe(200)
    expect(thanks.body).not.toHaveProperty('email')
    expect(thanks.body).not.toHaveProperty('phone')
  })

  it('rejects disguised uploads', async () => {
    const form = new FormData()
    form.append('files', new Blob(['<script>alert(1)</script>'], { type: 'image/png' }), 'evil.png')
    const res = await fetch(`${BASE}/api/enquiries/upload`, { method: 'POST', body: form })
    // 415 when uploads are configured, 503 when Cloudinary is not configured.
    expect([415, 503]).toContain(res.status)
  })

  it('lets an admin manage the enquiry', async () => {
    if (!cookie || !enquiryId) return
    const patch = await req(`/api/admin/enquiries/${enquiryId}`, { method: 'PATCH', cookie, json: { status: 'CONTACTED', note: 'Called the client' } })
    expect(patch.status).toBe(200)
    expect(patch.body.status).toBe('CONTACTED')

    const note = await req(`/api/admin/enquiries/${enquiryId}/notes`, { method: 'POST', cookie, json: { body: 'Follow up next week', type: 'FOLLOW_UP', followUpAt: future } })
    expect(note.status).toBe(200)

    const detail = await req(`/api/admin/enquiries/${enquiryId}`, { cookie })
    expect(detail.body.notes.length).toBeGreaterThanOrEqual(2)
    expect(detail.body.services.map((s: any) => s.key)).toEqual(['decoration', 'coordination'])

    const del = await req(`/api/admin/enquiries/${enquiryId}`, { method: 'DELETE', cookie })
    expect(del.status).toBe(200)
  })
})

run('admin security', () => {
  it.each([
    ['GET', '/api/admin/dashboard'],
    ['GET', '/api/admin/enquiries'],
    ['POST', '/api/admin/portfolio'],
    ['PUT', '/api/admin/settings'],
    ['DELETE', '/api/admin/services/anything'],
  ])('blocks %s %s without a session', async (method, path) => {
    expect((await req(path, method === 'GET' ? { method } : { method, json: {} })).status).toBe(401)
  })

  it('redirects admin pages to the login page', async () => {
    const res = await req('/admin/enquiries')
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('rejects wrong credentials with a generic message', async () => {
    const res = await req('/api/admin/auth/login', { method: 'POST', json: { email: 'nobody@example.com', password: 'wrong-password' } })
    expect(res.status === 401 || res.status === 429).toBe(true)
  })
})

run('admin portfolio management', () => {
  it('creates, updates, publishes and deletes a project', async () => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return
    const login = await req('/api/admin/auth/login', { method: 'POST', json: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
    const cookie = (login.headers.get('set-cookie') || '').split(';')[0] || ''
    const slug = `api-test-project-${Date.now()}`

    const created = await req('/api/admin/portfolio', { method: 'POST', cookie, json: { title: 'API Test Project', slug, isPublished: false } })
    expect(created.status).toBe(200)

    const conflict = await req('/api/admin/portfolio', { method: 'POST', cookie, json: { title: 'Duplicate', slug } })
    expect(conflict.status).toBe(409)

    expect((await req(`/portfolio/${slug}`)).status).toBe(404) // draft is hidden

    const updated = await req(`/api/admin/portfolio/${created.body.id}`, { method: 'PUT', cookie, json: { title: 'API Test Project', slug, summary: 'Updated', isPublished: true } })
    expect(updated.status).toBe(200)
    expect((await req(`/portfolio/${slug}`)).status).toBe(200)

    expect((await req(`/api/admin/portfolio/${created.body.id}`, { method: 'DELETE', cookie })).status).toBe(200)
    expect((await req(`/portfolio/${slug}`)).status).toBe(404)
  })
})
