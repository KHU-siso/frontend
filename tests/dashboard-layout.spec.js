import { expect, test } from '@playwright/test'

async function ready(page) {
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())))
}
async function withinViewport(page, selector) {
  const box = await page.locator(selector).boundingBox()
  const size = page.viewportSize()
  expect(box, selector).not.toBeNull()
  expect(box.y, selector).toBeGreaterThanOrEqual(-1)
  expect(box.y + box.height, selector).toBeLessThanOrEqual(size.height + 1)
  expect(box.x + box.width, selector).toBeLessThanOrEqual(size.width + 1)
}
async function noPageScroll(page) {
  const result = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, viewportWidth: innerWidth, viewportHeight: innerHeight }))
  expect(result.width, JSON.stringify(result)).toBeLessThanOrEqual(result.viewportWidth + 1)
  expect(result.height, JSON.stringify(result)).toBeLessThanOrEqual(result.viewportHeight + 1)
}
async function overviewFits(page) {
  await noPageScroll(page)
  for (const selector of ['.dashboard-banner', '.dashboard-mascot', '.dashboard-quick', '.dashboard-tasks', '.app-footer']) await withinViewport(page, selector)
  await expect(page.locator('.todo-card')).toHaveCount(4)
  await expect(page.locator('.quick-action')).toHaveCount(4)
  const overflow = await page.locator('.todo-card').evaluateAll(cards => cards.map(card => ({ text: card.querySelector('h3').textContent, extra: card.scrollHeight - card.clientHeight })))
  expect(overflow.filter(card => card.extra > 2), JSON.stringify(overflow)).toEqual([])
  const avatar = await page.locator('.standing-ong').boundingBox()
  const panel = await page.locator('.dashboard-mascot').boundingBox()
  expect(avatar.height).toBeLessThanOrEqual(panel.height + 1)
  expect(avatar.width).toBeLessThanOrEqual(panel.width + 1)
}

test('dashboard fits one viewport and mobile switches to a complete weekly timetable', async ({ page }, info) => {
  await page.goto('/dashboard')
  await ready(page)
  await overviewFits(page)
  await page.screenshot({ path: info.outputPath('dashboard-viewport.png') })
  const weekly = page.getByRole('button', { name: '주간 시간표', exact: true })
  if (await weekly.isVisible()) await weekly.click()
  await withinViewport(page, '.timetable-grid')
  await expect(page.locator('.timetable-day')).toHaveCount(7)
  await expect(page.locator('.timetable-hour')).toHaveCount(11)
  await noPageScroll(page)
  await page.screenshot({ path: info.outputPath('dashboard-timetable.png') })
  await page.getByRole('button', { name: /^사진 1,/ }).click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: '사진 1', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  const overview = page.getByRole('button', { name: '오늘의 학습', exact: true })
  if (await overview.isVisible()) await overview.click()
  if (info.project.name === 'desktop') {
    // Compare the major regions against the supplied 1567 × 1114 design.
    await page.setViewportSize({ width: 1567, height: 1114 })
    await overviewFits(page)
    for (const [selector, target] of [
      ['.app-header', { x: 0, y: 0, width: 1567, height: 86 }],
      ['.dashboard-banner', { x: 65, y: 109, width: 1443, height: 172 }],
      ['.dashboard-mascot', { x: 65, y: 303, width: 432, height: 638 }],
      ['.dashboard-quick', { x: 517, y: 306, width: 408, height: 196 }],
      ['.todo-panel', { x: 523, y: 531, width: 402, height: 423 }],
      ['.timetable-card', { x: 951, y: 302, width: 563, height: 689 }],
    ]) {
      const actual = await page.locator(selector).boundingBox()
      for (const dimension of ['x', 'y', 'width', 'height']) {
        expect(Math.abs(actual[dimension] - target[dimension]), `${selector} ${dimension}`).toBeLessThanOrEqual(14)
      }
    }
    const footerLogo = await page.locator('.app-footer .brand-logo').boundingBox()
    expect(Math.abs(footerLogo.x + footerLogo.width / 2 - 1567 / 2)).toBeLessThanOrEqual(1)
    await page.screenshot({ path: info.outputPath('dashboard-figma-proportions.png') })
    for (const [width, height] of [[1366, 768], [1280, 720], [1536, 864], [1920, 1080], [1024, 768], [1366, 600]]) {
      await page.setViewportSize({ width, height })
      await overviewFits(page)
      await withinViewport(page, '.timetable-grid')
      await page.screenshot({ path: info.outputPath(`dashboard-${width}x${height}.png`) })
    }
  }
})

test('visible labels contain no demo branding and unconnected authentication stays explicit', async ({ page }) => {
  for (const path of ['/', '/login', '/signup', '/dashboard', '/chat', '/materials', '/study/setup', '/wrong-answers', '/shop', '/inventory', '/mypage']) {
    await page.goto(path)
    await expect(page.locator('body')).not.toContainText(/데모|\bDEMO\b/i)
    const labels = await page.locator('[aria-label]').evaluateAll(nodes => nodes.map(n => n.getAttribute('aria-label')).join('\n'))
    expect(labels).not.toMatch(/데모|\bDEMO\b/i)
  }
  await page.goto('/login')
  await page.getByLabel('아이디', { exact: true }).fill('learner')
  await page.getByLabel('비밀번호', { exact: true }).fill('not-a-real-secret')
  await page.getByRole('button', { name: '로그인 하기', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('로그인할 수 없습니다')
  await expect(page).toHaveURL('/login')
})
