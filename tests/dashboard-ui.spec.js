import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-29T12:00:00+09:00') })
})
async function ready(page) {
  await page.evaluate(() => document.fonts.ready)
}
async function noPageOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true)
}
async function weeklyView(page) {
  const button = page.getByRole('button', { name: '주간 시간표', exact: true })
  if (await button.isVisible()) await button.click()
}
async function capture(page, info, name) {
  await mkdir('artifacts/dashboard-ui', { recursive: true })
  await page.screenshot({ path: `artifacts/dashboard-ui/${name}-${info.project.name}.png` })
}
async function touchScroll(page, list) {
  if (page.viewportSize().width >= 768) return
  await list.evaluate(el => { el.scrollTop = 0 })
  const box = await list.boundingBox()
  const session = await page.context().newCDPSession(page)
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true })
  const x = box.x + box.width / 2, start = box.y + box.height - 15
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: start }] })
  for (let i = 1; i <= 10; i++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: start - (box.height - 30) * i / 10 }] })
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: false })
  await session.detach()
}

test('bell artwork is visually centered and the same notification works on small screens', async ({ page }, info) => {
  await page.goto('/dashboard')
  await ready(page)
  const sizes = info.project.name === 'desktop' ? [1440, 320, 375, 402] : [page.viewportSize().width]
  for (const width of sizes) {
    await page.setViewportSize({ width, height: width > 1000 ? 1024 : 874 })
    const bell = page.getByRole('button', { name: '알림 확인', exact: true })
    await expect(bell).toBeVisible()
    const box = await bell.boundingBox()
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    // Rasterize the actual SVG plus its CSS transform at high resolution and
    // measure the painted bounds, rather than just checking the <img> box.
    const offset = await bell.locator('img').evaluate(async img => {
      await img.decode()
      const css = getComputedStyle(img)
      const width = parseFloat(css.width), height = parseFloat(css.height)
      const canvas = document.createElement('canvas')
      const scale = 10, center = 500
      canvas.width = canvas.height = 1000
      const ctx = canvas.getContext('2d')
      ctx.translate(center, center)
      ctx.scale(scale, scale)
      const transform = new DOMMatrix(css.transform)
      ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f)
      ctx.drawImage(img, -width / 2, -height / 2, width, height)
      const pixels = ctx.getImageData(0, 0, 1000, 1000).data
      let left = 1000, right = 0, top = 1000, bottom = 0
      for (let y = 0; y < 1000; y++) for (let x = 0; x < 1000; x++) if (pixels[(y * 1000 + x) * 4 + 3] > 32) {
        left = Math.min(left, x); right = Math.max(right, x)
        top = Math.min(top, y); bottom = Math.max(bottom, y)
      }
      return { x: ((left + right + 1) / 2 - center) / scale, y: ((top + bottom + 1) / 2 - center) / scale }
    })
    expect(Math.abs(offset.x), JSON.stringify(offset)).toBeLessThanOrEqual(0.6)
    expect(Math.abs(offset.y), JSON.stringify(offset)).toBeLessThanOrEqual(0.6)
    await bell.click()
    await expect(page.getByRole('status')).toContainText('알림 기능을 연결하고 있습니다.')
    await page.getByRole('button', { name: '안내 닫기', exact: true }).click()
    const controls = await page.locator('.app-header > button:visible, .app-header > .brand-logo').evaluateAll(nodes => nodes.map(node => {
      const b = node.getBoundingClientRect(); return { x: b.x, y: b.y, right: b.right, bottom: b.bottom }
    }))
    for (let a = 0; a < controls.length; a++) for (let b = a + 1; b < controls.length; b++) {
      const x = controls[a], y = controls[b]
      expect(x.right <= y.x || y.right <= x.x || x.bottom <= y.y || y.bottom <= x.y).toBe(true)
    }
    await noPageOverflow(page)
    await capture(page, info, `notification-${width}`)
  }
})

