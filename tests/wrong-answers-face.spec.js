import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

test('first visible wrong answer has the Figma face beside the card at every width', async ({ page }, info) => {
  await page.goto('/wrong-answers')
  const first = page.locator('.wrong-card').first()
  const face = first.locator('.wrong-card__face')
  await expect(face).toBeVisible()
  await expect(page.locator('.wrong-card__face')).toHaveCount(1)
  await page.evaluate(() => document.fonts.ready)
  await face.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
  const body = await first.locator('.wrong-card__body').boundingBox()
  const bounds = await face.boundingBox()
  expect(Math.abs(bounds.x - (body.x + body.width))).toBeLessThan(2)
  expect(Math.abs(bounds.y + bounds.height / 2 - (body.y + body.height / 2))).toBeLessThan(2)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(info.project.use.viewport.width)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const background = await face.evaluate(async node => {
    const value = getComputedStyle(node).backgroundImage
    const url = value.startsWith('url("') ? value.slice(5, -2) : value.slice(4, -1)
    const img = new Image(); img.src = url; await img.decode()
    return { width: img.naturalWidth, height: img.naturalHeight }
  })
  expect(background).toEqual({ width: 4955, height: 1772 })
  await mkdir('artifacts/wrong-answers-face', { recursive: true })
  await page.screenshot({ path: `artifacts/wrong-answers-face/${info.project.name}.png`, fullPage: true })
  await first.getByRole('button', { name: '해설', exact: true }).click()
  await expect(first.locator('.wrong-explanation')).toBeVisible()
  await expect(face).toBeVisible()
  const search = page.getByRole('textbox', { name: '과목명 또는 문제 검색' })
  await search.fill('임진왜란')
  await expect(page.locator('.wrong-card__face')).toHaveCount(1)
  await expect(page.locator('.wrong-card').first().locator('.wrong-card__face')).toBeVisible()
})
