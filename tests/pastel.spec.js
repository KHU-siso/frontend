import { expect, test } from '@playwright/test'

const key = 'moram.demo.local-user.economy.v1'
const card = (page, id) => page.locator(`.wardrobe-item[data-product-id="${id}"]`)
async function ready(page) {
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}
async function seed(page, ids = []) {
  await page.addInitScript(({ key, ids }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, userId: 'local-demo-user', coinBalance: 100, ownedItemIds: ['color-white', ...ids], equippedItems: {}, rewardHistory: { 'quiz:preserved': 3 } }))
  }, { key, ids })
}

test('active sheet icons are deduplicated and the original hat is available', async ({ page }, info) => {
  await page.goto('/shop')
  const data = await page.evaluate(async () => {
    const { itemCatalog } = await import('/src/data/itemCatalog.js')
    return { total: itemCatalog.length, unique: new Set(itemCatalog.map(i => i.id)).size, newItems: itemCatalog.filter(i => i.id.startsWith('pastel-')).length, collection: itemCatalog.filter(i => i.tags?.includes('파스텔')).length, aliases: ['red-beret', 'blue-headphones', 'cream-bonnet', 'beige-brim-hat', 'yellow-hoodie', 'brown-toggle-coat', 'blue-collar-jacket', 'red-bag', 'cream-scarf', 'green-bow', 'round-glasses'].map(id => ({ id, count: itemCatalog.filter(i => i.id === id).length })) }
  })
  expect(data).toMatchObject({ total: 86, unique: 86, newItems: 61, collection: 72 })
  expect(data.aliases.every(i => i.count === 1)).toBe(true)
  await page.getByRole('button', { name: '파스텔', exact: true }).click()
  await expect(page.locator('.wardrobe-item')).toHaveCount(72)
  await card(page, 'beige-brim-hat').click()
  await page.getByRole('button', { name: '구매하기', exact: true }).click()
  await expect(page.getByTestId('coin-balance')).toHaveText('5 COIN')
  await expect(page.getByRole('button', { name: '구매 완료 · 보유 중', exact: true })).toBeDisabled()
  await ready(page)
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
  await page.screenshot({ path: info.outputPath('pastel-shop.png'), fullPage: true })
})

