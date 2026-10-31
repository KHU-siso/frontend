import { Link, Outlet, useLocation } from 'react-router-dom'
import BrandLogo from '../components/brand/BrandLogo.jsx'
import { LearningBackground } from '../components/service/ServiceUI.jsx'
import './StudyLayout.css'

export default function StudyLayout() {
  const pathname = useLocation().pathname
  const reward = pathname.endsWith('/reward')
  return (
    <div className={`study-shell${reward ? ' study-shell--reward' : ''}`}>
      {!reward && <LearningBackground />}
      <header className="study-header"><BrandLogo to="/dashboard" />{!reward && <>{pathname === '/wrong-answers' && <span>오답기록</span>}<Link className="study-exit" to="/dashboard">나가기</Link></>}</header>
      <main><Outlet /></main>
    </div>
  )
}
