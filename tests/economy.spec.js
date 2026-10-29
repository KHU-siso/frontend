import { expect, test } from '@playwright/test'

test('economy reducer rejects duplicate rewards, purchases and invalid saved equipment', async ({ page }) => {
  await page.goto('/dashboard')
  const result = await page.evaluate(async () => {
    const { demoReducer, initialDemoState, readEconomy } = await import('/src/state/demoReducer.js')
    const base = initialDemoState()
    const fresh = { ...base, economy: { coinBalance: 15, ownedItemIds: [], equippedItems: {}, rewardHistory: {} } }
    let bought = demoReducer(fresh, { type: 'BUY', id: 'cream-scarf' })
    bought = demoReducer(bought, { type: 'BUY', id: 'cream-scarf' })
    const doubleBuyBalance = bought.economy.coinBalance
    const ownedOnce = bought.economy.ownedItemIds.length
    const cannotEquipUnowned = demoReducer(bought, { type: 'EQUIP', id: 'round-glasses' }).economy.equippedItems
    bought = demoReducer(bought, { type: 'BUY', id: 'green-bow' })
    bought = demoReducer(bought, { type: 'EQUIP', id: 'cream-scarf' })
    bought = demoReducer(bought, { type: 'EQUIP', id: 'green-bow' })
    const blocked = demoReducer(bought, { type: 'BUY', id: 'round-glasses' })
    const session = { id: 'verified-result', mode: 'practice', status: 'complete', answers: [{ correct: true }, { correct: true }, { correct: true }] }
    let rewarded = { ...fresh, sessions: { [session.id]: session } }
    rewarded = demoReducer(rewarded, { type: 'CLAIM_REWARD', id: session.id })
    rewarded = demoReducer(rewarded, { type: 'CLAIM_REWARD', id: session.id })
    const invalid = readEconomy({ getItem: () => JSON.stringify({ version: 1, userId: 'local-demo-user', coinBalance: -10, ownedItemIds: ['constructor', 'unknown', 'cream-scarf', 'cream-scarf'], equippedItems: { decoration: 'green-bow', head: 'cream-scarf' }, rewardHistory: { bad: -1 } }) })
    return { doubleBuyBalance, ownedOnce, cannotEquipUnowned, replaced: bought.economy.equippedItems, blockedBalance: blocked.economy.coinBalance, blockedOwned: blocked.economy.ownedItemIds, rewardBalance: rewarded.economy.coinBalance, rewardCount: Object.keys(rewarded.economy.rewardHistory).length, invalid }
  })
  expect(result).toMatchObject({ doubleBuyBalance: 9, ownedOnce: 1, cannotEquipUnowned: {}, replaced: { neckAccessory: 'green-bow' }, blockedBalance: 4, blockedOwned: ['cream-scarf', 'green-bow'], rewardBalance: 18, rewardCount: 1, invalid: { coinBalance: 0, ownedItemIds: ['color-white', 'cream-scarf'], equippedItems: {}, rewardHistory: {} } })
})
