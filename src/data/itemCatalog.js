import catalog from './customizationItems.json'
import pastel from './pastelItems.json'
import visualOverrides from './itemVisualOverrides.json'
import retiredItemIds from './retiredItemIds.json'
import head from '../assets/dashboard/dashboard-ong-head.svg'
import body from '../assets/dashboard/dashboard-ong-body.svg'
import leftEye from '../assets/dashboard/dashboard-ong-eye-left.svg'
import rightEye from '../assets/dashboard/dashboard-ong-eye-right.svg'

// Historical PNG exports stay on disk; only current vector art enters the bundle.
const assetUrls = {
  ...import.meta.glob('../assets/items/figma/*.svg', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../assets/items/refined/*.svg', { eager: true, query: '?url&no-inline', import: 'default' }),
  ...import.meta.glob('../assets/items/rounded/*.svg', { eager: true, query: '?url&no-inline', import: 'default' }),
}
const asset = file => assetUrls[/^(pastel|refined|rounded)\//.test(file) ? `../assets/items/${file}` : `../assets/items/figma/${file}`]
export const DEFAULT_ITEM_IDS = ['color-white']
export const slotNames = { bodyColor: '컬러', headwear: '모자 / 머리 장식', outfit: '의상', neckAccessory: '목도리 / 스카프', bag: '가방', faceAccessory: '얼굴 액세서리', badge: '가슴 장식', bodyDecoration: '몸체 장식', feet: '신발' }
export const itemCategories = ['전체', '파스텔', '컬러', '옷', '모자', '액세서리', '장식', '안경', '코스튬']
export const legacyItemSlots = { 'cream-scarf': 'decoration', 'green-bow': 'decoration', 'red-bag': 'decoration', 'bear-hood': 'head', 'round-glasses': 'face', 'classic-buttons': 'outfit' }
export const slotOrder = { feet: 10, outfit: 30, bodyDecoration: 31, neckAccessory: 35, bag: 36, badge: 37, headwear: 50, faceAccessory: 60 }

const aliases = Object.fromEntries(pastel.items.filter(item => item.aliasOf).map(item => [item.aliasOf, item]))
const sourceItems = [
  ...catalog.items.map(item => {
    const alias = aliases[item.id]
    if (!alias) return item
    const reference = { sourceNodeId: pastel.sourceNodeId, sourceCell: alias.sourceCell, sourceRect: alias.sourceRect }
    // Reuse existing products/artwork for duplicate designs. The isolated hat crop
    // replaces the older image with stray edge pixels; keep its ID and price.
    return { ...item, tags: [...new Set([...(item.tags || []), ...alias.tags])], pastelReference: reference,
      ...(item.id === 'beige-brim-hat' ? { layers: alias.layers, ratio: alias.ratio, placement: alias.placement, available: true, unavailableReason: undefined } : {}) }
  }),
  ...pastel.items.filter(item => !item.aliasOf),
]

// Crop the empty avatar-stage margins for the product thumbnail only.
// Keep the original head/body/eye proportions; OngAvatar's geometry is unchanged.
const whiteArtWidth = 1660 * 0.7849
const whiteArtHeight = 2448 * (0.3873 - 0.181) + whiteArtWidth * 1233 / 1303
const whiteLayers = [
  { src: head, x: 26.81, y: 18.1, width: 46.39 },
  { src: body, x: 10.72, y: 38.73, width: 78.49 },
  { src: leftEye, x: 37.05, y: 30.02, width: 4.28 },
  { src: rightEye, x: 57.17, y: 30.02, width: 4.4 },
].map(layer => ({
  ...layer,
  x: (layer.x - 10.72) * 1660 / whiteArtWidth,
  y: (layer.y - 18.1) * 2448 / whiteArtHeight,
  width: layer.width * 1660 / whiteArtWidth,
}))
// Figma prices are not specified. Existing six prices/IDs are retained; new prices are demo values.
export const itemCatalog = sourceItems.filter(source => !retiredItemIds.includes(source.id)).map(source => {
  // Presentation-only refinements cannot replace IDs, prices or ownership rules.
  const refinement = visualOverrides[source.id]
  const item = refinement ? {
    ...source,
    placement: refinement.placement ?? source.placement,
    ratio: refinement.ratio ?? source.ratio,
    layers: refinement.layers ?? source.layers,
    renderParts: refinement.renderParts,
    attachmentAnchors: refinement.attachmentAnchors,
    artworkProvenance: refinement.artworkProvenance,
  } : source
  if (item.defaultOwned) return { ...item, ratio: whiteArtWidth / whiteArtHeight, layers: whiteLayers }
  const layers = item.layers.map(layer => ({ ...layer, src: asset(layer.file) }))
  if (item.slot === 'bodyColor') layers.push(
    { src: leftEye, x: 33.18, y: 19.58, width: 5.42 },
    { src: rightEye, x: 58.83, y: 19.58, width: 5.53 },
  )
  return { ...item, layers, ...(item.colorSources ? { colorSources: { head: asset(item.colorSources.head), body: asset(item.colorSources.body) } } : {}) }
})
export const itemById = Object.fromEntries(itemCatalog.map(item => [item.id, item]))

// Both preview and confirmed equipment use this rule. The coat has its own fastening;
// free-standing body buttons would cover it, so the two slots are exclusive in the demo.
export function equippedWithItem(equipped, item) {
  if (!item?.available) return equipped
  const next = { ...equipped }
  const occupied = item.occupiedSlots || [item.slot]
  for (const [slot, id] of Object.entries(next)) {
    const other = itemById[id]
    if (other && (other.occupiedSlots || [other.slot]).some(otherSlot => occupied.includes(otherSlot))) delete next[slot]
  }
  if (item.id === 'color-white') delete next.bodyColor
  else next[item.slot] = item.id
  if (item.slot === 'outfit') delete next.bodyDecoration
  if (item.slot === 'bodyDecoration') delete next.outfit
  return next
}

export function equipmentOccupant(equipped, slot) {
  return Object.values(equipped).map(id => itemById[id]).find(item => item && (item.occupiedSlots || [item.slot]).includes(slot))
}
