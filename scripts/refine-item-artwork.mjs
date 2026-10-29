// Project-local vector refinements. Original Figma exports and economy IDs stay intact.
// Coordinates describe artwork only; the unchanged Ong silhouette remains in OngAvatar.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const retiredItemIds = new Set(JSON.parse(await readFile(`${root}src/data/retiredItemIds.json`, 'utf8')))
const glassesFit = JSON.parse(await readFile(`${root}src/data/glassesFit.json`, 'utf8'))
const folder = `${root}src/assets/items/refined`
await mkdir(folder, { recursive: true })
const roundedFolder = `${root}src/assets/items/rounded`
await mkdir(roundedFolder, { recursive: true })
const roundedTopIds = new Set([
  'red-varsity-jacket', 'pastel-cream-drawstring-hoodie', 'pastel-blue-ong-hoodie',
  'pastel-purple-bag-hoodie', 'pastel-cherry-cardigan', 'pastel-red-collar-cardigan',
  'pastel-navy-sailor-top', 'pastel-pink-heart-sweater', 'pastel-green-ong-varsity',
  'pastel-cream-bear-bag-hoodie', 'pastel-navy-scarf-coat',
  'pastel-blue-cloud-sweater', 'pastel-cream-stripe-sweater',
])
const overrides = {}
const p = (d, fill, stroke = 'none', sw = 3) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`
const e = (x, y, rx, ry, fill, stroke = 'none', sw = 3) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
const r = (x, y, w, h, radius, fill, stroke = 'none', sw = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
const group = (x, y, scale, content) => `<g transform="translate(${x} ${y}) scale(${scale})">${content}</g>`
const line = (d, color, sw = 3) => p(d, 'none', color, sw)
// Lens centers were measured from each actual SVG's enclosed lens area in Edge.
// Fit eyewear to the existing eyes, never move or resize the character itself.
function glassesPlacement(id) {
  const fit = glassesFit[id], stageRatio = 2448 / 1660
  const leftEyeX = 37.05 + 4.28 / 2, rightEyeX = 57.17 + 4.4 / 2
  const eyeY = 30.02 + ((4.28 * 75 / 71 + 4.4 * 75 / 73) / 4) / stageRatio
  const width = (rightEyeX - leftEyeX) / (fit.right.x - fit.left.x)
  return {
    left: leftEyeX - width * fit.left.x,
    top: eyeY - width * (fit.left.y + fit.right.y) / 2 / fit.ratio / stageRatio,
    width,
  }
}
const palette = {
  blue: ['#398deb', '#18569d', '#a6d7ff'], purple: ['#ae7bea', '#7444ac', '#d2b1fa'],
  pink: ['#ffa7bc', '#d75e83', '#ffdae3'], red: ['#ef3936', '#a82021', '#ffad9e'],
  yellow: ['#ffcf53', '#cb9323', '#fff0b0'], cream: ['#fff3df', '#bf9367', '#fffcf3'],
  green: ['#286f49', '#184b32', '#91b49c'], navy: ['#243f68', '#142a4a', '#7a94b6'],
  black: ['#34363b', '#171b23', '#818692'], brown: ['#a17650', '#65452f', '#d7b38a'],
  darkPurple: ['#594264', '#392d45', '#87708f'], frog: ['#57b96d', '#2d7c44', '#a6dfa5'],
}
function ong(fill = '#fff', eyes = false) {
  return e(0, 2, 11, 12, fill) + e(0, -12, 6.5, 6.5, fill) + (eyes ? e(-2.3, -13, 1, 1, '#18569d') + e(2.3, -13, 1, 1, '#18569d') : '')
}
const bow = (c, s) => p('M47 28 Q12 0 8 20 L10 52 Q15 63 47 38 L27 77 L48 87 L60 46 L77 87 L99 75 L74 38 Q110 62 113 49 L113 20 Q108 0 74 28Z', c, s, 3) + e(60, 32, 10, 14, c, s)
const heart = (c, s = 'none') => p('M0 32 C-65 -8 -26 -62 0 -30 C26 -62 65 -8 0 32Z', c, s, 3)
const star = (c, s = 'none') => p('M0 -42 L13 -14 L44 -10 L21 12 L26 43 L0 28 L-26 43 L-21 12 L-44 -10 L-13 -14Z', c, s, 3)
const cherry = () => line('M0 -24 Q-8 -12 -13 10 M0 -24 Q14 -13 17 9', '#347348', 4) + e(-12, 19, 12, 13, '#ef403e', '#b32b2c', 2) + e(18, 19, 12, 13, '#ef403e', '#b32b2c', 2) + p('M0 -24 Q18 -40 24 -30 Q19 -18 0 -24', '#408451') + line('M-17 13 L-15 10 M13 12 L15 10', '#ffb8a7', 3)
const bear = () => e(-25, -23, 14, 14, '#a37850', '#705037') + e(25, -23, 14, 14, '#a37850', '#705037') + e(0, 3, 41, 34, '#a37850', '#705037') + e(0, 15, 20, 15, '#e6c59d') + e(-13, -3, 3, 4, '#302b24') + e(13, -3, 3, 4, '#302b24') + e(0, 10, 5, 4, '#302b24') + line('M0 14 L0 20 M0 20 Q-5 25 -10 20 M0 20 Q5 25 10 20', '#503b2c', 2)
async function add(id, w, h, art, placement, extra = {}) {
  if (retiredItemIds.has(id)) return
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none">${art}</svg>\n`
  const directory = roundedTopIds.has(id) ? 'rounded' : 'refined'
  await writeFile(`${directory === 'rounded' ? roundedFolder : folder}/${id}.svg`, svg)
  overrides[id] = { ratio: w / h, placement, layers: [{ file: `${directory}/${id}.svg`, x: 0, y: 0, width: 100 }], artworkProvenance: 'Project-local vector refinement of the existing product, not an unmodified Figma export.', ...extra }
}

