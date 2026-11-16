// Screenshots each enquiry step at several widths.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
const [base, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const widths = (process.env.WIDTHS || '390,768,1024,1440').split(',').map(Number)
const browser = await chromium.launch({ channel: 'chrome' })
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' })
  page.on('pageerror', e => console.log('PAGEERROR', w, e.message.slice(0, 200)))
  await page.goto(base + '/enquire', { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  const shot = async (n) => { await page.waitForTimeout(500); await page.screenshot({ path: `${out}/${w}_${n}.png`, fullPage: true }) }
  await shot('1')
  await page.getByRole('radio', { name: 'Wedding' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await shot('2')
  await page.getByLabel('The date is not yet confirmed').check()
  await page.getByLabel('Venue not yet confirmed').check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await shot('3')
  await page.getByRole('checkbox', { name: /Event Planning/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await shot('4')
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await shot('5')
  await page.fill('#f-vision', 'A soft, romantic garden wedding with candlelight and lots of florals.')
  await page.getByRole('button', { name: 'Continue' }).click()
  await shot('6')
  await page.close()
}
await browser.close()
console.log('done')
