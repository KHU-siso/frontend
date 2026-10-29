import { expect, test } from '@playwright/test'

const key = 'moram.subjects.v1'
const card = (page, name) => page.locator('.material-course').filter({ has: page.getByText(name, { exact: true }) })
async function frequency(page, name, count) {
  await page.getByRole('button', { name: `${name} 과목 수정`, exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox', { name: '주당 수업 횟수', exact: true }).selectOption(String(count))
  await dialog.getByRole('button', { name: '변경 저장', exact: true }).click()
  await expect(dialog).toHaveCount(0)
}

test('twice-weekly subjects have independent attendance and frequency changes preserve hidden meetings', async ({ page }, info) => {
  await page.goto('/materials')
  await page.getByRole('button', { name: '＋ 과목 추가', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('과목 이름 (필수)', { exact: true }).fill('주 2회 세미나')
  await dialog.getByLabel('교수 이름 (필수)', { exact: true }).fill('담당 교수')
  await dialog.getByRole('combobox', { name: '주당 수업 횟수', exact: true }).selectOption('2')
  await dialog.getByRole('button', { name: '과목 등록', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  const course = card(page, '주 2회 세미나')
  await course.locator('.material-course__toggle').click()
  await expect(course.getByRole('columnheader')).toHaveCount(14)
  await expect(course.locator('.attendance-select')).toHaveCount(28)
  const entry = (week, session) => page.getByRole('combobox', { name: `주 2회 세미나 ${week}주 ${session}회차 출결`, exact: true })
  for (const [week, session, status] of [[1, 1, 'present'], [1, 2, 'absent'], [2, 2, 'late'], [14, 2, 'cancelled']]) await entry(week, session).selectOption(status)
  await expect(entry(2, 1)).toHaveValue('unset')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.reload()
  await course.locator('.material-course__toggle').click()
  await expect(entry(1, 1)).toHaveValue('present')
  await expect(entry(1, 2)).toHaveValue('absent')
  await expect(entry(2, 2)).toHaveValue('late')
  await expect(entry(14, 2)).toHaveValue('cancelled')
  await page.evaluate(() => document.fonts.ready)
  await course.screenshot({ path: info.outputPath('attendance-twice-weekly.png') })
  await frequency(page, '주 2회 세미나', 1)
  await expect(course.locator('.attendance-select')).toHaveCount(14)
  await expect(page.getByRole('combobox', { name: '주 2회 세미나 1주 출결', exact: true })).toHaveValue('present')
  await page.reload()
  await course.locator('.material-course__toggle').click()
  await frequency(page, '주 2회 세미나', 3)
  await expect(course.locator('.attendance-select')).toHaveCount(42)
  await expect(entry(1, 2)).toHaveValue('absent')
  await expect(entry(2, 2)).toHaveValue('late')
  await expect(entry(1, 3)).toHaveValue('unset')
  await entry(1, 3).selectOption('cancelled')
  await page.reload()
  await course.locator('.material-course__toggle').click()
  await expect(entry(1, 3)).toHaveValue('cancelled')
})

test('legacy one-entry weeks become the first meeting without resetting other subject data', async ({ page }) => {
  await page.goto('/materials')
  const old = await page.evaluate(key => {
    const data = JSON.parse(localStorage.getItem(key))
    for (const subject of data.subjects) delete subject.sessionsPerWeek
    data.attendance = { photo: { 1: 'present', 14: 'late' } }
    localStorage.setItem(key, JSON.stringify(data))
    return data
  }, key)
  await page.reload()
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)).toEqual({ ...old, subjects: old.subjects.map(subject => ({ ...subject, sessionsPerWeek: 1 })), attendance: { photo: { 1: { 1: 'present' }, 14: { 1: 'late' } } } })
  const course = card(page, '사진 1')
  await course.locator('.material-course__toggle').click()
  await expect(page.getByRole('combobox', { name: '사진 1 1주 출결', exact: true })).toHaveValue('present')
  await frequency(page, '사진 1', 2)
  await expect(page.getByRole('combobox', { name: '사진 1 1주 1회차 출결', exact: true })).toHaveValue('present')
  await expect(page.getByRole('combobox', { name: '사진 1 14주 1회차 출결', exact: true })).toHaveValue('late')
  await expect(page.getByRole('combobox', { name: '사진 1 1주 2회차 출결', exact: true })).toHaveValue('unset')
  const invalid = await page.evaluate(async () => {
    const { normalizeAttendance } = await import('/src/data/attendance.js')
    try { normalizeAttendance({ photo: { 1: { 8: 'present' } } }, new Set(['photo'])) } catch (error) { return error.message }
  })
  expect(invalid).toContain('원본 데이터는 보존했습니다')
})