// Hats use a shallow crown seated on the existing forehead, not a tall floating icon.
for (const [id, color, motif] of [
  ['blue-ong-cap', 'blue', 'ong'], ['green-ong-cap', 'green', 'ong'], ['navy-ong-cap', 'navy', 'ong'],
  ['cream-bear-cap', 'cream', 'bear'], ['pink-ribbon-cap', 'pink', 'bow'], ['red-backward-cap', 'red', 'back'],
]) {
  const [c, s, highlight] = palette[color]
  let art = e(150, 15, 10, 6, c, s, 2) + p('M24 117 Q25 28 150 24 Q275 28 276 117Z', c, s)
  art += line('M150 27 Q89 45 83 113 M150 27 Q211 45 217 113', s, 1.7)
  if (motif === 'back') art += p('M118 112 L118 89 Q150 62 182 89 L182 112', s) + r(119, 94, 62, 17, 7, c, s, 2) + r(139, 97, 19, 11, 3, highlight)
  else art += group(150, 74, 1, motif === 'ong' ? ong() : motif === 'bear' ? ong('#805735') : bow(s, s))
  if (motif === 'bow') art = art.replace('translate(150 74) scale(1)', 'translate(120 46) scale(.5)')
  art += p('M24 109 Q150 82 276 109 Q301 122 282 139 Q273 146 247 137 Q150 109 53 137 Q27 147 18 135 Q6 121 24 109Z', color === 'cream' ? '#9e714e' : c, s)
  await add(`pastel-${id}`, 300, 150, art, { left: 25.5, top: motif === 'back' ? 12.3 : 12, width: 49 })
}
{
  const [c, s] = palette.yellow
  await add('pastel-yellow-ong-bucket-hat', 300, 160,
    p('M59 111 L77 43 Q150 22 223 43 L241 111Z', c, s) + line('M80 51 Q150 33 220 51', '#ffe790', 3) + group(150, 79, 1, ong()) + p('M58 105 Q150 88 242 105 L278 138 Q287 153 260 153 L40 153 Q13 153 22 138Z', c, s) + line('M38 138 Q150 121 262 138', '#f3b82e', 2),
    { left: 24, top: 10.8, width: 52 })
  await add('beige-brim-hat', 300, 150,
    e(150, 118, 145, 27, '#ffda71', '#c28b25') + p('M59 109 L65 34 Q150 7 235 34 L241 109 Q150 135 59 109Z', '#ffe28a', '#c28b25') + e(150, 34, 85, 21, '#ffe8a3', '#d8a537', 2) + p('M61 82 Q150 110 239 82 L241 109 Q150 135 59 109Z', '#2475d6', '#1453a2'),
    { left: 22.5, top: 11.3, width: 55 })
}
for (const [id, color, type] of [['purple-pom-beanie', 'purple', 'pom'], ['blue-bear-beanie', 'blue', 'bear'], ['black-cat-beanie', 'black', 'cat']]) {
  const [c, s, high] = palette[color]
  let art = type === 'pom' ? e(150, 28, 25, 23, c, s) + line('M143 13 Q134 26 145 38 M156 12 Q165 25 155 39', high, 2) : type === 'bear' ? e(80, 53, 25, 25, c, s) + e(220, 53, 25, 25, c, s) : p('M50 71 L57 8 Q83 8 107 48 M193 48 Q217 8 243 8 L250 71', c, s)
  art += p('M39 130 Q38 50 150 48 Q262 50 261 130Z', c, s)
  for (const x of [70, 110, 150, 190, 230]) art += line(`M150 51 Q${x} 72 ${x} 126`, s, 1.5)
  art += p('M36 122 Q150 105 264 122 L270 153 Q270 168 249 169 Q150 156 51 169 Q30 168 30 153Z', c, s)
  for (let x = 49; x < 269; x += 20) art += line(`M${x} 124 L${x} 159`, s, 1.3)
  if (type === 'cat') art += group(150, 97, .8, ong())
  await add(`pastel-${id}`, 300, 180, art, { left: 25.8, top: type === 'pom' ? 9.2 : 9, width: 48.4 })
}
for (const [id, color, animal] of [['pink-cat-headband', 'pink', 'cat'], ['yellow-rabbit-headband', 'yellow', 'rabbit']]) {
  const [c, s, h] = palette[color]
  const ears = animal === 'cat' ? p('M49 95 Q28 26 48 12 Q92 17 110 63 M190 63 Q208 17 252 12 Q272 26 251 95', c, s) + p('M60 69 L59 31 Q83 39 89 66 M211 66 Q217 39 241 31 L240 69', h) : e(86, 52, 20, 49, c, s) + e(214, 52, 20, 49, c, s) + e(86, 54, 9, 33, '#fff7df') + e(214, 54, 9, 33, '#fff7df')
  await add(`pastel-${id}`, 300, 180, ears + p('M40 171 Q36 69 150 67 Q264 69 260 171 Q249 174 247 157 Q239 91 150 91 Q61 91 53 157 Q51 174 40 171Z', c, s), { left: 26, top: animal === 'cat' ? 10.6 : 7.4, width: 48 })
}
for (const [id, color] of [['blue-earflap-hat', 'blue'], ['brown-aviator-hat', 'brown']]) {
  const [c, s] = palette[color]
  let art = p('M43 159 Q20 168 24 201 Q32 214 54 204 L78 142 M257 159 Q280 168 276 201 Q268 214 246 204 L222 142', c, s) + p('M42 151 Q28 48 150 43 Q272 48 258 151 L242 184 Q230 179 228 158 L220 115 L80 115 L72 158 Q70 179 58 184Z', c, s)
  if (color === 'blue') art += p('M62 98 Q74 69 150 73 Q226 69 238 98 L233 133 Q150 120 67 133Z', '#fff3df', '#d2af87') + line('M66 145 L51 190 M234 145 L249 190', '#fff3df', 15)
  else art += line('M39 116 Q150 94 261 116', '#e5c294', 17) + e(102, 114, 40, 30, '#f7ecd4', '#d2af87') + e(198, 114, 40, 30, '#f7ecd4', '#d2af87') + e(102, 114, 29, 21, '#73736c', '#fff8e9', 2) + e(198, 114, 29, 21, '#73736c', '#fff8e9', 2) + line('M83 105 L102 98 M180 105 L199 98', '#afafa0', 3)
  await add(`pastel-${id}`, 300, 220, art, { left: 22, top: color === 'blue' ? 11.8 : 10.6, width: 56 })
}
for (const color of ['pink', 'red', 'yellow', 'purple', 'blue']) {
  const [c, s] = palette[color]
  await add(`pastel-${color}-hair-bow`, 120, 90, bow(c, s), { left: 55.8, top: 16.6, width: 20.5 })
}

