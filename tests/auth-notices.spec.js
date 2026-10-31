import { expect, test } from '@playwright/test'
import process from 'node:process'

const showNotice = process.env.VITE_SHOW_AUTH_DEMO_NOTICE === 'true'

test('authentication notice flag controls passive copy without pretending to sign in', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('.auth-preview-note')).toHaveCount(0)
  await expect(page.getByRole('link', { name: '대시보드 미리보기' })).toHaveCount(0)
  await expect(page.locator('.login-legal')).toHaveCount(showNotice ? 1 : 0)
  await page.getByLabel('아이디', { exact: true }).fill('notice-check')
  await page.getByLabel('비밀번호', { exact: true }).fill('not-a-real-password')
  await page.getByRole('button', { name: '로그인 하기', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('로그인할 수 없습니다')
  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('button', { name: 'Google로 계속하기' })).toHaveCount(0)
  await page.getByRole('button', { name: '비밀번호 찾기', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('비밀번호 찾기를 진행할 수 없습니다')
})

test('signup notice flag preserves input-only completion and the return-to-login link', async ({ page }) => {
  await page.goto('/signup')
  await page.getByLabel('닉네임', { exact: true }).fill('학습자')
  await page.getByRole('button', { name: '중복확인', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('닉네임을 확인할 수 없습니다')
  await page.getByLabel('비밀번호', { exact: true }).fill('notice-only-password')
  await page.getByLabel('비밀번호 확인', { exact: true }).fill('notice-only-password')
  await page.getByLabel('소속 학교', { exact: true }).fill('대학교')
  await page.getByLabel('학과', { exact: true }).fill('컴퓨터학과')
  await page.getByRole('button', { name: '다음: 학습 성향 선택' }).click()
  await page.getByRole('button', { name: '입력 완료', exact: true }).click()
  await expect(page.getByRole('heading', { name: '입력 완료', exact: true })).toBeVisible()
  await expect(page.getByText('실제 계정은 생성되지 않았습니다.')).toHaveCount(showNotice ? 1 : 0)
  await expect(page.getByRole('link', { name: '대시보드 미리보기' })).toBeVisible()
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain('notice-only-password')
  await page.getByRole('link', { name: '로그인 화면으로 돌아가기' }).click()
  await expect(page).toHaveURL('/login')
})

test('account settings logout keeps its login destination and stored study data', async ({ page }) => {
  await page.goto('/mypage')
  const before = await page.evaluate(() => ({ ...localStorage }))
  const logout = page.locator('.profile-account').getByRole('link', { name: '로그아웃', exact: true })
  await expect(logout).toHaveAttribute('href', '/login')
  await logout.click()
  await expect(page).toHaveURL('/login')
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(before)
})
