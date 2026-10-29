import { expect, test } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

test('capture all active worn compositions and priority items', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'The catalog contact sheets use one fixed comparison viewport.')
  test.setTimeout(120000)
  const phase = process.env.MORAM_AUDIT_PHASE || 'after'
  const output = `artifacts/item-quality/${phase}`
  await mkdir(output, { recursive: true })
  await page.setViewportSize({ width: 1200, height: 1500 })
  await page.goto('/tests/fixtures/item-audit.html')
  await expect.poll(() => page.evaluate(() => window.auditCatalog?.length)).toBe(86)
  const catalog = await page.evaluate(() => window.auditCatalog)
  if (phase !== 'before') {
    const original = JSON.parse(await readFile('tests/fixtures/item-economy-baseline.json', 'utf8'))
    const retired = JSON.parse(await readFile('src/data/retiredItemIds.json', 'utf8'))
    expect(catalog.map(({ id, price }) => ({ id, price }))).toEqual(original.filter(item => !retired.includes(item.id)))
  }
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  await page.evaluate(() => document.fonts.ready)
  for (let offset = 0; offset < catalog.length; offset += 12) {
    const ids = catalog.slice(offset, offset + 12).map(item => item.id)
    await page.evaluate(ids => window.showAudit(ids), ids)
    await expect(page.locator('.audit-card')).toHaveCount(ids.length)
    await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
    await page.locator('.audit-grid').screenshot({ path: `${output}/sheet-${String(offset / 12 + 1).padStart(2, '0')}.png` })
  }
  await page.evaluate(() => window.showAudit(['red-varsity-jacket', 'pastel-purple-pom-beanie', 'pastel-green-ong-varsity']))
  await expect(page.locator('.audit-card')).toHaveCount(3)
  await page.locator('.audit-grid').evaluate(node => { node.style.gridTemplateColumns = 'repeat(3,460px)' })
  await page.locator('.audit-stage .ong-avatar').evaluateAll(nodes => nodes.forEach(node => { node.style.width = '400px'; node.closest('.audit-stage').style.cssText = 'width:440px;height:650px;padding-top:60px;display:grid;place-items:end center;background:#1e4275' }))
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
  for (const id of ['red-varsity-jacket', 'pastel-purple-pom-beanie', 'pastel-green-ong-varsity']) await page.locator(`[data-audit-id="${id}"] .audit-stage`).screenshot({ path: `${output}/${id}.png` })
  await writeFile(`${output}/manifest.json`, JSON.stringify({ count: catalog.length, catalog, errors }, null, 2))
  expect(errors).toEqual([])
})

