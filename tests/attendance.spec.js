import { expect, test } from '@playwright/test'

const key = 'moram.subjects.v1'
const economyKey = 'moram.demo.local-user.economy.v1'
const card = (page, name) => page.locator('.material-course').filter({ has: page.getByText(name, { exact: true }) })
async function expand(page, name) { const course = card(page, name); await course.locator('.material-course__toggle').click(); return course }

test('every subject has 14 editable weeks, old data migrates and independent attendance survives reload', async ({ page }, info) => {
  await page.goto('/materials')
  const previous = await page.evaluate(key => { const old = JSON.parse(localStorage.getItem(key)); delete old.attendance; localStorage.setItem(key, JSON.stringify(old)); return old }, key)
  await page.reload()
  const migrated = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  expect(migrated).toEqual({ ...previous, attendance: {} })
  await page.getByRole('combobox', { name: '학기 선택', exact: true }).selectOption('all')
  const courses = page.locator('.material-course')
  await expect(courses).toHaveCount(8)
  for (const course of await courses.all()) {
    await course.locator('.material-course__toggle').click()
    await expect(course.getByRole('columnheader')).toHaveCount(14)
    await expect(course.locator('.attendance-select')).toHaveCount(14)
    for (const input of await course.locator('.attendance-select').all()) await expect(input).toHaveValue('unset')
  }
  const values = [['디지털 디자인', 1, 'present'], ['성찰과 표현', 2, 'absent'], ['세계와 시민', 3, 'late'], ['주제 연구', 14, 'cancelled']]
  for (const [name, week, value] of values) await page.getByRole('combobox', { name: `${name} ${week}주 출결`, exact: true }).selectOption(value)
  await expect(page.getByRole('combobox', { name: '사진 1 1주 출결', exact: true })).toHaveValue('unset')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.reload()
  for (const [name, week, value] of values) {
    await expand(page, name)
    await expect(page.getByRole('combobox', { name: `${name} ${week}주 출결`, exact: true })).toHaveValue(value)
  }
  const design = page.getByRole('combobox', { name: '디지털 디자인 1주 출결', exact: true })
  await design.selectOption('absent')
  await design.selectOption('unset')
  await expect(design).toHaveValue('unset')
  await card(page, '디지털 디자인').getByRole('button', { name: '출결 접기', exact: true }).click()
  await expect(card(page, '디지털 디자인').getByRole('table')).toHaveCount(0)
  await card(page, '디지털 디자인').getByRole('button', { name: '출결 확인', exact: true }).click()
  await expect(design).toHaveValue('unset')
  await page.evaluate(() => document.fonts.ready)
  await card(page, '디지털 디자인').screenshot({ path: info.outputPath('subject-attendance.png') })
})

test('new subject attendance follows its ID, rejects failed saves and is deleted with the subject', async ({ page }) => {
  await page.goto('/materials')
  const economy = await page.evaluate(key => localStorage.getItem(key), economyKey)
  await page.getByRole('button', { name: '＋ 과목 추가', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('과목 이름 (필수)', { exact: true }).fill('출결 입력 과목')
  await dialog.getByLabel('교수 이름 (필수)', { exact: true }).fill('담당 교수')
  await dialog.getByRole('button', { name: '과목 등록', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  const subjectId = (await card(page, '출결 입력 과목').getByRole('link', { name: '과목 홈 바로가기 →', exact: true }).getAttribute('href')).split('/').pop()
  await expand(page, '출결 입력 과목')
  const week = page.getByRole('combobox', { name: '출결 입력 과목 4주 출결', exact: true })
  await week.selectOption('late')
  await page.evaluate(key => {
    const original = Storage.prototype.setItem
    window.restoreAttendanceStorage = () => { Storage.prototype.setItem = original }
    Storage.prototype.setItem = function (name, value) { if (name === key) throw new DOMException('quota', 'QuotaExceededError'); return original.call(this, name, value) }
  }, key)
  await week.selectOption('present')
  await expect(card(page, '출결 입력 과목').getByRole('alert')).toContainText('아직 저장되지 않았습니다')
  await expect(week).toHaveValue('late')
  await page.evaluate(() => window.restoreAttendanceStorage())
  await page.getByRole('button', { name: '출결 입력 과목 과목 수정', exact: true }).click()
  await page.getByRole('dialog').getByLabel('과목 이름 (필수)', { exact: true }).fill('수정된 출결 과목')
  await page.getByRole('dialog').getByRole('button', { name: '변경 저장', exact: true }).click()
  await expect(page.getByRole('combobox', { name: '수정된 출결 과목 4주 출결', exact: true })).toHaveValue('late')
  await page.getByRole('button', { name: '수정된 출결 과목 과목 삭제', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('출결 기록')
  await page.getByRole('dialog').getByRole('button', { name: '삭제하기', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(({ key, id }) => Object.hasOwn(JSON.parse(localStorage.getItem(key)).attendance, id), { key, id: subjectId })).toBe(false)
  expect(await page.evaluate(key => localStorage.getItem(key), economyKey)).toBe(economy)
})
