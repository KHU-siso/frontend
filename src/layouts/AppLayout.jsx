import { useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/brand/BrandLogo.jsx'
import AppNavigation from '../components/navigation/AppNavigation.jsx'
import searchIcon from '../assets/dashboard/dashboard-search.svg'
import menuIcon from '../assets/dashboard/dashboard-menu.svg'
import bellIcon from '../assets/dashboard/dashboard-bell.svg'
import './AppLayout.css'
import { useDemo } from '../state/DemoContext.js'

export default function AppLayout() {
  const headerRef = useRef(null)
  const [queries, setQueries] = useState({})
  const pathname = useLocation().pathname
  const search = queries[pathname] || ''
  const navigate = useNavigate()
  const { state } = useDemo()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const now = new Date()
  const currentDate = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full', timeZone: 'Asia/Seoul' }).format(now)
  return (
    <div className={`app-shell ${pathname === '/dashboard' ? 'app-shell--dashboard' : ''}`}>
      <a className="skip-link" href="#dashboard-content">본문으로 건너뛰기</a>
      <header className="app-header" ref={headerRef}>
        <BrandLogo to="/dashboard" />
        <button className="app-icon-button app-menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><img src={menuIcon} alt="" /></button>
        <form className={`app-search ${searchOpen ? 'is-open' : ''}`} role="search" onSubmit={event => event.preventDefault()}>
          <img src={searchIcon} alt="" />
          <input aria-label={pathname === '/dashboard' ? '대시보드 과목 검색' : pathname.startsWith('/materials/') ? '과목 홈 노트 검색' : '과목 검색'} value={search} onChange={event => setQueries(current => ({ ...current, [pathname]: event.target.value }))} />
        </form>
        <time className="app-date" dateTime={now.toISOString()}>{currentDate}</time>
        <button className="app-icon-button app-mobile-search" type="button" aria-label={searchOpen ? '검색 닫기' : '검색 열기'} aria-expanded={searchOpen} onClick={() => setSearchOpen(value => !value)}><img src={searchIcon} alt="" /></button>
        <button className="app-notification" type="button" aria-label="알림 확인" onClick={() => setNotice('알림 기능을 연결하고 있습니다.')}><img src={bellIcon} alt="" /></button>
        <button className="app-profile" type="button" aria-label="마이페이지 열기" onClick={() => navigate('/mypage')}>{state.profile.nickname.slice(0, 1)}</button>
      </header>
      {notice && <div className="app-notice"><p role="status">{notice}</p><button type="button" aria-label="안내 닫기" onClick={() => setNotice('')}>×</button></div>}
      {state.storageFailed && <div className="app-notice"><p role="alert">브라우저 저장소에 접근할 수 없습니다. 코인·착용 상태가 새로고침 후 보존되지 않을 수 있습니다.</p></div>}
      <main className="app-main" id="dashboard-content"><Outlet context={{ search }} /></main>
      <footer className="app-footer">
        <nav aria-label="서비스 안내"><Link to="/support">고객센터</Link><Link to="/faq">자주 묻는 질문(FAQ)</Link><Link to="/community">커뮤니티</Link></nav>
        <BrandLogo to="/dashboard" />
      </footer>
      {menuOpen && <AppNavigation headerRef={headerRef} onClose={() => setMenuOpen(false)} />}
    </div>
  )
}