// Rounded garment shell follows the reference gray-check jacket's shoulder/side/
// hem curve in a 360-unit canvas. There are no arm panels, sleeve forks or masks.
// The front details and the three inseparable set accessories remain individual.
const roundedShell = 'M269 5 C310 22 382 80 347 180 C310 202 191 233 13 180 C0 146 -5 76 51 29 C62 20 75 12 91 5 C107 17 139 30 180 29 C207 28 237 22 269 5Z'
const roundedHem = 'M21 176 Q180 230 339 176'
function shirt(color, type, motif) {
  const [c, s, high] = palette[color]
  let art = p(roundedShell, c, s, 5.5)
  if (['hood', 'hoodBag', 'bearBag'].includes(type)) {
    art += p('M128 8 Q180 2 232 8 Q259 9 259 28 Q249 46 180 61 Q111 46 101 28 Q101 9 128 8Z', high, s) + p('M112 24 L180 61 L248 24 Q180 43 112 24Z', color === 'cream' ? '#dfc09a' : c, s, 2)
    art += line('M157 54 L154 96 M203 54 L206 96', high, 4) + e(154, 98, 5, 6, high, s, 2) + e(206, 98, 5, 6, high, s, 2)
    art += p('M131 151 L142 134 L218 134 L229 151 L224 178 Q180 190 136 178Z', c, s, 2)
  } else if (type === 'sailor') {
    art += p('M105 13 L180 73 L255 13 L273 33 L180 94 L87 33Z', '#fff8ec', s) + line('M106 29 L180 81 L254 29', '#577aa5', 3) + group(143, 53, .62, bow('#f9637d', '#c54461'))
  } else if (type === 'collar') {
    art += p('M128 9 L180 48 L151 73 Q112 69 98 32Z M232 9 L180 48 L209 73 Q248 69 262 32Z', '#fff9ed', '#d2b9a3')
  } else {
    art += p('M129 9 Q180 43 231 9 L243 22 Q180 64 117 22Z', high, s, 2.5)
    for (let x = 127; x < 236; x += 14) art += line(`M${x} 24 L${x + (x < 180 ? -3 : 3)} 35`, s, 1.5)
  }
  if (type === 'cardigan' || type === 'collar') {
    art += p('M171 44 L189 44 L189 199 Q180 202 171 199Z', high, s, 2.5)
    for (const y of [79, 128, 177]) art += e(180, y, 6, 6, '#fff8e9', s, 1.7)
  }
  if (motif === 'ong') art += group(180, 116, 1.9, ong())
  if (motif === 'heart') art += type === 'hoodBag' ? group(128, 111, .4, heart('#ef9abf')) + group(232, 105, .4, heart('#ef9abf')) : group(180, 121, .8, heart('#ec6086'))
  if (motif === 'cherry') art += group(254, 111, .7, cherry())
  if (motif === 'cloud') for (const [x, y] of [[124, 93], [232, 138], [46, 135], [314, 135]]) art += e(x - 12, y, 12, 10, '#fff') + e(x, y - 8, 13, 14, '#fff') + e(x + 13, y, 12, 10, '#fff')
  if (motif === 'stripe') for (const y of [83, 120, 157]) art += p(`M${y === 83 ? 75 : 58} ${y} Q180 ${y + 23} ${y === 83 ? 285 : 302} ${y} L300 ${y + 13} Q180 ${y + 37} 60 ${y + 13}Z`, '#243f68')
  art += line(roundedHem, high, 5)
  if (type === 'knit' || type === 'cardigan') {
    for (let x = 35; x <= 325; x += 14) {
      const y = 176 + 27 * (1 - ((x - 180) / 159) ** 2)
      art += line(`M${x} ${y - 2} L${x} ${y - 11}`, s, 1.8)
    }
  }
  return art
}
function crossbag(color, motif) {
  const [c, s, high] = palette[color]
  let art = p('M39 9 L57 3 Q113 91 264 174 L250 195 Q105 114 39 9Z', c, s, 2.5)
  if (motif === 'star') art += group(261, 207, .93, star(c, s)) + group(261, 207, .4, star(high))
  else if (motif === 'heart') art += group(261, 210, .95, heart(c, s))
  else if (motif === 'bear') art += group(261, 208, 1.08, bear())
  else if (motif === 'frog') art += e(238, 175, 14, 14, c, s) + e(284, 175, 14, 14, c, s) + e(261, 209, 48, 34, c, s) + e(238, 175, 3.5, 4, s) + e(284, 175, 3.5, 4, s) + line('M247 207 Q261 223 275 207', s, 3)
  else art += r(207, 169, 108, 81, 25, c, s) + p('M210 183 Q262 211 312 183', high, s, 2) + e(261, 205, 4, 4, '#e7b950') + group(261, 229, .7, ong(color === 'cream' ? '#398deb' : '#fff', true))
  return art
}
for (const [id, color, type, motif] of [
  ['cream-drawstring-hoodie', 'cream', 'hood', null], ['blue-ong-hoodie', 'blue', 'hood', 'ong'],
  ['purple-bag-hoodie', 'purple', 'hoodBag', 'heart'], ['cherry-cardigan', 'cream', 'cardigan', 'cherry'],
  ['red-collar-cardigan', 'red', 'collar', null], ['navy-sailor-top', 'navy', 'sailor', null],
  ['pink-heart-sweater', 'pink', 'knit', 'heart'], ['cream-bear-bag-hoodie', 'cream', 'bearBag', null],
  ['blue-cloud-sweater', 'blue', 'knit', 'cloud'], ['cream-stripe-sweater', 'cream', 'knit', 'stripe'],
]) {
  let art = shirt(color, type, motif)
  if (type === 'hoodBag') art += group(17, 44, .73, crossbag('darkPurple', 'ong'))
  if (type === 'bearBag') art += group(18, 43, .73, crossbag('brown', 'bear'))
  await add(`pastel-${id}`, 360, 225, art, { left: type === 'knit' ? 9.35 : 9.3, top: type === 'sailor' ? 41.2 : 41.15, width: type === 'knit' ? 81.3 : 81.4 })
}
{
  // Preserve the original varsity red, striped lapels, white buttons and pockets.
  // The old separate cream arm vectors remain archived, not in this silhouette.
  const c = '#ee2727', s = '#840505', cream = '#fff5e8'
  const art = p(roundedShell, c, s, 6)
    + p('M91 7 Q129 25 174 30 L137 75 L68 29Z M269 7 Q231 25 186 30 L223 75 L292 29Z', c, s, 4.5)
    + line('M91 18 L137 60 L157 38 M269 18 L223 60 L203 38', cream, 5)
    + p('M170 32 L190 32 L190 201 Q180 207 170 201Z', '#e82b2b', s, 4)
    + [80, 125, 171].map(y => e(180, y, 8, 8, '#fff')).join('')
    + line('M86 128 L76 160 M274 128 L284 160', cream, 9)
  await add('red-varsity-jacket', 360, 225, art, { left: 9.4, top: 41.33, width: 81.2 })
}
{
  const [c, s] = palette.green
  const art = p(roundedShell, c, s, 5.5)
    + p('M130 9 Q180 43 230 9 L242 21 Q180 74 118 21Z', '#f7f2df', s, 3)
    + line('M135 18 Q180 48 225 18', c, 3) + r(171, 49, 18, 151, 4, '#397e57', s, 2)
    + [80, 129, 177].map(y => e(180, y, 7, 7, '#fff9e8', s, 1.5)).join('')
    + line('M108 143 L97 171 M252 143 L263 171', '#fff7e4', 9)
    + line(roundedHem, '#fff7e4', 6)
    + group(245, 101, 1.15, ong('#fff9e8', true))
  await add('pastel-green-ong-varsity', 360, 225, art, { left: 9.35, top: 41.33, width: 81.3 })
}
{
  const coat = shirt('navy', 'knit', null) + [89, 140, 182].map(y => e(180, y, 6, 6, '#f5c655')).join('') + line('M180 58 L180 201', '#152c4a', 3)
  await add('pastel-navy-scarf-coat', 360, 225, coat + p('M220 43 L264 40 L280 171 Q256 188 228 177Z', '#4c9ae9', '#2163a5') + p('M108 11 Q180 33 251 11 L265 51 Q180 76 95 51Z', '#4c9ae9', '#2163a5') + line('M116 18 L110 51 M151 24 L149 59 M190 24 L193 58 M231 19 L239 53 M232 85 L269 79 M234 121 L273 115 M237 157 L276 151', '#b3dbff', 6), { left: 9.35, top: 41.15, width: 81.3 })
  await add('pastel-pink-fur-cape', 360, 225, p('M110 16 Q180 44 250 16 Q327 56 352 153 Q350 178 304 186 Q180 217 56 186 Q10 178 8 153 Q33 56 110 16Z', '#ffa7bc', '#d75e83', 3.5) + line('M180 64 L180 204', '#d75e83', 2) + p('M105 12 Q130 36 180 39 Q230 36 255 12 Q270 18 268 30 Q286 36 278 48 Q287 61 272 68 Q266 82 250 76 Q239 87 220 69 L180 53 L140 69 Q121 87 110 76 Q94 82 88 68 Q73 61 82 48 Q74 36 92 30 Q90 18 105 12Z', '#fff8e9', '#d7bda5') + group(144, 41, .6, bow('#ef4a56', '#b83247')) + e(180, 126, 7, 7, '#fff6d6', '#d75e83', 2) + e(180, 166, 7, 7, '#fff6d6', '#d75e83', 2), { left: 7.5, top: 41.6, width: 85 })
}

