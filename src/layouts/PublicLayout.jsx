import { NavLink, Outlet } from 'react-router-dom'
import PublicHeader from '../components/layout/PublicHeader.jsx'
import './PublicLayout.css'

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
      <PublicHeader />
      <main id="main-content" className="public-main" tabIndex={-1}><Outlet /></main>
      <footer className="public-footer">
        <nav aria-label="서비스 안내">
          <NavLink to="/faq">자주 묻는 질문(FAQ)</NavLink>
          <NavLink to="/support">고객센터</NavLink>
          <NavLink to="/community">커뮤니티</NavLink>
        </nav>
      </footer>
    </div>
  )
}
