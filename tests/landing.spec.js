import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  const now = new Date('2026-10-27T00:00:00Z')
  await page.clock.install({ time: now })
  await page.clock.pauseAt(new Date(now.getTime() + 1000))
})

async function expectNoOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  for (const link of await page.locator('.public-header a:visible').all()) {
    const rect = await link.boundingBox()
    expect(rect.x).toBeGreaterThanOrEqual(0)
    expect(rect.x + rect.width).toBeLessThanOrEqual(page.viewportSize().width + 1)
  }
}

test('five-second intro fades once, keeps the header and loads local assets', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())))
  await expect(page.locator('.landing')).toHaveAttribute('data-stage', 'intro')
  await expect(page.getByRole('link', { name: '공부 시작하기' })).toHaveCount(0)
  const header = await page.locator('.public-header').elementHandle()
  await expectNoOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('intro.png'), fullPage: true })

  await page.clock.runFor(4999)
  await expect(page.locator('.landing')).toHaveAttribute('data-stage', 'intro')
  await page.clock.runFor(1)
  await expect(page.locator('.landing')).toHaveAttribute('data-stage', 'welcome')
  await expect(page.locator('.welcome-stage')).toHaveCSS('opacity', '1')
  expect(await header.evaluate(el => el === document.querySelector('.public-header'))).toBe(true)
  await expect(page.locator('.public-header')).toHaveCount(1)
  await expectNoOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('welcome.png'), fullPage: true })

  await page.clock.runFor(60000)
  await expect(page.locator('.landing')).toHaveAttribute('data-stage', 'welcome')
  expect(await page.evaluate(() => [...document.images].every(img => img.complete && img.naturalWidth > 0))).toBe(true)
  expect(errors).toEqual([])
  await page.getByRole('link', { name: '공부 시작하기' }).click()
  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('heading', { name: '환영합니다' })).toBeVisible()
})

test('leaving home during the intro and returning starts a fresh five seconds', async ({ page }) => {
  await page.goto('/')
  await page.clock.runFor(2000)
  await page.getByRole('navigation', { name: '계정 메뉴' }).getByRole('link', { name: '로그인', exact: true }).click()
  await expect(page).toHaveURL('/login')
  await page.clock.runFor(10000)
  await page.locator('.auth-header .brand-logo').click()
  await expect(page).toHaveURL('/login')
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await expect(page.locator('.landing')).toHaveAttribute('data-stage', 'intro')
  await page.clock.runFor(4999)
  await expect(page.locator('.landing')).toHaveAttribute('data-stage', 'intro')
  await page.clock.runFor(1)
  await expect(page.locator('.landing')).toHaveAttribute('data-stage', 'welcome')
})

test('reduced motion keeps the five-second delay and missing routes show recovery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.clock.runFor(4999)
  await expect(page.locator('.landing')).toHaveAttribute('data-stage', 'intro')
  await page.clock.runFor(1)
  await expect(page.locator('.welcome-stage')).toHaveCSS('transition-duration', '0s, 0s')
  await expect(page.locator('.landing')).toHaveAttribute('data-stage', 'welcome')
  await page.goto('/missing-page')
  await expect(page.getByRole('heading', { name: '페이지를 찾을 수 없어요' })).toBeVisible()
})