// Crossbody straps run from a shoulder to a side bag. Backpacks have a separate
// rear panel and front straps, so the body no longer gets hidden by a floating icon.
for (const [id, color, motif] of [
  ['cream-ong-bag', 'cream', 'ong'], ['yellow-star-bag', 'yellow', 'star'], ['blue-ong-bag', 'blue', 'ong'],
  ['brown-bear-bag', 'brown', 'bear'], ['pink-heart-bag', 'pink', 'heart'], ['black-ong-bag', 'black', 'ong'], ['green-frog-bag', 'frog', 'frog'],
]) await add(`pastel-${id}`, 360, 280, crossbag(color, motif), { left: 19, top: 43.4, width: id === 'yellow-star-bag' ? 65 : 64 })
await add('pastel-cream-bow-tote', 220, 270, line('M60 111 Q76 15 110 16 Q144 15 160 111', '#bf9367', 12) + line('M60 111 Q76 15 110 16 Q144 15 160 111', '#fff3df', 7) + p('M27 102 Q110 89 193 102 L204 236 Q200 265 110 265 Q20 265 16 236Z', '#fff3df', '#bf9367', 3) + group(72, 139, .65, bow('#398deb', '#18569d')), { left: 68, top: 50.5, width: 24 })
{
  const rear = p('M62 55 Q52 16 81 15 Q111 16 101 55', 'none', '#7444ac', 9) + r(22, 47, 135, 180, 44, '#ae7bea', '#7444ac', 4) + r(35, 127, 110, 83, 22, '#be93ee', '#7444ac') + group(90, 172, 1.2, ong('#fff', true))
  const straps = line('M107 17 Q85 51 84 112', '#7444ac', 14) + line('M107 17 Q85 51 84 112', '#be93ee', 8) + line('M225 17 Q246 51 247 112', '#7444ac', 14) + line('M225 17 Q246 51 247 112', '#be93ee', 8)
  await add('pastel-purple-ong-backpack', 180, 240, rear, { left: 75, top: 47, width: 21 }, { renderParts: [{ layer: 0, placement: { left: 75, top: 47, width: 21 }, zIndex: 18 }, { layer: 1, ratio: 1.5, placement: { left: 12, top: 41.9, width: 76 }, zIndex: 34 }] })
  await writeFile(`${folder}/pastel-purple-ong-backpack-straps.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">${straps}</svg>\n`)
  overrides['pastel-purple-ong-backpack'].layers.push({ file: 'refined/pastel-purple-ong-backpack-straps.svg', x: 0, y: 0, width: 100, wearableOnly: true })
}

