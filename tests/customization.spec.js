import { expect, test } from '@playwright/test'

const key = 'moram.demo.local-user.economy.v1'
async function seed(page, economy) {
  await page.addInitScript(({ key, economy }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, userId: 'local-demo-user', ...economy }))
  }, { key, economy: { coinBalance: 100, ownedItemIds: [], equippedItems: {}, rewardHistory: {}, ...economy } })
}
async function ready(page) {
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}
const product = (page, id) => page.locator(`.wardrobe-item[data-product-id="${id}"]`)

test('expanded products, categories, default white and refined vector hat are visible', async ({ page }, info) => {
  await page.goto('/shop')
  await expect(page.locator('.wardrobe-item')).toHaveCount(86)
  await expect(page.getByTestId('coin-balance')).toHaveText('15 COIN')
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(0)
  await expect(page.locator('.ong-avatar__color-layer')).toHaveCount(0)
  for (const [name, count] of [['컬러', 6], ['옷', 15], ['모자', 20], ['액세서리', 36], ['장식', 14], ['안경', 8], ['코스튬', 3], ['파스텔', 72]]) {
    await page.getByRole('button', { name, exact: true }).click()
    await expect(page.locator('.wardrobe-item')).toHaveCount(count)
  }
  await page.getByRole('button', { name: '전체', exact: true }).click()
  await product(page, 'color-white').click()
  await expect(page.getByRole('button', { name: '무료 · 기본 제공', exact: true })).toBeDisabled()
  await product(page, 'beige-brim-hat').click()
  await expect(page.getByRole('button', { name: '구매하기', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: '판매 준비 중', exact: true })).toHaveCount(0)
  await ready(page)
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  expect(stored).toMatchObject({ version: 2, coinBalance: 15, ownedItemIds: ['color-white'], equippedItems: {} })
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
  await page.screenshot({ path: info.outputPath('expanded-shop.png'), fullPage: true })
})

test('version 1 economy migrates without losing balance, purchases, rewards or equipment', async ({ page }) => {
  const original = { version: 1, userId: 'local-demo-user', coinBalance: 47, ownedItemIds: ['cream-scarf', 'green-bow', 'red-bag', 'bear-hood', 'round-glasses', 'classic-buttons'], equippedItems: { head: 'bear-hood', face: 'round-glasses', outfit: 'classic-buttons', decoration: 'red-bag' }, rewardHistory: { 'quiz:old-completion': 3 } }
  await page.addInitScript(({ key, original }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(original)) }, { key, original })
  await page.goto('/inventory')
  await expect(page.locator('.wardrobe-item')).toHaveCount(7)
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(4)
  const first = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  expect(first).toMatchObject({ version: 2, coinBalance: 47, ownedItemIds: ['color-white', ...original.ownedItemIds], equippedItems: { headwear: 'bear-hood', faceAccessory: 'round-glasses', bodyDecoration: 'classic-buttons', bag: 'red-bag' }, rewardHistory: original.rewardHistory })
  await page.reload()
  await expect(page.getByTestId('coin-balance')).toHaveText('47 COIN')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)).toEqual(first)
})

