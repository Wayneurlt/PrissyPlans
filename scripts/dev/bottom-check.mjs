import { chromium } from '@playwright/test'
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(process.argv[2], { waitUntil: 'load', timeout: 60000 })
const info = await page.evaluate(() => {
  const footer = document.querySelector('footer')
  const r = footer.getBoundingClientRect()
  const docH = document.documentElement.scrollHeight
  const footerBottom = r.bottom + window.scrollY
  const below = [...document.body.querySelectorAll('*')].filter(el => { const b = el.getBoundingClientRect(); return b.bottom + window.scrollY > footerBottom + 2 && b.height > 0 }).slice(0, 8).map(el => `${el.tagName}.${String(el.className).slice(0, 80)} bottom=${Math.round(el.getBoundingClientRect().bottom + window.scrollY)}`)
  return { docH, footerBottom: Math.round(footerBottom), below }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