test('capture representative combinations and verify attachment planes', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'The combination sheet uses one fixed comparison viewport.')
  const output = 'artifacts/item-quality/after'
  await mkdir(output, { recursive: true })
  await page.setViewportSize({ width: 1200, height: 1500 })
  await page.goto('/tests/fixtures/item-audit.html')
  const combinations = [
    { name: '초록 점퍼 · 비니 · 안경 · 배지 · 가방', ids: ['pastel-green-ong-varsity', 'pastel-purple-pom-beanie', 'round-glasses', 'pastel-clover-badge', 'pastel-cream-ong-bag', 'black-shoes'] },
    { name: '빨간 점퍼 기준 · 헤드폰 · 목도리', ids: ['red-varsity-jacket', 'blue-headphones', 'cream-scarf', 'red-bag', 'round-glasses'] },
    { name: '파란 재킷 · 백팩 · 버킷햇 · 안경', ids: ['blue-collar-jacket', 'pastel-purple-ong-backpack', 'pastel-yellow-ong-bucket-hat', 'pastel-red-round-glasses'] },
    { name: '분홍 니트 · 하트 장식 조합', ids: ['color-pink', 'pastel-pink-heart-sweater', 'pastel-pink-hair-bow', 'pastel-pink-heart-sunglasses', 'pastel-pink-heart-bag'] },
    { name: '체리 가디건 · 배지 위치 분리', ids: ['pastel-cherry-cardigan', 'pastel-blue-bear-beanie', 'pastel-daisy-badge', 'pastel-yellow-frame-glasses', 'pastel-cream-bow-tote'] },
    { name: '남색 코트 · 목도리 세트', ids: ['pastel-navy-scarf-coat', 'pastel-brown-aviator-hat', 'pastel-yellow-star-bag', 'pastel-ong-badge'] },
    { name: '빨간 재킷 · 고양이 비니', ids: ['red-varsity-jacket', 'pastel-black-cat-beanie', 'pastel-white-cat-glasses'] },
    { name: '크림 후드 · 곰 가방 세트', ids: ['pastel-cream-bear-bag-hoodie', 'cream-bonnet', 'pastel-silver-round-glasses'] },
    { name: '그린 스카프 · 개구리 가방 · 배지', ids: ['color-mint', 'yellow-hoodie', 'green-bow', 'pastel-green-frog-bag', 'pastel-carrot-badge', 'gray-earflap-hat'] },
    { name: '분홍 니트 · 토끼 머리띠 · 선글라스', ids: ['pastel-pink-heart-sweater', 'pastel-yellow-rabbit-headband', 'pastel-blue-sunglasses', 'pastel-brown-bear-bag'] },
    { name: '털 목 장식 · 줄무늬 니트', ids: ['pastel-cream-stripe-sweater', 'pastel-cream-fur-neck-ribbon', 'pastel-pink-cat-headband', 'pastel-star-badge', 'pastel-black-ong-bag'] },
    { name: '맨몸 · 모자 · 단추 · 신발', ids: ['color-lavender', 'beige-brim-hat', 'classic-buttons', 'black-shoes', 'pastel-purple-cat-sunglasses'] },
  ]
  await expect.poll(() => page.evaluate(() => typeof window.showCombinations)).toBe('function')
  await page.evaluate(combinations => window.showCombinations(combinations), combinations)
  await expect(page.locator('.audit-card')).toHaveCount(12)
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
  const backpack = page.locator('[data-item-id="pastel-purple-ong-backpack"]')
  await expect(backpack.locator('[data-render-plane="behind-body"]')).toHaveCSS('z-index', '18')
  await expect(backpack.locator('[data-render-plane="front"]')).toHaveCSS('z-index', '34')
  expect(await page.locator('[data-audit-id="combination-0"] [data-slot="badge"]').evaluate(node => node.style.left)).toBe('26%')
  await page.locator('.audit-grid').screenshot({ path: `${output}/combinations.png` })
  await writeFile(`${output}/combinations.json`, JSON.stringify(combinations, null, 2))
})

test('refined items persist through shop, inventory and dashboard at viewport size', async ({ page }, info) => {
  const key = 'moram.demo.local-user.economy.v1'
  const ids = ['pastel-green-ong-varsity', 'pastel-purple-pom-beanie', 'pastel-purple-ong-backpack', 'pastel-heart-badge', 'pastel-red-round-glasses']
  await page.addInitScript(({ key, ids }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, userId: 'local-demo-user', coinBalance: 73, ownedItemIds: ['color-white', ...ids], equippedItems: {}, rewardHistory: { 'quiz:preserved': 3 } }))
  }, { key, ids })
  await page.goto('/shop?tab=inventory')
  for (const id of ids) {
    await page.locator(`[data-product-id="${id}"]`).click()
    await page.getByRole('button', { name: '착용하기', exact: true }).click()
  }
  await page.getByRole('button', { name: '현재 착용 모습 보기', exact: true }).click()
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await mkdir('artifacts/item-quality/after', { recursive: true })
  await page.screenshot({ path: `artifacts/item-quality/after/inventory-${info.project.name}.png` })
  await page.locator('.wardrobe-preview').screenshot({ path: `artifacts/item-quality/after/preview-${info.project.name}.png` })
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  expect(saved.coinBalance).toBe(73)
  expect(saved.rewardHistory).toEqual({ 'quiz:preserved': 3 })
  await page.reload()
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(5)
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)).toEqual(saved)
  await page.goto('/dashboard')
  await expect(page.locator('.ong-avatar__wearable')).toHaveCount(5)
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `artifacts/item-quality/after/dashboard-${info.project.name}.png` })
})