test('new colors, garments, hats and separate accessory slots share persisted equipment', async ({ page }, info) => {
  await seed(page)
  await page.goto('/shop')
  const originalBody = await page.locator('.ong-avatar__body').getAttribute('src')
  const selected = ['color-mint', 'yellow-hoodie', 'blue-cap', 'red-bag', 'round-glasses', 'black-shoes', 'cream-scarf']
  for (const id of selected) {
    await product(page, id).click()
    await page.getByRole('button', { name: '구매하기', exact: true }).click()
    await expect(page.getByRole('button', { name: '구매 완료 · 보유 중', exact: true })).toBeDisabled()
  }
  await expect(page.getByTestId('coin-balance')).toHaveText('42 COIN')
  await page.getByRole('link', { name: /^내 보관함 \(/ }).click()
  for (const id of selected) {
    await product(page, id).click()
    await page.getByRole('button', { name: '착용하기', exact: true }).click()
  }
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(6)
  await expect(page.locator('.ong-avatar__color-layer')).toHaveCount(2)
  await expect(page.locator('.ong-avatar__color-head')).not.toHaveCSS('mask-image', 'none')
  await expect(page.locator('.ong-avatar__color-body')).not.toHaveCSS('mask-image', 'none')
  await expect(page.locator('.ong-avatar__body')).toHaveAttribute('src', originalBody)
  await ready(page)
  await page.locator('.ong-avatar').screenshot({ path: info.outputPath('combined-ong.png') })
  await page.reload()
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(6)
  await expect(page.locator('.ong-avatar__color-layer')).toHaveCount(2)
  await page.getByRole('button', { name: '메뉴 열기', exact: true }).click()
  await page.getByRole('dialog').getByRole('link', { name: '홈', exact: true }).click()
  await expect(page.locator('.ong-avatar__color-layer')).toHaveCount(2)
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(6)
  await page.goto('/inventory')
  await product(page, 'color-white').click()
  await page.getByRole('button', { name: '착용하기', exact: true }).click()
  await expect(page.locator('.ong-avatar__color-layer')).toHaveCount(0)
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(6)
  await expect(page.getByTestId('coin-balance')).toHaveText('42 COIN')
})

test('core items render from original assets and can be applied independently', async ({ page }, info) => {
  await page.goto('/shop')
  const items = await page.evaluate(async () => (await import('/src/data/itemCatalog.js')).itemCatalog.filter(i => i.available && !i.id.startsWith('pastel-')).map(i => ({ id: i.id, slot: i.slot })))
  await page.evaluate(({ key, items }) => localStorage.setItem(key, JSON.stringify({ version: 2, userId: 'local-demo-user', coinBalance: 15, ownedItemIds: items.map(i => i.id), equippedItems: {}, rewardHistory: {} })), { key, items })
  await page.goto('/inventory')
  await expect(page.locator('.wardrobe-item')).toHaveCount(25)
  await ready(page)
  for (const item of items) {
    const reset = page.getByRole('button', { name: '모두 해제', exact: true })
    if (await reset.isEnabled()) await reset.click()
    await product(page, item.id).click()
    if (item.id !== 'color-white') await page.getByRole('button', { name: '착용하기', exact: true }).click()
    await ready(page)
    await expect(page.getByRole('img', { name: /^옹이 / })).toBeVisible()
    if (item.id !== 'color-white') expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)).equippedItems[item.slot]).toBe(item.id)
    if (info.project.name === 'desktop') await page.locator('.ong-avatar').screenshot({ path: info.outputPath(`${item.id}.png`) })
  }
})

test('new slot replacement, garment conflicts and invalid purchases are guarded atomically', async ({ page }) => {
  await page.goto('/shop')
  const result = await page.evaluate(async () => {
    const { demoReducer, initialDemoState } = await import('/src/state/demoReducer.js')
    const base = initialDemoState()
    let state = { ...base, economy: { ...base.economy, coinBalance: 50, ownedItemIds: ['color-white', 'color-pink', 'color-mint', 'blue-cap', 'red-beret', 'classic-buttons', 'yellow-hoodie'] } }
    for (const id of ['color-pink', 'color-mint', 'blue-cap', 'red-beret', 'classic-buttons', 'yellow-hoodie']) state = demoReducer(state, { type: 'EQUIP', id })
    const outfit = state.economy.equippedItems
    state = demoReducer(state, { type: 'EQUIP', id: 'classic-buttons' })
    const buttons = state.economy.equippedItems
    const before = JSON.stringify(state.economy)
    for (const id of ['color-white', 'constructor', 'unknown']) state = demoReducer(state, { type: 'BUY', id })
    const unchanged = JSON.stringify(state.economy) === before
    state = demoReducer(state, { type: 'EQUIP', id: 'round-glasses' })
    return { outfit, buttons, unchanged, final: state.economy }
  })
  expect(result.outfit).toEqual({ bodyColor: 'color-mint', headwear: 'red-beret', outfit: 'yellow-hoodie' })
  expect(result.buttons).toEqual({ bodyColor: 'color-mint', headwear: 'red-beret', bodyDecoration: 'classic-buttons' })
  expect(result.unchanged).toBe(true)
  expect(result.final.coinBalance).toBe(50)
  expect(result.final.equippedItems).toEqual(result.buttons)
})
