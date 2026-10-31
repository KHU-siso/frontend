import { useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/brand/BrandLogo.jsx'
import AppNavigation from '../components/navigation/AppNavigation.jsx'
import searchIcon from '../assets/dashboard/dashboard-search.svg'
import GlobalSearch from '../components/layout/GlobalSearch.jsx'
import menuIcon from '../assets/dashboard/dashboard-menu.svg'
import bellIcon from '../assets/dashboard/dashboard-bell.svg'
import './AppLayout.css'
import { useDemo } from '../state/DemoContext.js'
import { useSubjects } from '../state/SubjectsContext.js'
import { buildNotifications } from '../data/notifications.js'

export default function AppLayout() {
  const headerRef = useRef(null)
  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const { state } = useDemo()
  const { data: subjectData, now: subjectNow } = useSubjects()
  const alerts = buildNotifications(subjectData, subjectNow)
  const [alertsOpen, setAlertsOpen] = useState(false)
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
        <GlobalSearch subjects={subjectData.subjects} isOpen={searchOpen} onNavigate={() => setSearchOpen(false)} />
        <time className="app-date" dateTime={now.toISOString()}>{currentDate}</time>
        <button className="app-icon-button app-mobile-search" type="button" aria-label={searchOpen ? '검색 닫기' : '검색 열기'} aria-expanded={searchOpen} onClick={() => setSearchOpen(value => !value)}><img src={searchIcon} alt="" /></button>
        <button className="app-notification" type="button" aria-label={alerts.length ? `알림 ${alerts.length}개 확인` : '알림 확인'} aria-expanded={alertsOpen} onClick={() => setAlertsOpen(open => !open)}><img src={bellIcon} alt="" />{alerts.length > 0 && <span aria-hidden="true" />}</button>
        <button className="app-profile" type="button" aria-label="마이페이지 열기" onClick={() => navigate('/mypage')}>{state.profile.nickname.slice(0, 1)}</button>
      </header>
      {alertsOpen && <section className="app-alerts" aria-label="알림">
        <header><strong>알림</strong><button type="button" aria-label="알림 닫기" onClick={() => setAlertsOpen(false)}>×</button></header>
        {alerts.length ? <ul>{alerts.map(alert => <li key={alert.id} className={`is-${alert.kind}`}><Link to={alert.to} onClick={() => setAlertsOpen(false)}><strong>{alert.text}</strong><span>{alert.detail}</span></Link></li>)}</ul> : <p>새 알림이 없어요. 임박한 과제와 시험이 생기면 여기에 알려드려요.</p>}
      </section>}
      {notice && <div className="app-notice"><p role="status">{notice}</p><button type="button" aria-label="안내 닫기" onClick={() => setNotice('')}>×</button></div>}
      {state.storageFailed && <div className="app-notice"><p role="alert">서버와 통신하지 못했습니다. 코인·착용 상태를 불러오지 못했을 수 있습니다.</p></div>}
      <main className="app-main" id="dashboard-content"><Outlet /></main>
      <footer className="app-footer">
        <nav aria-label="서비스 안내"><Link to="/support">고객센터</Link><Link to="/faq">자주 묻는 질문(FAQ)</Link><Link to="/community">커뮤니티</Link></nav>
        <BrandLogo to="/dashboard" />
      </footer>
      {menuOpen && <AppNavigation headerRef={headerRef} onClose={() => setMenuOpen(false)} />}
    </div>
  )
}
