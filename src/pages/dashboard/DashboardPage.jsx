import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import DashboardMascot from '../../components/dashboard/DashboardMascot.jsx'
import DashboardTasks from '../../components/dashboard/DashboardTasks.jsx'
import Timetable from '../../components/dashboard/Timetable.jsx'
import { useSubjects } from '../../state/SubjectsContext.js'
import { dashboardSubjects, subjectTimetable } from '../../data/subjectDashboard.js'
import './DashboardPage.css'
import { useDemo } from '../../state/DemoContext.js'

export default function DashboardPage() {
  const { state } = useDemo()
  const { search } = useOutletContext()
  const { data, now, commit, error } = useSubjects()
  const [saveError, setSaveError] = useState('')
  const courses = dashboardSubjects(data, now)
  const { events, exams } = subjectTimetable(data, now)
  function change(updater) { try { commit(updater); setSaveError('') } catch (failure) { setSaveError(failure.message) } }
  const [view, setView] = useState('overview')
  const filtered = courses.filter(course => `${course.title} ${course.teacher}`.includes(search.trim()))
  return (
    <div className="dashboard-page">
      <section className="dashboard-banner" aria-labelledby="dashboard-title">
        <h1 id="dashboard-title">{state.profile.nickname}님, 작은 배움으로 오늘의 목표를 채워보세요!</h1>
        <p>오늘의 목표 : {state.profile.goalMinutes % 60 === 0 ? `${state.profile.goalMinutes / 60}시간` : `${state.profile.goalMinutes}분`} 학습하기 · 과제 1개 완료</p>
      </section>
      {(error || saveError) && <p role="alert" className="service-error">{error || saveError}</p>}
      <nav className="dashboard-view-switch" aria-label="대시보드 보기">
        <button type="button" aria-pressed={view === 'overview'} onClick={() => setView('overview')}>오늘의 학습</button>
        <button type="button" aria-pressed={view === 'timetable'} onClick={() => setView('timetable')}>주간 시간표</button>
      </nav>
      <div className="dashboard-overview" data-view={view}>
        <DashboardMascot />
        <div className="dashboard-center">
        <section className="dashboard-card dashboard-quick" aria-labelledby="quick-heading">
          <h2 id="quick-heading">빠른 실행</h2>
          <div className="quick-actions">{[['/study/setup', '퀴즈하기'], ['/wrong-answers', '복습하기'], ['/materials', '강의자료실'], ['/chat', 'AI chat']].map(([to, label], i) => <Link className={`quick-action quick-action--${i}`} to={to} key={to}>{label}</Link>)}</div>
        </section>
        <DashboardTasks courses={filtered} onToggleCancel={id => change(current => ({ ...current, subjects: current.subjects.map(subject => subject.id === id ? { ...subject, cancelled: !subject.cancelled } : subject) }))} />
        </div>
        <Timetable events={events} exams={exams} now={now} onAdd={event => change(current => ({ ...current, calendarEvents: [...current.calendarEvents, event] }))} />
      </div>
    </div>
  )
}
