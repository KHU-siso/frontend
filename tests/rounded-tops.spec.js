import { expect, test } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

test('inspect every outfit worn on the unchanged Ong at actual preview sizes', async ({ page }, info) => {
  test.setTimeout(120000)
  const phase = process.env.MORAM_TOPS_PHASE || 'after'
  const output = `artifacts/rounded-tops/${phase}/${info.project.name}`
  await mkdir(output, { recursive: true })
  await page.goto('/tests/fixtures/item-audit.html')
  await expect.poll(() => page.evaluate(() => typeof window.showAudit)).toBe('function')
  const catalog = await page.evaluate(() => window.auditCatalog)
  const baseline = JSON.parse(await readFile('tests/fixtures/item-economy-baseline.json', 'utf8'))
  const retired = JSON.parse(await readFile('src/data/retiredItemIds.json', 'utf8'))
  expect(catalog.map(({ id, price }) => ({ id, price }))).toEqual(baseline.filter(item => !retired.includes(item.id)))
  const outfits = catalog.filter(item => item.slot === 'outfit')
  expect(outfits).toHaveLength(15)
  const ordered = [outfits.find(i => i.id === 'gray-check-jacket'), ...outfits.filter(i => i.id !== 'gray-check-jacket')]
  if (info.project.name !== 'desktop') await page.addStyleTag({ content: '.audit-grid.audit-grid{grid-template-columns:repeat(4,248px)}.audit-grid .audit-stage{width:228px;height:347px}.audit-grid .audit-stage .ong-avatar{width:208px}' })
  for (let offset = 0; offset < ordered.length; offset += 8) {
    const items = ordered.slice(offset, offset + 8)
    await page.evaluate(ids => window.showAudit(ids), items.map(item => item.id))
    await expect(page.locator('.audit-card')).toHaveCount(items.length)
    await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
    await page.locator('.audit-grid').screenshot({ path: `${output}/sheet-${offset / 8 + 1}.png` })
  }
  // Close-ups use the same 400px desktop / 208px mobile avatar as the real shop.
  for (const item of outfits) {
    await page.evaluate(id => window.showAudit([id]), item.id)
    await expect(page.locator('.audit-card')).toHaveCount(1)
    const size = info.project.name === 'desktop' ? 400 : 208
    await page.locator('.audit-grid').evaluate((grid, size) => { grid.style.gridTemplateColumns = `${size + 40}px` }, size)
    await page.locator('.audit-stage').evaluate((stage, size) => { stage.style.width = `${size + 20}px`; stage.style.height = `${size * 2448 / 1660 + 40}px`; stage.querySelector('.ong-avatar').style.width = `${size}px` }, size)
    await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
    await page.locator('.audit-stage').screenshot({ path: `${output}/${item.id}.png` })
  }
  await writeFile(`${output}/catalog.json`, JSON.stringify(outfits, null, 2))
})

test('rounded outfits share thumbnails, persisted equipment and dashboard without masking sleeves', async ({ page }, info) => {
  const visual = JSON.parse(await readFile('src/data/itemVisualOverrides.json', 'utf8'))
  const ids = Object.keys(visual).filter(id => visual[id].layers?.some(layer => layer.file.startsWith('rounded/')))
  expect(ids).toHaveLength(10)
  const key = 'moram.demo.local-user.economy.v1'
  await page.addInitScript(({ key, ids }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, userId: 'local-demo-user', coinBalance: 47, ownedItemIds: ['color-white', 'gray-check-jacket', ...ids], equippedItems: { outfit: 'red-varsity-jacket' }, rewardHistory: { 'quiz:retained': 3 } }))
  }, { key, ids })
  await page.goto('/shop?tab=inventory')
  const body = await page.locator('.ong-avatar__body').getAttribute('src')
  for (const id of ids) {
    const product = page.locator(`[data-product-id="${id}"]`)
    await product.click()
    const equip = page.getByRole('button', { name: '착용하기', exact: true })
    if (await equip.count()) await equip.click()
    const worn = page.locator(`.ong-avatar [data-item-id="${id}"]`)
    await expect(worn).toHaveCount(1)
    await expect(worn).toHaveCSS('clip-path', 'none')
    await expect(worn).toHaveCSS('overflow', 'visible')
    const source = await product.locator('.item-artwork img').getAttribute('src')
    await expect(worn.locator('img')).toHaveAttribute('src', source)
    await expect(page.locator('.ong-avatar__body')).toHaveAttribute('src', body)
    // A rounded garment remains one continuous opaque span across each torso row.
    // The old sleeve forks left multiple separated spans on these rows.
    const maxRuns = await worn.locator('img').evaluate(async img => {
      await img.decode()
      const canvas = document.createElement('canvas'); canvas.width = 360; canvas.height = 225
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, 360, 225)
      const pixels = ctx.getImageData(0, 0, 360, 225).data
      let maximum = 0
      for (let y = 90; y <= 175; y += 5) {
        let previous = false, runs = 0
        for (let x = 0; x < 360; x++) {
          const opaque = pixels[(y * 360 + x) * 4 + 3] > 128
          if (opaque && !previous) runs++
          previous = opaque
        }
        maximum = Math.max(maximum, runs)
      }
      return maximum
    })
    expect(maxRuns, id).toBe(1)
  }
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
  await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const output = `artifacts/rounded-tops/after/${info.project.name}`
  await mkdir(output, { recursive: true })
  await page.screenshot({ path: `${output}/inventory.png` })
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  expect(stored.coinBalance).toBe(47)
  expect(stored.ownedItemIds).toEqual(expect.arrayContaining(ids))
  expect(stored.rewardHistory).toEqual({ 'quiz:retained': 3 })
  await page.reload()
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)).toEqual(stored)
  await page.goto('/dashboard')
  await expect(page.locator('.ong-avatar [data-slot="outfit"]')).toHaveAttribute('data-item-id', stored.equippedItems.outfit)
  await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `${output}/dashboard.png` })
})
