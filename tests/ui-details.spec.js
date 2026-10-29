import { expect, test } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import process from 'node:process'

test('each glasses asset aligns both lens centers with the original eyes', async ({ page }, info) => {
  const phase = process.env.MORAM_GLASS_PHASE || 'after'
  const output = `artifacts/ui-details/${phase}/${info.project.name}`
  await mkdir(output, { recursive: true })
  await page.goto('/tests/fixtures/item-audit.html')
  await expect.poll(() => page.evaluate(() => typeof window.showAudit)).toBe('function')
  const items = await page.evaluate(async () => (await import('/src/data/itemCatalog.js')).itemCatalog.filter(item => item.slot === 'faceAccessory').map(item => ({ id: item.id, src: item.layers[0].src, sunglasses: item.id.includes('sunglasses') })))
  expect(items).toHaveLength(8)
  await page.evaluate(ids => window.showAudit(ids), items.map(item => item.id))
  await expect(page.locator('.audit-card')).toHaveCount(8)
  await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
  const measurements = await page.evaluate(async items => {
    const result = []
    for (const item of items) {
      const img = new Image(); img.src = item.src; await img.decode()
      const w = 1000, h = Math.round(w * img.naturalHeight / img.naturalWidth)
      const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h)
      const data = ctx.getImageData(0, 0, w, h).data
      const valid = index => item.sunglasses
        ? data[index * 4 + 3] > 128 && Math.abs(data[index * 4] - 41) < 8 && Math.abs(data[index * 4 + 1] - 58) < 8 && Math.abs(data[index * 4 + 2] - 80) < 8
        : data[index * 4 + 3] < 16
      const visited = new Uint8Array(w * h), queue = new Int32Array(w * h), components = []
      for (let start = 0; start < w * h; start++) {
        if (visited[start] || !valid(start)) continue
        let read = 0, count = 1, sx = 0, sy = 0, border = false
        queue[0] = start; visited[start] = 1
        while (read < count) {
          const n = queue[read++], x = n % w, y = Math.floor(n / w)
          sx += x + 0.5; sy += y + 0.5
          if (x === 0 || y === 0 || x === w - 1 || y === h - 1) border = true
          for (const next of [x ? n - 1 : -1, x < w - 1 ? n + 1 : -1, y ? n - w : -1, y < h - 1 ? n + w : -1]) {
            if (next < 0 || visited[next] || !valid(next)) continue
            visited[next] = 1; queue[count++] = next
          }
        }
        if (!border && count > w * h * 0.001) components.push({ x: sx / count / w, y: sy / count / h, area: count })
      }
      const lenses = components.sort((a, b) => b.area - a.area).slice(0, 2).sort((a, b) => a.x - b.x)
      if (lenses.length !== 2) throw new Error(`${item.id}: could not find both lenses`)
      const card = document.querySelector(`[data-audit-id="${item.id}"]`)
      const art = card.querySelector('.ong-avatar__wearable img').getBoundingClientRect()
      const errors = lenses.map((lens, i) => {
        const eye = card.querySelector(i ? '.ong-avatar__eye-right' : '.ong-avatar__eye-left').getBoundingClientRect()
        return { dx: art.x + art.width * lens.x - (eye.x + eye.width / 2), dy: art.y + art.height * lens.y - (eye.y + eye.height / 2) }
      })
      result.push({ id: item.id, lenses, errors, ratio: img.naturalWidth / img.naturalHeight })
    }
    return result
  }, items)
  await writeFile(`${output}/glasses.json`, JSON.stringify(measurements, null, 2))
  await page.locator('.audit-grid').screenshot({ path: `${output}/glasses.png` })
  if (phase === 'after') for (const item of measurements) for (const error of item.errors) {
    expect(Math.abs(error.dx), `${item.id} horizontal alignment`).toBeLessThan(1)
    expect(Math.abs(error.dy), `${item.id} vertical alignment`).toBeLessThan(1)
  }
})

test('header search, logout label and profile learning info preserve existing data', async ({ page }, info) => {
  const key = 'moram.demo.local-user.economy.v1'
  await page.addInitScript(key => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, userId: 'local-demo-user', coinBalance: 47, ownedItemIds: ['color-white', 'round-glasses', 'blue-cap', 'gray-check-jacket'], equippedItems: { headwear: 'blue-cap', outfit: 'gray-check-jacket', faceAccessory: 'round-glasses' }, rewardHistory: { 'quiz:preserved': 3 } }))
  }, key)
  await page.goto('/dashboard')
  const before = await page.evaluate(key => localStorage.getItem(key), key)
  if (info.project.use.viewport.width < 768) await page.getByRole('button', { name: '검색 열기', exact: true }).click()
  const search = page.getByRole('textbox', { name: '대시보드 과목 검색', exact: true })
  expect(await search.getAttribute('placeholder')).toBeNull()
  const courseCount = await page.locator('.todo-card').count()
  await search.fill('세계')
  await expect(page.locator('.todo-card')).toHaveCount(1)
  await search.clear()
  await expect(page.locator('.todo-card')).toHaveCount(courseCount)
  await mkdir('artifacts/ui-details/after', { recursive: true })
  await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
  await page.screenshot({ path: `artifacts/ui-details/after/dashboard-${info.project.name}.png` })
  await page.getByRole('button', { name: '메뉴 열기', exact: true }).click()
  const logout = page.getByRole('dialog').getByRole('link', { name: '로그아웃하기', exact: true })
  await expect(logout).toHaveAttribute('href', '/login')
  await logout.click()
  await expect(page).toHaveURL('/login')
  await page.goto('/mypage')
  await expect(page.getByRole('heading', { name: '보유 코인', exact: true })).toHaveCount(0)
  await expect(page.getByTestId('coin-balance')).toHaveCount(0)
  await expect(page.locator('.profile-learning-row')).toHaveCount(2)
  await page.getByRole('button', { name: '학습 목표 수정', exact: true }).click()
  await page.getByRole('spinbutton', { name: '하루 학습 시간 (분)', exact: true }).fill('45')
  await page.getByRole('button', { name: '목표 저장', exact: true }).click()
  await expect(page.getByText('하루 45분 학습', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `artifacts/ui-details/after/mypage-${info.project.name}.png`, fullPage: true })
  await page.goto('/shop?tab=inventory')
  await expect(page.getByTestId('coin-balance')).toHaveText('47 COIN')
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(before)
})
