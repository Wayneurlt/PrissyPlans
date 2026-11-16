// Logs into the admin and screenshots each admin screen.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
const [base, out, email, password] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', e => console.log('PAGEERROR', e.message.slice(0, 300)))
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 300)) })
await page.goto(base + '/admin', { waitUntil: 'load' })
console.log('redirected to', new URL(page.url()).pathname)
await page.fill('#email', email)
await page.fill('#password', password)
await page.click('button[type=submit]')
await page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 20000 })
const projects = await page.evaluate(() => fetch('/api/admin/portfolio').then(r => r.json()))
const enquiries = await page.evaluate(() => fetch('/api/admin/enquiries').then(r => r.json()))
const paths = ['/admin', '/admin/enquiries', '/admin/portfolio', `/admin/portfolio/${projects[0].id}`, '/admin/services', '/admin/testimonials', '/admin/categories', '/admin/settings']
if (enquiries.items[0]) paths.push(`/admin/enquiries/${enquiries.items[0].id}`)
for (const p of paths) {
  await page.goto(base + p, { waitUntil: 'load' })
  await page.waitForTimeout(800)
  const name = p.replace(/\//g, '_').slice(0, 40) + '.png'
  await page.screenshot({ path: `${out}/${name}`, fullPage: true })
  console.log('saved', name)
}
await browser.close()