// Scarves sit at the neck, with a smaller tail over the torso.
for (const [id, color, type] of [['blue-fringe-scarf', 'blue', 'fringe'], ['red-fringe-scarf', 'red', 'fringe'], ['yellow-check-scarf', 'yellow', 'check'], ['purple-scarf', 'purple', 'plain'], ['pink-heart-scarf', 'pink', 'heart'], ['navy-stripe-scarf', 'navy', 'stripe']]) {
  const [c, s, high] = palette[color]
  let art = p('M174 62 L243 53 L267 205 Q236 231 190 216Z', c, s)
  if (type === 'fringe' || type === 'check') art += line('M202 210 L204 228 M218 213 L221 232 M235 213 L239 230 M251 209 L257 223', c, 9)
  if (type === 'heart') art += group(226, 164, .35, heart('#fff'))
  if (type === 'stripe') art += line('M191 192 Q231 202 263 185', '#fff8e9', 10)
  art += p('M40 18 Q150 43 260 18 Q278 21 279 45 L286 70 Q287 97 150 101 Q13 97 14 70 L21 45 Q22 21 40 18Z', c, s, 3.5)
  if (type === 'check') art += line('M65 29 L60 90 M117 34 L115 98 M175 34 L180 97 M230 29 L240 90 M23 59 Q150 83 277 59 M197 132 L253 122 M200 175 L259 166 M211 103 L225 216 M240 103 L254 211', '#f1af31', 5)
  else art += line('M33 76 Q150 106 269 76', high, 1.8)
  await add(`pastel-${id}`, 300, 240, art, { left: 24, top: type === 'plain' ? 41.5 : 41.3, width: 52 })
}
await add('pastel-red-bow-tie', 120, 90, bow('#ef3936', '#a82021'), { left: 36.5, top: 43.1, width: 27 })
await add('pastel-cream-fur-neck-ribbon', 300, 210, p('M37 20 Q150 47 263 20 Q279 29 277 45 Q294 58 281 72 Q287 88 265 94 Q250 111 218 99 Q150 123 82 99 Q50 111 35 94 Q13 88 19 72 Q6 58 23 45 Q21 29 37 20Z', '#fff3df', '#bf9367', 3) + p('M145 105 L127 196 L143 202 L152 124 L166 201 L181 193 L158 105Z', '#fff3df', '#bf9367', 2.5) + group(112, 81, .65, bow('#fff3df', '#bf9367')), { left: 24, top: 41.3, width: 52 })

