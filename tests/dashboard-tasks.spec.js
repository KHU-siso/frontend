import { expect, test } from '@playwright/test'

async function ready(page) {
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())))
}
async function cardsInOneColumn(page) {
  const boxes = await page.locator('.todo-card').evaluateAll(cards => cards.map(card => {
    const box = card.getBoundingClientRect()
    return { x: box.x, y: box.y, width: box.width, height: box.height, overflow: card.scrollWidth - card.clientWidth }
  }))
  for (let i = 0; i < boxes.length; i++) {
    expect(boxes[i].x).toBeCloseTo(boxes[0].x, 1)
    expect(boxes[i].width).toBeCloseTo(boxes[0].width, 1)
    expect(boxes[i].overflow).toBeLessThanOrEqual(1)
    if (i) expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y + boxes[i - 1].height)
  }
}
async function restOfDashboard(page) {
  return page.locator('.dashboard-banner, .dashboard-mascot, .dashboard-quick, .timetable-card').evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect()
    return { x: box.x, y: box.y, width: box.width, height: box.height }
  }))
}
async function mount(page, count) {
  await page.evaluate(async count => {
    const { initialCourses } = await import('/src/data/dashboard.js')
    const courses = Array.from({ length: count }, (_, i) => ({ ...initialCourses[i % initialCourses.length], id: `fixture-course-${i}`, title: i < 4 ? initialCourses[i].title : `추가 과목 ${i + 1}` }))
    const { mountCourses } = await import('/tests/fixtures/dashboard-tasks.jsx')
    mountCourses(courses)
  }, count)
  await expect(page.locator('.todo-card')).toHaveCount(count)
}

test('four horizontal cards preserve data, status colors, cancellation and viewport layout', async ({ page }, info) => {
  await page.goto('/dashboard')
  await ready(page)
  await expect(page.locator('.todo-card')).toHaveCount(4)
  await cardsInOneColumn(page)
  const list = page.getByRole('list', { name: '과목별 해야 할 일' })
  const geometry = await list.evaluate(el => {
    const bounds = el.getBoundingClientRect()
    return { client: el.clientHeight, scroll: el.scrollHeight, top: bounds.top, bottom: bounds.bottom, cards: [...el.querySelectorAll('.todo-card')].map(card => { const b = card.getBoundingClientRect(); return { top: b.top, bottom: b.bottom } }) }
  })
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client + 1)
  for (const card of geometry.cards) {
    expect(card.top).toBeGreaterThanOrEqual(geometry.top)
    expect(card.bottom).toBeLessThanOrEqual(geometry.bottom + 1)
  }
  await expect(page.locator('.todo-state .is-overdue')).toHaveCSS('color', 'rgb(255, 0, 4)')
  await expect(page.locator('.todo-state > span').nth(1)).toHaveCSS('color', 'rgb(46, 125, 50)')
  for (const status of await page.locator('.todo-state > span').all()) await expect(status).toBeVisible()
  await expect(page.getByRole('progressbar', { name: '주제 연구 학습 진행률' })).toHaveAttribute('value', '40')
  await page.getByRole('button', { name: '주제 연구 휴강 처리', exact: true }).click()
  await expect(page.getByRole('button', { name: '주제 연구 휴강 해제', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '주제 연구 휴강 해제', exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true)
  await page.screenshot({ path: info.outputPath('dashboard-task-list.png') })
  if (info.project.name === 'desktop') {
    for (const [width, height] of [[1366, 768], [1280, 720], [1366, 600]]) {
      await page.setViewportSize({ width, height })
      await cardsInOneColumn(page)
      expect(await list.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true)
      await page.screenshot({ path: info.outputPath(`tasks-${width}x${height}.png`) })
    }
  }
})

test('only the fifth and later courses scroll, with a fixed heading and unchanged surrounding areas', async ({ page }, info) => {
  await page.goto('/dashboard')
  await ready(page)
  const before = await restOfDashboard(page)
  for (const count of [2, 4, 5, 7]) {
    await mount(page, count)
    const list = page.getByRole('list', { name: '과목별 해야 할 일' })
    await list.evaluate(el => { el.scrollTop = 0 })
    await cardsInOneColumn(page)
    const scrollable = await list.evaluate(el => el.scrollHeight > el.clientHeight + 1)
    expect(scrollable).toBe(count > 4)
    expect(await restOfDashboard(page)).toEqual(before)
    if (count > 4) {
      const headingBefore = await page.getByRole('heading', { name: '해야 할 일', exact: true }).boundingBox()
      const listBox = await list.boundingBox()
      const fourth = await page.locator('.todo-card').nth(3).boundingBox()
      const fifth = await page.locator('.todo-card').nth(4).boundingBox()
      expect(fourth.y + fourth.height).toBeLessThanOrEqual(listBox.y + listBox.height + 1)
      expect(fifth.y).toBeGreaterThanOrEqual(listBox.y + listBox.height)
      await expect(list).toHaveCSS('overflow-y', 'auto')
      await list.hover()
      await page.mouse.wheel(0, 1000)
      await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
      await expect.poll(async () => {
        const box = await page.locator('.todo-card').last().boundingBox()
        return box.y + box.height
      }).toBeLessThanOrEqual(listBox.y + listBox.height + 1)
      const last = await page.locator('.todo-card').last().boundingBox()
      expect(last.y + last.height).toBeLessThanOrEqual(listBox.y + listBox.height + 1)
      expect(await page.getByRole('heading', { name: '해야 할 일', exact: true }).boundingBox()).toEqual(headingBefore)
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      expect(await restOfDashboard(page)).toEqual(before)
      await page.getByRole('button', { name: `추가 과목 ${count} 휴강 처리`, exact: true }).click()
      await expect(page.getByRole('button', { name: `추가 과목 ${count} 휴강 해제`, exact: true })).toBeVisible()
    }
  }
  await page.screenshot({ path: info.outputPath('task-list-internal-scroll.png') })
})
