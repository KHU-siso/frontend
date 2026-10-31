import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { AUTH_EXPIRED_EVENT, clearToken, getMe, getToken } from '../services/api.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return }
    try { setUser(await getMe()) } catch { clearToken(); setUser(null) }
    setLoading(false)
  }, [])

  // 마운트 시 토큰이 있으면 /me로 로그인 상태를 복원한다.
  useEffect(() => {
    let active = true
    getMe().then(me => active && setUser(me)).catch(() => { clearToken(); if (active) setUser(null) }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])
  useEffect(() => {
    const expire = () => setUser(null)
    window.addEventListener(AUTH_EXPIRED_EVENT, expire)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, expire)
  }, [])

  const logout = useCallback(() => { clearToken(); setUser(null) }, [])
  const value = useMemo(() => ({ user, setUser, loading, refresh, logout }), [user, loading, refresh, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
