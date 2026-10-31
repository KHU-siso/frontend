import { expect, test } from '@playwright/test'

const economyKey = 'moram.demo.local-user.economy.v1'
async function completeQuiz(page, answers) {
  await page.goto('/study/setup')
  await page.getByRole('spinbutton', { name: /오늘 풀 문제/ }).fill(String(answers.length))
  await page.getByRole('button', { name: '넘어가기', exact: true }).click()
  await page.getByRole('button', { name: '세계와 시민', exact: true }).click()
  await page.getByRole('button', { name: '넘어가기', exact: true }).click()
  await page.getByRole('button', { name: /^문제 풀기/ }).click()
  await page.getByRole('button', { name: '넘어가기', exact: true }).click()
  await page.getByRole('button', { name: '객관식', exact: true }).click()
  await page.getByRole('button', { name: '학습 시작', exact: true }).click()
  for (let i = 0; i < answers.length; i++) {
    await page.locator(`input[type="radio"][value="${answers[i]}"]`).check()
    await page.getByRole('button', { name: '정답 확인', exact: true }).click()
    await page.getByRole('button', { name: i === answers.length - 1 ? '결과 확인' : '다음 문제로 넘어가기', exact: true }).click()
  }
  await page.getByRole('link', { name: '코인 보상 확인', exact: true }).click()
}
async function ready(page) {
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  for (const selector of ['.coin-ong', '.coin-reward__heading', '.coin-reward__balance', '.coin-reward__primary']) {
    const box = await page.locator(selector).boundingBox()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width + 1)
  }
}

test('original Figma coin Ong renders with a single claim and the next-study action', async ({ page }, info) => {
  await completeQuiz(page, ['1592', '국민 주권', '파리 협정'])
  await expect(page.getByRole('heading', { name: '정답이에요!', exact: true })).toBeVisible()
  await expect(page.locator('.coin-reward__amount')).toHaveText('+3COIN')
  await expect(page.getByTestId('coin-balance')).toHaveText('15 COIN')
  await expect(page.locator('.study-header__progress')).toHaveCount(0)
  await expect(page.locator('.coin-ong img')).toHaveCount(7)
  await ready(page)
  const ratios = await page.locator('.coin-ong img').evaluateAll(images => images.map(img => ({ natural: img.naturalWidth / img.naturalHeight, rendered: img.getBoundingClientRect().width / img.getBoundingClientRect().height })))
  for (const ratio of ratios) expect(Math.abs(ratio.natural - ratio.rendered)).toBeLessThan(0.02)
  await page.getByRole('button', { name: '코인 받기', exact: true }).click()
  await expect(page.getByTestId('coin-balance')).toHaveText('18 COIN')
  await expect(page.getByRole('status')).toContainText('보상 지급 완료')
  await expect(page.getByRole('button', { name: '코인 받기', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: '다음 문제풀기', exact: true })).toBeVisible()
  await page.screenshot({ path: info.outputPath('figma-coin-reward.png'), fullPage: true })
  if (info.project.name === 'desktop') {
    for (const [width, height] of [[1024, 729], [1768, 1305], [1366, 768]]) {
      await page.setViewportSize({ width, height })
      await ready(page)
      await page.screenshot({ path: info.outputPath(`reward-${width}x${height}.png`), fullPage: true })
    }
  }
  await page.goBack()
  await page.getByRole('link', { name: '코인 보상 확인', exact: true }).click()
  await expect(page.getByTestId('coin-balance')).toHaveText('18 COIN')
  await expect(page.getByRole('button', { name: '코인 받기', exact: true })).toHaveCount(0)
  const history = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).rewardHistory, economyKey)
  expect(Object.values(history)).toEqual([3])
  await page.getByRole('link', { name: '코인샵 가기', exact: true }).click()
  await expect(page).toHaveURL('/shop')
  await expect(page.getByTestId('coin-balance')).toHaveText('18 COIN')
})

test('zero reward is honest and missing sessions cannot create coins', async ({ page }) => {
  await completeQuiz(page, ['1600'])
  await expect(page.getByRole('heading', { name: '학습을 완료했어요!', exact: true })).toBeVisible()
  await expect(page.locator('.coin-reward__amount')).toHaveText('+0COIN')
  await expect(page.getByText('이번 학습에서는 지급할 코인이 없습니다.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '학습 완료 확인', exact: true }).click()
  await expect(page.getByTestId('coin-balance')).toHaveText('15 COIN')
  await expect(page.getByRole('status')).toContainText('보상 지급 완료')
  await page.getByRole('link', { name: '다음 문제풀기', exact: true }).click()
  await expect(page).toHaveURL('/study/setup')
  await page.goto('/study/session/missing/reward')
  await expect(page.getByRole('heading', { name: '보상받을 완료 학습이 없습니다' })).toBeVisible()
  await expect(page.getByRole('button', { name: '코인 받기', exact: true })).toHaveCount(0)
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).coinBalance, economyKey)).toBe(15)
})
