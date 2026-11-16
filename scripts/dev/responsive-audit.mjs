// Screenshots pages at several widths and reports horizontal overflow and overlapping/cramped text.
//   node scripts/dev/responsive-audit.mjs <baseUrl> <outDir> [paths]
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
const [base, out, list] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const paths = (list || '/,/about,/services,/services/event-planning,/portfolio,/portfolio/sample-romantic-garden-wedding,/inspiration,/contact,/enquire').split(',')
const widths = (process.env.WIDTHS || '320,390,768,1024,1920').split(',').map(Number)
const browser = await chromium.launch({ channel: 'chrome' })
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'load', timeout: 60000 })
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) } window.scrollTo(0, 0) })
    await page.waitForTimeout(400)
    const report = await page.evaluate(() => {
      const vw = window.innerWidth
      const offenders = [...document.querySelectorAll('body *')].filter(el => {
        const r = el.getBoundingClientRect()
        if (!r.width || getComputedStyle(el).position === 'fixed') return false
        let p = el.parentElement; while (p) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'hidden' || o === 'scroll' || o === 'clip') { if (p !== document.body) return false } p = p.parentElement }
        return r.right > vw + 1 || r.left < -1
      }).slice(0, 4).map(el => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} [${Math.round(el.getBoundingClientRect().left)}-${Math.round(el.getBoundingClientRect().right)}]`)
      return { scrollW: document.documentElement.scrollWidth, vw, offenders }
    })
    const name = `${w}${p.replace(/\//g, '_') || '_home'}.png`
    await page.screenshot({ path: `${out}/${name}`, fullPage: true })
    if (report.offenders.length || report.scrollW > report.vw) console.log(w, p, JSON.stringify(report))
  }
  await ctx.close()
}
await browser.close()
console.log('done')