// Clear lenses stay transparent. Sunglasses intentionally cover the eyes.
for (const [id, color, type] of [['red-round-glasses', 'red', 'round'], ['yellow-frame-glasses', 'yellow', 'square'], ['purple-cat-sunglasses', 'purple', 'cat'], ['pink-heart-sunglasses', 'pink', 'heart'], ['silver-round-glasses', null, 'round'], ['blue-sunglasses', 'blue', 'square'], ['white-cat-glasses', 'cream', 'cat']]) {
  const [c, s] = color ? palette[color] : ['#a7acb3', '#717986']
  const clear = !id.includes('sunglasses')
  const fill = clear ? 'none' : '#293a50'
  let art = line('M10 67 L29 67 M271 67 L290 67 M133 65 Q150 50 167 65', c, 9)
  if (type === 'round') art += e(81, 67, 51, 48, fill, c, 9) + e(219, 67, 51, 48, fill, c, 9)
  if (type === 'square') art += p('M27 35 Q82 19 133 37 L126 79 Q119 115 80 112 Q40 110 32 79Z M167 37 Q218 19 273 35 L268 79 Q260 110 220 112 Q181 115 174 79Z', fill, c, 10)
  if (type === 'cat') art += p('M22 28 Q85 16 133 44 L125 83 Q113 111 77 109 Q39 107 31 74Z M167 44 Q215 16 278 28 L269 74 Q261 107 223 109 Q187 111 175 83Z', fill, c, 9)
  if (type === 'heart') art += group(81, 77, 1.35, heart(fill, c)) + group(219, 77, 1.35, heart(fill, c))
  if (!clear) art += line('M51 46 L67 39 M191 46 L207 39', '#ffffff', 3)
  if (id === 'white-cat-glasses') art += line('M26 29 Q85 17 131 43 M169 43 Q215 17 274 29', '#e7d9c8', 2)
  await add(`pastel-${id}`, 300, 130, art, glassesPlacement(`pastel-${id}`))
}

