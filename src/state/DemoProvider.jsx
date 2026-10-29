import { useEffect, useMemo, useReducer } from 'react'
import { DemoContext } from './DemoContext.js'
import { demoReducer, ECONOMY_KEY, initialDemoState } from './demoReducer.js'

export default function DemoProvider({ children }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialDemoState)
  useEffect(() => {
    try { window.localStorage.setItem(ECONOMY_KEY, JSON.stringify({ version: 2, userId: 'local-demo-user', ...state.economy })) }
    catch { dispatch({ type: 'STORAGE_FAILED' }) }
  }, [state.economy])
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
