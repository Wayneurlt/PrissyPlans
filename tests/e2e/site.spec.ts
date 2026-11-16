import { expect, test } from '@playwright/test'

test.describe('public website', () => {
  test('homepage hero CTAs lead to working pages', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your Vision')
    await page.locator('main').getByRole('link', { name: /plan your event/i }).first().click()
    await expect(page).toHaveURL(/\/enquire/)
    await expect(page.getByRole('heading', { name: 'Plan your event', level: 1 })).toBeVisible()

    await page.goto('/')
    await page.locator('main').getByRole('link', { name: /explore our work/i }).click()
    await expect(page).toHaveURL(/\/portfolio/)
  })

  test('no horizontal overflow on key pages', async ({ page }) => {
    for (const path of ['/', '/services', '/portfolio', '/inspiration', '/contact', '/enquire']) {
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow, `overflow on ${path}`).toBeLessThanOrEqual(1)
    }
  })

  test('service cards open service detail pages', async ({ page }) => {
    await page.goto('/services')
    await page.locator('main a[href^="/services/"]').first().click()
    await expect(page).toHaveURL(/\/services\/[a-z0-9-]+$/)
    await expect(page.getByRole('link', { name: /enquire about this service/i })).toBeVisible()
  })

  test('portfolio filters and detail pages work', async ({ page, isMobile }) => {
    await page.goto('/portfolio')
    if (isMobile) {
      // Phones get a single dropdown instead of a row of tabs.
      await page.getByLabel('Filter by event type').selectOption('weddings')
    }
    else {
      const tab = page.getByRole('tab', { name: 'Weddings' })
      await tab.click()
      await expect(tab).toHaveAttribute('aria-selected', 'true')
    }
    await expect(page).toHaveURL(/category=weddings/)
    const cards = page.locator('main a[href^="/portfolio/"]')
    await expect(cards.first()).toBeVisible()
    // Wait for the filtered list to replace the full one.
    await expect.poll(async () => (await cards.locator('.eyebrow').allInnerTexts()).every(l => /wedding/i.test(l)), { timeout: 15_000 }).toBe(true)
    await cards.first().click()
    await expect(page).toHaveURL(/\/portfolio\/[a-z0-9-]+$/)
  })

  test('portfolio lightbox opens and closes with the keyboard', async ({ page }) => {
    await page.goto('/portfolio/sample-romantic-garden-wedding')
    await page.getByRole('button', { name: /open image 1/i }).click()
    await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('dialog')).toContainText('2 /')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
  })
})

test.describe('mobile navigation', () => {
  test('menu opens, navigates and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only')
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const menu = page.locator('#mobile-menu')
    await expect(menu).toBeVisible()
    await menu.getByRole('link', { name: 'Services' }).click()
    await expect(page).toHaveURL(/\/services$/)
    await expect(menu).toBeHidden()
  })
})

test.describe('enquiry wizard', () => {
  test('validates each step before moving on', async ({ page }) => {
    await page.goto('/enquire')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Please choose an event type')).toBeVisible()

    await page.getByRole('radio', { name: 'Birthday' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('heading', { name: 'When and where is it happening?' })).toBeVisible()

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText(/choose a date, or tick/i)).toBeVisible()

    await page.getByLabel('The date is not yet confirmed').check()
    await page.getByLabel('Venue not yet confirmed').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('heading', { name: 'How can we help?' })).toBeVisible()

    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.getByRole('heading', { name: 'When and where is it happening?' })).toBeVisible()
  })

  test('prefills the theme from the inspiration page', async ({ page }) => {
    await page.goto('/inspiration')
    await page.getByRole('link', { name: /create an event like this/i }).first().click()
    await expect(page).toHaveURL(/\/enquire\?theme=/)
  })
})

test.describe('admin protection', () => {
  test('redirects anonymous visitors to the login page', async ({ page }) => {
    await page.goto('/admin/enquiries')
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('shows an error for wrong credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('#email', 'nobody@example.com')
    await page.fill('#password', 'not-the-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })
})