test('real shared subjects render four at a time and all seven remain accessible and saved', async ({ page }, info) => {
  await page.goto('/dashboard')
  for (const count of [4, 5, 7]) {
    await page.evaluate(async count => {
      const { createSubjectState, SUBJECTS_KEY } = await import('/src/data/subjectStore.js')
      const data = createSubjectState()
      data.subjects.push(...Array.from({ length: count - 4 }, (_, i) => ({ ...data.subjects[0], id: `scroll-${i}`, name: `추가 과목 ${i + 1}`, source: 'user' })))
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(data))
    }, count)
    await page.reload()
    await ready(page)
    await expect(page.locator('.todo-card')).toHaveCount(count)
    const list = page.getByRole('list', { name: '과목별 해야 할 일' })
    expect(await list.evaluate(el => el.scrollHeight > el.clientHeight + 1)).toBe(count > 4)
    const heading = await page.locator('#tasks-heading').boundingBox()
    const listBox = await list.boundingBox()
    const fourth = await page.locator('.todo-card').nth(3).boundingBox()
    expect(fourth.y + fourth.height).toBeLessThanOrEqual(listBox.y + listBox.height + 1)
    if (count > 4) {
      const fifth = await page.locator('.todo-card').nth(4).boundingBox()
      expect(fifth.y).toBeGreaterThanOrEqual(listBox.y + listBox.height - 1)
      await list.hover()
      await page.mouse.wheel(0, 1000)
      await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
      await touchScroll(page, list)
      // Keyboard scrolling also reaches the final row.
      await list.focus()
      await page.keyboard.press('End')
      await expect.poll(() => list.evaluate(el => el.scrollTop + el.clientHeight >= el.scrollHeight - 1)).toBe(true)
      const last = page.locator('.todo-card').last()
      const lastBox = await last.boundingBox()
      expect(lastBox.y + lastBox.height).toBeLessThanOrEqual(listBox.y + listBox.height + 1)
      const name = await last.locator('h3').innerText()
      await last.getByRole('button', { name: `${name} 휴강 처리`, exact: true }).click()
      await expect(last).toHaveClass(/is-cancelled/)
      expect(await page.locator('#tasks-heading').boundingBox()).toEqual(heading)
      await capture(page, info, `tasks-${count}-scrolled`)
      const href = await last.getByRole('link').getAttribute('href')
      await last.getByRole('link').click()
      await expect(page).toHaveURL(href)
      await page.goto('/dashboard')
      await expect(page.locator('.todo-card').last()).toHaveClass(/is-cancelled/)
    }
    await noPageOverflow(page)
  }
})

test('late schedules and minute-accurate exams scroll with fixed day headers and persist', async ({ page }, info) => {
  await page.goto('/dashboard')
  await weeklyView(page)
  await expect(page.locator('.timetable-hour')).toHaveCount(11)
  expect(await page.locator('.timetable-scroll').evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true)
  await page.getByRole('button', { name: '새 과목 추가', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('시간표 이름', { exact: true }).fill('늦은 학습 일정')
  await dialog.getByRole('combobox', { name: '시작 시간', exact: true }).selectOption('21')
  await dialog.getByRole('combobox', { name: '종료 시간', exact: true }).selectOption('23')
  await dialog.getByRole('button', { name: '추가하기', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.evaluate(() => {
    const key = 'moram.subjects.v1', data = JSON.parse(localStorage.getItem(key))
    const base = data.exams[0]
    data.exams.push(...['20:30', '23:30'].map(time => ({ ...base, id: `late-${time}`, title: `야간 시험 ${time}`, date: '2026-10-29', time })))
    localStorage.setItem(key, JSON.stringify(data))
  })
  await page.reload()
  await ready(page)
  await weeklyView(page)
  await expect(page.locator('.timetable-hour')).toHaveCount(15) // 09–24, nothing after midnight
  const grid = page.locator('.timetable-grid')
  const geometry = await grid.evaluate(el => {
    const hour = value => [...el.querySelectorAll('.timetable-hour')].find(node => node.textContent === value).getBoundingClientRect()
    const exam = [...el.querySelectorAll('.timetable-event')].find(node => node.textContent.includes('야간 시험 20:30')).getBoundingClientRect()
    const a = hour('20'), b = hour('21')
    return { start: exam.y, expected: (a.y + b.y) / 2 + 0.5, height: exam.height, expectedHeight: b.y - a.y - 1 }
  })
  expect(Math.abs(geometry.start - geometry.expected)).toBeLessThan(1)
  expect(Math.abs(geometry.height - geometry.expectedHeight)).toBeLessThan(1)
  const scroll = page.getByRole('region', { name: '주간 시간표 시간대', exact: true })
  const headers = await page.locator('.timetable-day').evaluateAll(nodes => nodes.map(el => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width } }))
  const title = await page.locator('#timetable-heading').boundingBox()
  await scroll.hover()
  await page.mouse.wheel(0, 1600)
  await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
  await touchScroll(page, scroll)
  expect(await page.locator('#timetable-heading').boundingBox()).toEqual(title)
  const after = await page.locator('.timetable-day').evaluateAll(nodes => nodes.map(el => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width } }))
  for (let i = 0; i < 7; i++) for (const dimension of ['x', 'y', 'width']) expect(Math.abs(headers[i][dimension] - after[i][dimension])).toBeLessThan(1)
  await capture(page, info, 'late-timetable')
  await page.getByRole('button', { name: /늦은 학습 일정,/ }).click()
  await expect(page.getByRole('dialog')).toContainText('21:00–23:00')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /야간 시험 23:30,/ }).click()
  await expect(page.getByRole('dialog')).toContainText('2026-10-29 · 23:30')
  await page.keyboard.press('Escape')
  await noPageOverflow(page)
})
