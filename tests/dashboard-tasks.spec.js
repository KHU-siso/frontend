import { expect, test } from '@playwright/test'

// 로그인·서버 상태 API를 가짜로 대체해 실제 대시보드를 끝까지 검증한다. (서버 저장은 store 객체로 확인)
const iso = '2026-10-31T00:00:00.000Z'
const subject = { id: 'cog', name: '인지프', teacher: '김수현', semester: '2026-2', sessionsPerWeek: 1, source: 'user', createdAt: iso, updatedAt: iso }
const task = (id, title, date, extra = {}) => ({ id, subjectId: 'cog', title, date, time: '', completed: false, createdAt: iso, updatedAt: iso, ...extra })
const exam = (id, title, date) => ({ id, subjectId: 'cog', title, date, time: '', createdAt: iso, updatedAt: iso })
const seed = (assignments, exams = [], calendarEvents = []) => ({ version: 1, subjects: [subject], notes: [], exams, assignments, drafts: {}, attendance: {}, pendingFileDeletions: [], calendarEvents, cancellations: [] })

async function setup(page, data) {
  const store = { subjects: data }
  await page.clock.install({ time: new Date('2026-10-31T12:00:00+09:00') })
  await page.addInitScript(() => localStorage.setItem('siso.accessToken', 'test'))
  await page.route('**/api/**', route => {
    const url = new URL(route.request().url())
    const json = body => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname === '/api/auth/me') return json({ id: 1, email: 'a@b.c', nickname: '테스터' })
    const match = url.pathname.match(/^\/api\/state\/(.+)$/)
    if (match && route.request().method() === 'PUT') { store[match[1]] = route.request().postDataJSON().data; return json({ ok: true }) }
    if (match) return json({ data: store[match[1]] ?? null })
    if (url.pathname === '/api/shop') return json({ coin_balance: 0, owned_item_ids: [], equipped_items: {} })
    if (url.pathname === '/api/documents') return json([])
    return json({})
  })
  await page.goto('/dashboard')
  return store
}
const rows = page => page.locator('.todo-item')

test('rows are task-level, sorted with overdue first and completed last', async ({ page }) => {
  await setup(page, seed([
    task('a', '내일 과제', '2026-11-01'),
    task('b', '문제풀이올리기', '2026-10-29'),
    task('c', '끝낸 과제', '2026-10-30', { completed: true }),
    task('d', '다음주 과제', '2026-11-07'),
  ], [exam('e', '중간고사', '2026-11-03')]))
  await expect(rows(page)).toHaveCount(5)
  await expect(rows(page)).toContainText(['문제풀이올리기', '내일 과제', '중간고사', '다음주 과제', '끝낸 과제'])
  await expect(rows(page).nth(0)).toContainText('인지프 · 김수현')
  await expect(rows(page).nth(0).locator('strong')).toHaveText('기한 지남')
  await expect(rows(page).nth(0).locator('strong')).toHaveCSS('color', 'rgb(220, 38, 38)')
  await expect(rows(page).nth(1).locator('strong')).toHaveText('내일')
  await expect(rows(page).nth(1)).toHaveClass(/is-urgent/)
  await expect(rows(page).nth(2).locator('.todo-badge')).toHaveText('시험')
  await expect(rows(page).nth(2).locator('strong')).toHaveText('D-3')
  await expect(rows(page).nth(2).getByRole('checkbox')).toHaveCount(0)
  await expect(rows(page).nth(4)).toHaveClass(/is-done/)
  await expect(page.getByRole('button', { name: /휴강 처리/ })).toHaveCount(0)
})

test('renders every row in the scrollable list with no 더 보기 button', async ({ page }) => {
  await setup(page, seed(Array.from({ length: 8 }, (_, i) => task(`t${i}`, `과제 ${i + 1}`, `2026-11-${String(i + 10).padStart(2, '0')}`))))
  await expect(rows(page)).toHaveCount(8)
  await expect(page.getByRole('button', { name: /더 보기/ })).toHaveCount(0)
})

test('completion toggles, is saved to the server and survives reload', async ({ page }) => {
  const store = await setup(page, seed([task('a', '문제풀이올리기', '2026-11-05'), task('b', '다른 과제', '2026-11-09')]))
  await page.getByRole('checkbox', { name: '문제풀이올리기 완료', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: '문제풀이올리기 완료 취소', exact: true })).toHaveAttribute('aria-checked', 'true')
  await expect(rows(page).last()).toContainText('문제풀이올리기')
  await expect.poll(() => store.subjects.assignments.find(item => item.id === 'a').completed).toBe(true)
  await page.reload()
  await expect(page.getByRole('checkbox', { name: '문제풀이올리기 완료 취소', exact: true })).toBeVisible()
  await page.getByRole('checkbox', { name: '문제풀이올리기 완료 취소', exact: true }).click()
  await expect.poll(() => store.subjects.assignments.find(item => item.id === 'a').completed).toBe(false)
})

test('empty state offers task and exam registration', async ({ page }) => {
  await setup(page, seed([]))
  await expect(page.getByText('해야 할 일이 없어요. 과제나 시험 일정을 등록해 보세요')).toBeVisible()
  await expect(page.getByRole('link', { name: '시험 일정 등록' }).first()).toHaveAttribute('href', '/materials/cog#exams')
  await page.locator('.todo-empty-actions').getByRole('button', { name: '과제 등록' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('휴강 등록 lives in the timetable header and saves a cancellation', async ({ page }) => {
  // 2026-10-31(토)이 속한 주의 일요일 수업
  const store = await setup(page, seed([], [], [{ id: 'ev', subjectId: 'cog', name: '인지프', location: '', day: 6, start: 10, end: 11, color: 0 }]))
  await expect(page.locator('.dashboard-banner')).toBeVisible()
  const timetable = page.getByRole('button', { name: '주간 시간표', exact: true })
  if (await timetable.isVisible()) await timetable.click()
  await page.getByRole('button', { name: '휴강 등록', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('과목').selectOption('cog')
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: '확인' }).click()
  await expect.poll(() => store.subjects.cancellations).toEqual([{ subjectId: 'cog', date: '2026-10-31' }])
})
