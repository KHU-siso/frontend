import { expect, test } from '@playwright/test'

const retired = ['pastel-pink-fur-cape', 'pastel-cream-drawstring-hoodie', 'pastel-blue-ong-hoodie', 'pastel-purple-bag-hoodie']
const key = 'moram.demo.local-user.economy.v1'

test('removed products disappear and saved coins, other ownership and equipment survive', async ({ page }) => {
  await page.addInitScript(({ key, retired }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, userId: 'local-demo-user', coinBalance: 73, ownedItemIds: ['color-white', 'blue-cap', 'round-glasses', 'gray-check-jacket', ...retired], equippedItems: { outfit: 'pastel-purple-bag-hoodie', headwear: 'blue-cap', faceAccessory: 'round-glasses' }, rewardHistory: { 'quiz:preserved': 3 } }))
  }, { key, retired })
  await page.goto('/shop')
  await expect(page.locator('.wardrobe-item')).toHaveCount(86)
  for (const id of retired) await expect(page.locator(`[data-product-id="${id}"]`)).toHaveCount(0)
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  expect(stored).toMatchObject({ coinBalance: 73, ownedItemIds: ['color-white', 'blue-cap', 'round-glasses', 'gray-check-jacket'], equippedItems: { headwear: 'blue-cap', faceAccessory: 'round-glasses' }, rewardHistory: { 'quiz:preserved': 3 } })
  const cleaned = await page.evaluate(async ({ key, retired }) => {
    const { readEconomy, demoReducer, initialDemoState } = await import('/src/state/demoReducer.js')
    return retired.map(id => {
      const state = initialDemoState()
      const invalidBuy = demoReducer(state, { type: 'BUY', id })
      const invalidEquip = demoReducer(state, { type: 'EQUIP', id })
      return { cleaned: readEconomy({ getItem: () => JSON.stringify({ version: 2, userId: 'local-demo-user', ...JSON.parse(localStorage.getItem(key)), ownedItemIds: ['color-white', id], equippedItems: { outfit: id } }) }), unchangedBuy: JSON.stringify(invalidBuy.economy) === JSON.stringify(state.economy), unchangedEquip: JSON.stringify(invalidEquip.economy) === JSON.stringify(state.economy) }
    })
  }, { key, retired })
  for (const result of cleaned) expect(result).toMatchObject({ cleaned: { coinBalance: 73, ownedItemIds: ['color-white'], equippedItems: {}, rewardHistory: { 'quiz:preserved': 3 } }, unchangedBuy: true, unchangedEquip: true })
  await page.getByRole('link', { name: /^내 보관함 \(/ }).click()
  await expect(page.locator('.wardrobe-item')).toHaveCount(4)
  await expect(page.locator('.ong-avatar [data-slot="outfit"]')).toHaveCount(0)
  await page.locator('[data-product-id="gray-check-jacket"]').click()
  await page.getByRole('button', { name: '착용하기', exact: true }).click()
  await page.reload()
  await expect(page.locator('.ong-avatar [data-slot="outfit"]')).toHaveAttribute('data-item-id', 'gray-check-jacket')
  await expect(page.getByTestId('coin-balance')).toHaveText('73 COIN')
  await page.goto('/dashboard')
  await expect(page.locator('.ong-avatar [data-slot="outfit"]')).toHaveAttribute('data-item-id', 'gray-check-jacket')
})
