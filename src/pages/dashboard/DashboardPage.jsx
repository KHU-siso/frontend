import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import DashboardMascot from '../../components/dashboard/DashboardMascot.jsx'
import DashboardTasks from '../../components/dashboard/DashboardTasks.jsx'
import CancelClassModal from '../../components/dashboard/CancelClassModal.jsx'
import Timetable from '../../components/dashboard/Timetable.jsx'
import { useAuth } from '../../state/AuthContext.js'
import { useSubjects } from '../../state/SubjectsContext.js'
import { dashboardSubjects, subjectTimetable } from '../../data/subjectDashboard.js'
import { cancelledDatesIn, classDaysOf, replaceCancellations } from '../../data/cancellations.js'
import { todayInSeoul, weekDisplay, weekOf } from '../../data/subjectDates.js'
import './DashboardPage.css'
import { useDemo } from '../../state/DemoContext.js'

export default function DashboardPage() {
  const { state } = useDemo()
  const { user } = useAuth()
  const { search } = useOutletContext()
  const { data, now, commit, error } = useSubjects()
  const [saveError, setSaveError] = useState('')
  const courses = dashboardSubjects(data, now)
  const [weekOffset, setWeekOffset] = useState(0)
  const { events, exams, weekItems } = subjectTimetable(data, now, weekOffset)
  function change(updater) { try { commit(updater); setSaveError('') } catch (failure) { setSaveError(failure.message) } }
  const [view, setView] = useState('overview')
  const [cancelling, setCancelling] = useState(null)
  const thisWeek = weekOf(todayInSeoul(new Date(now)))
  const cancelSubject = data.subjects.find(subject => subject.id === cancelling)
  const goal = state.profile.goalMinutes
  const pendingCount = data.assignments.filter(item => !item.completed).length
  const hasSubjects = data.subjects.length > 0
  const filtered = courses.filter(course => `${course.title} ${course.teacher}`.includes(search.trim()))
  return (
    <div className={`dashboard-page${hasSubjects ? '' : ' dashboard-page--empty'}`}>
      <section className="dashboard-banner" aria-labelledby="dashboard-title">
        <h1 id="dashboard-title">{state.profile.nickname || user?.nickname}님, 작은 배움으로 오늘의 목표를 채워보세요!</h1>
        <p>{goal ? <>오늘의 목표 : {goal % 60 === 0 ? `${goal / 60}시간` : `${goal}분`} 학습하기{pendingCount ? ` · 남은 과제 ${pendingCount}개` : ''}</> : <>오늘의 목표를 설정해 보세요 · <Link className="dashboard-banner__link" to="/mypage?goal=1">목표 설정</Link></>}</p>
      </section>
      {(error || saveError) && <p role="alert" className="service-error">{error || saveError}</p>}
      {!hasSubjects && <section className="dashboard-card start-guide" aria-labelledby="guide-heading">
        <h2 id="guide-heading">MORAM 시작하기</h2>
        <p>세 단계만 따라 하면 나만의 학습 공간이 준비돼요.</p>
        <ol>
          <li><span>1</span><div><strong>과목 추가</strong><small>이번 학기 수강 과목을 등록해요.</small></div><Link className="button" to="/materials?add=1">과목 추가</Link></li>
          <li><span>2</span><div><strong>시간표 등록</strong><small>수업과 일정을 주간 시간표에 넣어요.</small></div><button className="button" type="button" onClick={() => setView('timetable')}>시간표 등록</button></li>
          <li className="is-pending"><span>3</span><div><strong>시험 일정 등록</strong><small>과목을 추가한 뒤 과목 홈에서 등록해요.</small></div><Link className="button" to="/materials?add=1">시험 일정 등록</Link></li>
        </ol>
      </section>}
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
        <DashboardTasks courses={filtered} hasSubjects={hasSubjects} onCancelClass={setCancelling} />
        </div>
        <Timetable allEvents={data.calendarEvents} examTarget={data.subjects[0] ? `/materials/${data.subjects[0].id}#exams` : '/materials?add=1'} events={events} exams={exams} weekItems={weekItems} weekOffset={weekOffset} onWeekChange={setWeekOffset} now={now} onAdd={event => change(current => ({ ...current, calendarEvents: [...current.calendarEvents, event] }))} />
      </div>
      {cancelSubject && <CancelClassModal title={cancelSubject.name} options={classDaysOf(data, cancelSubject, thisWeek, weekDisplay(now).weekLabels)} cancelled={cancelledDatesIn(data.cancellations, cancelSubject.id, thisWeek)} onSave={dates => change(current => replaceCancellations(current, cancelSubject.id, thisWeek, dates))} onClose={() => setCancelling(null)} />}
    </div>
  )
}
