export default defineEventHandler(async (event) => {
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const prisma = usePrisma()
  const [services, projects] = await Promise.all([
    prisma.service.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.portfolioProject.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
  ])
  const staticPages = ['', '/about', '/services', '/portfolio', '/inspiration', '/contact', '/enquire']
  const urls: Array<{ loc: string, lastmod?: string, priority: string }> = [
    ...staticPages.map(p => ({ loc: `${siteUrl}${p}`, priority: p === '' ? '1.0' : '0.8' })),
    ...services.map(s => ({ loc: `${siteUrl}/services/${s.slug}`, lastmod: s.updatedAt.toISOString(), priority: '0.7' })),
    ...projects.map(p => ({ loc: `${siteUrl}/portfolio/${p.slug}`, lastmod: p.updatedAt.toISOString(), priority: '0.6' })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return xml
})
