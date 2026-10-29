import { DEFAULT_ITEM_IDS, equippedWithItem, itemById, legacyItemSlots } from '../data/itemCatalog.js'
import { isCorrectAnswer, questionById } from '../data/learningDemo.js'

export const ECONOMY_KEY = 'moram.demo.local-user.economy.v1'
export const defaultEconomy = { coinBalance: 15, ownedItemIds: DEFAULT_ITEM_IDS, equippedItems: {}, rewardHistory: {} }
export function readEconomy(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(ECONOMY_KEY) || 'null')
    if (!raw || ![1, 2].includes(raw.version) || raw.userId !== 'local-demo-user') return { ...defaultEconomy }
    const ownedItemIds = [...new Set([...DEFAULT_ITEM_IDS, ...(Array.isArray(raw.ownedItemIds) ? raw.ownedItemIds : []).filter(id => typeof id === 'string' && Object.hasOwn(itemById, id))])]
    // Keep the original storage key, balance, owned IDs and reward history. Version 1
    // had head/face/outfit/decoration; migrate by the actual item's new slot.
    let equippedItems = {}
    for (const [slot, id] of Object.entries(raw.equippedItems || {})) {
      const item = Object.hasOwn(itemById, id) ? itemById[id] : null
      if (item && ownedItemIds.includes(id) && (slot === item.slot || (raw.version === 1 && legacyItemSlots[id] === slot))) equippedItems = equippedWithItem(equippedItems, item)
    }
    const rewardHistory = Object.fromEntries(Object.entries(raw.rewardHistory || {}).filter(([key, amount]) => key.length < 200 && Number.isInteger(amount) && amount >= 0 && amount <= 10))
    return { coinBalance: Number.isInteger(raw.coinBalance) && raw.coinBalance >= 0 ? Math.min(raw.coinBalance, 1000000) : 0, ownedItemIds, equippedItems, rewardHistory }
  } catch { return { ...defaultEconomy } }
}
export function initialDemoState() {
  let economy
  try { economy = readEconomy(window.localStorage) } catch { economy = { ...defaultEconomy } }
  return { economy, storageFailed: false, sessions: {}, chats: [{ id: 'welcome-chat', title: '새 채팅', messages: [] }], wrongAnswers: [
    { questionId: 'citizen-1', submittedAnswer: '1600', attempts: 1, bookmarked: true, resolved: false, updatedAt: 1 },
    { questionId: 'design-1', submittedAnswer: '여백 제거', attempts: 1, bookmarked: false, resolved: false, updatedAt: 2 },
    { questionId: 'math-1', submittedAnswer: 'x', attempts: 1, bookmarked: false, resolved: false, updatedAt: 3 },
  ], profile: { nickname: '학습자', email: 'learner@example.com', department: '컴퓨터공학과', year: '3학년', goalMinutes: 120 }, notifications: { deadline: true, study: false, materials: true }, transaction: null }
}
export function demoReducer(state, action) {
  switch (action.type) {
    case 'STORAGE_FAILED': return { ...state, storageFailed: true }
    case 'CHAT_CREATE': return { ...state, chats: [...state.chats, { id: action.id, title: '새 채팅', messages: [] }] }
    case 'CHAT_MESSAGE': return { ...state, chats: state.chats.map(chat => chat.id === action.id ? { ...chat, title: chat.messages.length ? chat.title : action.text.slice(0, 24), messages: [...chat.messages, { id: action.messageId, role: 'user', text: action.text }, { id: `${action.messageId}-reply`, role: 'assistant', text: action.reply }] } : chat) }
    case 'SESSION_START': return { ...state, sessions: { ...state.sessions, [action.session.id]: action.session } }
    case 'ADVANCE_QUESTION': {
      const session = state.sessions[action.id]
      const index = session?.currentIndex || 0
      if (!session || session.status !== 'active' || !session.answers[index] || index + 1 >= session.questionIds.length) return state
      return { ...state, sessions: { ...state.sessions, [action.id]: { ...session, currentIndex: index + 1 } } }
    }
    case 'ANSWER': {
      const session = state.sessions[action.id]
      if (!session || session.status !== 'active' || session.answers.length >= session.questionIds.length || action.index !== session.answers.length) return state
      const question = questionById[session.questionIds[action.index]]
      if (!question) return state
      const correct = session.mode === 'concept' || isCorrectAnswer(question, action.answer)
      let wrongAnswers = state.wrongAnswers
      const existing = wrongAnswers.find(record => record.questionId === question.id)
      if (!correct) {
        const record = { questionId: question.id, submittedAnswer: action.answer, attempts: (existing?.attempts || 0) + 1, bookmarked: existing?.bookmarked || false, resolved: false, updatedAt: action.at }
        wrongAnswers = [...wrongAnswers.filter(wrong => wrong.questionId !== question.id), record]
      } else if (session.mode === 'review' && existing) wrongAnswers = wrongAnswers.map(record => record.questionId === question.id ? { ...record, resolved: true, updatedAt: action.at } : record)
      return { ...state, wrongAnswers, sessions: { ...state.sessions, [action.id]: { ...session, answers: [...session.answers, { questionId: question.id, submittedAnswer: action.answer, correct }] } } }
    }
    case 'SESSION_FINISH': {
      const session = state.sessions[action.id]
      if (!session || !session.questionIds.length || session.answers.length !== session.questionIds.length) return state
      return { ...state, sessions: { ...state.sessions, [action.id]: { ...session, status: 'complete' } } }
    }
    case 'CLAIM_REWARD': {
      const session = state.sessions[action.id]
      const key = `quiz:${action.id}`
      if (!session || session.status !== 'complete' || Object.hasOwn(state.economy.rewardHistory, key)) return state
      const amount = session.mode === 'concept' ? 0 : Math.min(3, session.answers.filter(answer => answer.correct).length)
      return { ...state, economy: { ...state.economy, coinBalance: state.economy.coinBalance + amount, rewardHistory: { ...state.economy.rewardHistory, [key]: amount } } }
    }
    case 'BOOKMARK': return { ...state, wrongAnswers: state.wrongAnswers.map(record => record.questionId === action.id ? { ...record, bookmarked: !record.bookmarked } : record) }
    case 'BUY': {
      const item = Object.hasOwn(itemById, action.id) ? itemById[action.id] : null
      const result = !item ? '아이템을 찾을 수 없습니다.' : !item.available ? item.unavailableReason : state.economy.ownedItemIds.includes(item.id) ? '이미 보유한 아이템입니다.' : state.economy.coinBalance < item.price ? '코인이 부족합니다.' : null
      if (result) return { ...state, transaction: { id: action.id, message: result, ok: false } }
      return { ...state, economy: { ...state.economy, coinBalance: state.economy.coinBalance - item.price, ownedItemIds: [...state.economy.ownedItemIds, item.id] }, transaction: { id: item.id, message: `${item.name} 구매 완료. 보관함에 추가되었습니다.`, ok: true } }
    }
    case 'EQUIP': {
      const item = Object.hasOwn(itemById, action.id) ? itemById[action.id] : null
      if (!item?.available || !state.economy.ownedItemIds.includes(item.id)) return state
      return { ...state, economy: { ...state.economy, equippedItems: equippedWithItem(state.economy.equippedItems, item) } }
    }
    case 'UNEQUIP': return { ...state, economy: { ...state.economy, equippedItems: Object.fromEntries(Object.entries(state.economy.equippedItems).filter(([slot]) => slot !== action.slot)) } }
    case 'UNEQUIP_ALL': return { ...state, economy: { ...state.economy, equippedItems: {} } }
    case 'PROFILE': return { ...state, profile: { ...state.profile, ...action.values } }
    case 'NOTIFICATION': return { ...state, notifications: { ...state.notifications, [action.key]: action.value } }
    case 'CLEAR_TRANSACTION': return { ...state, transaction: null }
    default: return state
  }
}
