import { useLayoutEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext.js'
import Modal from '../common/Modal.jsx'
import NavigationIcon from './NavigationIcon.jsx'
import './AppNavigation.css'

const primary = [
  ['/dashboard', '홈', 'dashboard'],
  ['/study/setup', '퀴즈', 'quiz'],
  ['/wrong-answers', '오답노트', 'review'],
  ['/materials', '자료실', 'materials'],
  ['/chat', 'AI 채팅', 'chat'],
  ['/shop', '코인샵', 'shop'],
]
const secondary = [['/mypage', '마이페이지', 'profile'], ['/login', '로그아웃하기', 'logout']]

export default function AppNavigation({ headerRef, onClose }) {
  const navRef = useRef(null)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    const dialog = navRef.current.closest('dialog')
    const align = () => dialog.style.setProperty('--navigation-top', `${Math.max(0, headerRef.current.getBoundingClientRect().bottom)}px`)
    align()
    const observer = new ResizeObserver(align)
    observer.observe(headerRef.current)
    window.addEventListener('resize', align)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', align)
      document.body.style.overflow = previousOverflow
    }
  }, [headerRef])
  function entry([to, label, icon]) {
    if (icon === 'logout') return <button key={to} type="button" onClick={() => { logout(); onClose(); navigate('/login') }}><NavigationIcon name={icon} /><span>{label}</span></button>
    const selected = (to === '/study/setup' ? pathname.startsWith('/study/') : to === '/materials' ? pathname === to || pathname.startsWith('/materials/') : pathname === to)
    return <Link key={to} to={to} aria-current={selected ? 'page' : undefined} onClick={onClose}><NavigationIcon name={icon} /><span>{label}</span></Link>
  }
  return <Modal title="MORAM 메뉴" className="app-nav-dialog" onClose={onClose}>
    <nav ref={navRef} className="app-drawer" aria-label="대시보드 메뉴">
      <div className="app-drawer__primary">{primary.map(entry)}</div>
      <div className="app-drawer__secondary">{secondary.map(entry)}</div>
    </nav>
  </Modal>
}
