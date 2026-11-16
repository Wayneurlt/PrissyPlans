import { chromium } from '@playwright/test'
const base = process.argv[2]
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', m => { if (['error','warning'].includes(m.type())) console.log('CONSOLE', m.type(), m.text().slice(0, 400)) })
page.on('pageerror', e => console.log('PAGEERROR', e.message.slice(0, 400)))
page.on('response', r => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url().slice(0, 200)) })
page.on('requestfailed', r => console.log('FAILED', r.url().slice(0, 200), r.failure()?.errorText))
for (const p of (process.argv[3] || '/,/enquire').split(',')) {
  console.log('=== ', p)
  await page.goto(base + p, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(1500)
  console.log('main html length', (await page.locator('main').innerHTML()).length, 'svg count', await page.locator('svg').count(), 'logo complete', await page.locator('header img').first().evaluate(i => i.complete + ' ' + i.naturalWidth).catch(e => 'n/a'))
}
await browser.close()
