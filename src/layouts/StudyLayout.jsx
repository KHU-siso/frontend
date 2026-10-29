import { Link, Outlet, useLocation, useMatch } from 'react-router-dom'
import BrandLogo from '../components/brand/BrandLogo.jsx'
import { LearningBackground } from '../components/service/ServiceUI.jsx'
import { useDemo } from '../state/DemoContext.js'
import './StudyLayout.css'

export default function StudyLayout() {
  const { state } = useDemo()
  const match = useMatch('/study/session/:sessionId/*')
  const session = state.sessions[match?.params.sessionId]
  const pathname = useLocation().pathname
  const reward = session?.status === 'complete' && pathname.endsWith('/reward')
  return (
    <div className={`study-shell${reward ? ' study-shell--reward' : ''}`}>
      {!reward && <LearningBackground />}
      <header className="study-header"><BrandLogo to="/dashboard" />{!reward && <>{pathname === '/wrong-answers' ? <span>오답기록</span> : session && <div className="study-header__progress"><span>{Math.min((session.currentIndex || 0) + 1, session.questionIds.length)}/{session.questionIds.length}</span><progress aria-label="학습 진행도" max={session.questionIds.length || 1} value={session.answers.length} /></div>}<Link className="study-exit" to="/dashboard">나가기</Link></>}</header>
      <main><Outlet /></main>
    </div>
  )
}
