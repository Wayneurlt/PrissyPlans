// Captures desktop and mobile screenshots of key pages using the locally installed Chrome.
//   BASE_URL=http://localhost:3000 OUT_DIR=./screenshots node scripts/screenshots.mjs
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const OUT = process.env.OUT_DIR || './screenshots'
const pages = (process.env.PAGES || '/,/about,/services,/services/weddings-engagements,/portfolio,/portfolio/sample-romantic-garden-wedding,/inspiration,/contact,/enquire').split(',')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome' })
for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  for (const path of pages) {
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 60000 })
    // Scroll through so lazy images load.
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) } window.scrollTo(0, 0) })
    await page.waitForTimeout(600)
    const name = `${label}${path.replace(/\//g, '_') || '_home'}.png`
    await page.screenshot({ path: `${OUT}/${name}`, fullPage: process.env.FULL !== 'false' })
    console.log('saved', name)
  }
  await ctx.close()
}
await browser.close()