test('pastel accessories purchase, badge replacement, persistence and dashboard sharing', async ({ page }, info) => {
  await seed(page)
  await page.goto('/shop')
  const originalBody = await page.locator('.ong-avatar__body').getAttribute('src')
  const ids = ['pastel-pink-hair-bow', 'pastel-clover-badge', 'pastel-cream-ong-bag', 'pastel-pink-heart-scarf', 'pastel-pink-heart-sunglasses']
  for (const id of ids) {
    await card(page, id).click()
    await page.getByRole('button', { name: '구매하기', exact: true }).click()
  }
  await expect(page.getByTestId('coin-balance')).toHaveText('68 COIN')
  await page.getByRole('link', { name: /^내 보관함 \(/ }).click()
  for (const id of ids) {
    await card(page, id).click()
    await page.getByRole('button', { name: '착용하기', exact: true }).click()
  }
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(5)
  await expect(page.locator('.ong-avatar__body')).toHaveAttribute('src', originalBody)
  await ready(page)
  await page.locator('.ong-avatar').screenshot({ path: info.outputPath('pastel-combined.png') })
  await page.reload()
  await expect(page.locator('.ong-avatar [data-slot="badge"]')).toHaveAttribute('data-item-id', 'pastel-clover-badge')
  await page.getByRole('link', { name: '상점', exact: true }).click()
  await card(page, 'pastel-heart-badge').click()
  await page.getByRole('button', { name: '구매하기', exact: true }).click()
  await page.getByRole('link', { name: /보관함에서 착용하기/ }).click()
  await card(page, 'pastel-heart-badge').click()
  await page.getByRole('button', { name: '착용하기', exact: true }).click()
  await expect(page.locator('.ong-avatar [data-slot="badge"]')).toHaveCount(1)
  await expect(page.locator('.ong-avatar [data-slot="badge"]')).toHaveAttribute('data-item-id', 'pastel-heart-badge')
  await page.getByRole('button', { name: '메뉴 열기', exact: true }).click()
  await page.getByRole('dialog').getByRole('link', { name: '홈', exact: true }).click()
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(5)
  const state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  expect(state.coinBalance).toBe(64)
  expect(state.ownedItemIds).toEqual(expect.arrayContaining([...ids, 'pastel-heart-badge', 'color-white']))
  expect(state.rewardHistory).toEqual({ 'quiz:preserved': 3 })
})

test('combined costume decorations cannot be removed or double-equipped as independent layers', async ({ page }) => {
  await seed(page, ['pastel-cream-bear-bag-hoodie', 'pastel-yellow-star-bag', 'pastel-pink-heart-scarf', 'pastel-navy-scarf-coat'])
  await page.goto('/inventory')
  for (const id of ['pastel-yellow-star-bag', 'pastel-cream-bear-bag-hoodie']) {
    await card(page, id).click()
    await page.getByRole('button', { name: '착용하기', exact: true }).click()
  }
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(1)
  await expect(page.locator('.wardrobe-selection')).toContainText('따로 해제할 수 없습니다')
  await expect(page.locator('.wardrobe-equipped')).toContainText('크림 후드·곰 가방 세트에 포함')
  await expect(page.getByRole('button', { name: '가방 해제', exact: true })).toHaveCount(0)
  await card(page, 'pastel-yellow-star-bag').click()
  await expect(page.locator('.wardrobe-selection')).toContainText('전체가 해제됩니다')
  await page.getByRole('button', { name: '착용하기', exact: true }).click()
  await expect(page.locator('.ong-avatar [data-slot="outfit"]')).toHaveCount(0)
  for (const id of ['pastel-pink-heart-scarf', 'pastel-navy-scarf-coat']) {
    await card(page, id).click()
    await page.getByRole('button', { name: '착용하기', exact: true }).click()
  }
  await expect(page.locator('.ong-avatar [data-slot="neckAccessory"]')).toHaveCount(0)
  await expect(page.locator('.wardrobe-equipped')).toContainText('남색 코트·체크 목도리 세트에 포함')
  await page.reload()
  await expect(page.locator('.ong-avatar [data-item-id="pastel-navy-scarf-coat"]')).toHaveCount(1)
  await page.getByRole('button', { name: '모두 해제', exact: true }).click()
  await expect(page.getByRole('img', { name: /옹이 기본 모습/ })).toBeVisible()
})

test('all refined vector decorations preview independently without replacing Ong', async ({ page }, info) => {
  test.setTimeout(120000)
  await page.goto('/shop')
  const body = await page.locator('.ong-avatar__body').getAttribute('src')
  const ids = await page.evaluate(async () => (await import('/src/data/itemCatalog.js')).itemCatalog.filter(i => i.id.startsWith('pastel-') || i.id === 'beige-brim-hat').map(i => i.id))
  expect(ids).toHaveLength(62)
  await ready(page)
  for (const id of ids) {
    await card(page, id).click()
    await expect(page.locator(`.ong-avatar [data-item-id="${id}"]`)).toHaveCount(1)
    await page.locator(`.ong-avatar [data-item-id="${id}"] img`).evaluateAll(images => Promise.all(images.map(img => img.decode())))
    await expect(page.locator('.ong-avatar__body')).toHaveAttribute('src', body)
    if (['pastel-red-round-glasses', 'pastel-yellow-frame-glasses', 'pastel-silver-round-glasses', 'pastel-white-cat-glasses'].includes(id)) await expect(page.locator('.ong-avatar__eye-left')).toHaveCSS('z-index', '70')
    if (info.project.name === 'desktop') await page.locator('.ong-avatar').screenshot({ path: info.outputPath(`${id}.png`) })
  }
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  expect(saved.coinBalance).toBe(15)
  expect(saved.equippedItems).toEqual({})
  expect(saved.ownedItemIds).toEqual(['color-white'])
})
