import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { DemoContext } from './DemoContext.js'
import { defaultNotifications, demoReducer, initialDemoState } from './demoReducer.js'
import { useAuth } from './AuthContext.js'
import { buyItem, getShop, getState, putState, saveEquipment, updateMe } from '../services/api.js'
import { equippedWithItem, itemById } from '../data/itemCatalog.js'

// 서버(코인샵/프로필/설정)와 동기화되는 전역 상태. 화면에서는 기존처럼 dispatch(action)을 쓰고,
// BUY/EQUIP/PROFILE 등은 여기서 API 호출로 바뀐다. (Promise를 돌려주므로 필요하면 await 가능)
export default function DemoProvider({ children }) {
  const { user, setUser } = useAuth()
  const [state, dispatch] = useReducer(demoReducer, undefined, initialDemoState)
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  const refreshShop = useCallback(async () => {
    const shop = await getShop()
    dispatch({ type: 'SHOP_SET', shop })
    return shop
  }, [])

  useEffect(() => {
    if (!user) return undefined
    let active = true
    Promise.all([getShop(), getState('profile').catch(() => null)]).then(([shop, saved]) => {
      if (!active) return
      const extra = saved || {}
      dispatch({ type: 'SHOP_SET', shop })
      dispatch({ type: 'HYDRATE', values: {
        profile: { nickname: user.nickname, email: user.email, department: extra.department || '', year: extra.year || '', goalMinutes: extra.goalMinutes || 120 },
        notifications: { ...defaultNotifications, ...(extra.notifications || {}) },
      } })
    }).catch(() => active && dispatch({ type: 'STORAGE_FAILED' }))
    return () => { active = false }
  }, [user])

  const saveProfileExtras = useCallback(async (profile, notifications) => {
    await putState('profile', { department: profile.department, year: profile.year, goalMinutes: profile.goalMinutes, notifications })
  }, [])

  const act = useCallback(async action => {
    const current = stateRef.current
    try {
      switch (action.type) {
        case 'BUY': {
          const item = itemById[action.id]
          const shop = await buyItem(action.id)
          dispatch({ type: 'SHOP_SET', shop })
          dispatch({ type: 'TRANSACTION', transaction: { id: action.id, ok: true, message: `${item?.name || '아이템'}을(를) 구매했습니다.` } })
          return
        }
        case 'EQUIP': {
          const item = itemById[action.id]
          if (!item?.available || !current.economy.ownedItemIds.includes(item.id)) return
          dispatch({ type: 'SHOP_SET', shop: await saveEquipment(equippedWithItem(current.economy.equippedItems, item)) })
          return
        }
        case 'UNEQUIP':
          dispatch({ type: 'SHOP_SET', shop: await saveEquipment(Object.fromEntries(Object.entries(current.economy.equippedItems).filter(([slot]) => slot !== action.slot))) })
          return
        case 'UNEQUIP_ALL':
          dispatch({ type: 'SHOP_SET', shop: await saveEquipment({}) })
          return
        case 'PROFILE': {
          const { nickname, ...extras } = action.values
          if (nickname !== undefined && nickname !== current.profile.nickname) {
            const me = await updateMe(nickname)
            setUser(me)
          }
          const nextProfile = { ...current.profile, ...action.values }
          await saveProfileExtras(nextProfile, current.notifications)
          dispatch({ type: 'PROFILE_SET', values: { ...extras, ...(nickname !== undefined ? { nickname } : {}) } })
          return
        }
        case 'NOTIFICATION': {
          const next = { ...current.notifications, [action.key]: action.value }
          dispatch({ type: 'NOTIFICATIONS_SET', values: next })
          await saveProfileExtras(current.profile, next)
          return
        }
        default: dispatch(action)
      }
    } catch (error) {
      if (action.type === 'BUY') dispatch({ type: 'TRANSACTION', transaction: { id: action.id, ok: false, message: error.message } })
      else if (action.type === 'PROFILE') throw error
      else dispatch({ type: 'STORAGE_FAILED' })
    }
  }, [saveProfileExtras, setUser])

  // 로그인 직후 프로필이 서버에서 오기 전에도 닉네임/이메일은 인증 정보로 바로 보여준다.
  const merged = useMemo(() => user ? { ...state, profile: { ...state.profile, nickname: user.nickname, email: user.email } } : state, [state, user])
  const value = useMemo(() => ({ state: merged, dispatch: act, refreshShop }), [merged, act, refreshShop])
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
