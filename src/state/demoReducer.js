import { DEFAULT_ITEM_IDS } from '../data/itemCatalog.js'

export const defaultEconomy = { coinBalance: 0, ownedItemIds: DEFAULT_ITEM_IDS, equippedItems: {} }
export const defaultProfile = { nickname: '', email: '', department: '', year: '', goalMinutes: null }
export const defaultNotifications = { deadline: true, study: false, materials: true }

export function initialDemoState() {
  return { economy: { ...defaultEconomy }, ready: false, storageFailed: false, profile: { ...defaultProfile }, notifications: { ...defaultNotifications }, transaction: null }
}

export function demoReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': return { ...state, ...action.values, ready: true }
    case 'SHOP_SET': return { ...state, economy: { coinBalance: action.shop.coin_balance, ownedItemIds: action.shop.owned_item_ids, equippedItems: action.shop.equipped_items } }
    case 'PROFILE_SET': return { ...state, profile: { ...state.profile, ...action.values } }
    case 'NOTIFICATIONS_SET': return { ...state, notifications: { ...state.notifications, ...action.values } }
    case 'TRANSACTION': return { ...state, transaction: action.transaction }
    case 'CLEAR_TRANSACTION': return { ...state, transaction: null }
    case 'STORAGE_FAILED': return { ...state, storageFailed: true }
    default: return state
  }
}