// Small motifs retain their identities but now have crisp vector edges at every zoom.
for (const id of ['daisy', 'blossom', 'cherry', 'star', 'heart', 'snowflake', 'clover', 'carrot', 'ong']) {
  let art = ''
  if (id === 'daisy' || id === 'blossom') {
    for (let i = 0; i < 5; i++) art += `<g transform="translate(60 60) rotate(${i * 72})">${e(0, -23, 15, 23, id === 'daisy' ? '#fff9ec' : '#ffa7bc', id === 'daisy' ? '#c9ab89' : '#d75e83', 2)}</g>`
    art += e(60, 60, 11, 11, '#ffce53')
  }
  if (id === 'cherry') art = group(55, 58, 1.2, cherry())
  if (id === 'star') art = group(60, 55, 1, star('#ffcf53', '#cb9323'))
  if (id === 'heart') art = group(60, 65, 1, heart('#ffa7bc', '#d75e83'))
  if (id === 'snowflake') for (let i = 0; i < 6; i++) art += `<g transform="translate(60 60) rotate(${i * 60})">${line('M0 0 L0 -43 M0 -24 L-12 -34 M0 -24 L12 -34', '#398deb', 5)}</g>`
  if (id === 'clover') art = line('M57 63 Q73 84 60 104', '#286f49', 5) + [0, 90, 180, 270].map(angle => `<g transform="translate(60 58) rotate(${angle})">${p('M0 0 Q-34 -6 -26 -28 Q-13 -46 0 -28 Q13 -46 26 -28 Q34 -6 0 0', '#398a50', '#286f49', 2)}</g>`).join('')
  if (id === 'carrot') art = line('M63 27 L59 9 M67 27 L80 13 M59 28 L45 17', '#398a50', 8) + p('M38 32 Q60 12 82 35 Q88 65 33 104 Q20 81 26 53Z', '#ffad41', '#d27c21', 3) + line('M37 46 L49 52 M34 66 L43 71', '#e78b2e', 2)
  if (id === 'ong') art = group(60, 68, 2, ong('#fff', true)) + e(60, 72, 22, 24, '#fff', '#398deb', 4) + e(60, 44, 13, 13, '#fff', '#398deb', 4) + e(55.4, 42, 2, 2, '#398deb') + e(64.6, 42, 2, 2, '#398deb')
  await add(`pastel-${id}-badge`, 120, 120, art, { left: id === 'carrot' ? 62.7 : 62, top: id === 'ong' ? 54 : 53.8, width: id === 'ong' ? 13.2 : 12.6 })
}

// Preserve good original vectors. Adjust only the oversized core attachments.
overrides['blue-headphones'] = { placement: { left: 18, top: 14.5, width: 64 } }
overrides['gray-earflap-hat'] = { placement: { left: 18.5, top: 7.8, width: 63 } }
overrides['cream-scarf'] = { placement: { left: 24.5, top: 41.3, width: 51 } }
overrides['green-bow'] = { placement: { left: 25, top: 41.5, width: 50 } }
overrides['round-glasses'] = { placement: glassesPlacement('round-glasses') }
// Pin to the free chest side when a garment print or scarf tail occupies the right.
for (const id of ['pastel-green-ong-varsity', 'pastel-cherry-cardigan', 'cream-scarf', 'green-bow', 'pastel-blue-fringe-scarf', 'pastel-red-fringe-scarf', 'pastel-yellow-check-scarf', 'pastel-purple-scarf', 'pastel-pink-heart-scarf', 'pastel-navy-stripe-scarf', 'pastel-navy-scarf-coat']) {
  overrides[id].attachmentAnchors = { badge: { left: 26 } }
}
await writeFile(`${root}src/data/itemVisualOverrides.json`, `${JSON.stringify(overrides, null, 2)}\n`)
console.log(`Saved ${Object.keys(overrides).length} visual overrides; economy metadata and source exports unchanged.`)
