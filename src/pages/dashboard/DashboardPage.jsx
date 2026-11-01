import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardMascot from '../../components/dashboard/DashboardMascot.jsx'
import DashboardTasks from '../../components/dashboard/DashboardTasks.jsx'
import CancelClassModal from '../../components/dashboard/CancelClassModal.jsx'
import AssignmentQuickModal from '../../components/dashboard/AssignmentQuickModal.jsx'
import { SubjectForm } from '../../components/subjects/SubjectForms.jsx'
import SubjectPickerModal from '../../components/subjects/SubjectPickerModal.jsx'
import Timetable from '../../components/dashboard/Timetable.jsx'
import { useAuth } from '../../state/AuthContext.js'
import { useSubjects } from '../../state/SubjectsContext.js'
import { subjectTimetable, todoItems } from '../../data/subjectDashboard.js'
import { cancellationList, cancelledDatesIn, classDaysOf, removeCancellation, replaceCancellations } from '../../data/cancellations.js'
import { weekAt, weekDisplay } from '../../data/subjectDates.js'
import './DashboardPage.css'
import { useDemo } from '../../state/DemoContext.js'

export default function DashboardPage() {
  const { state } = useDemo()
  const { user } = useAuth()
  const { data, now, commit, error, saveNow, setSemester } = useSubjects()
  const [saveError, setSaveError] = useState('')
  const items = todoItems(data, now)
  const [weekOffset, setWeekOffset] = useState(0)
  const { events, exams } = subjectTimetable(data, now, weekOffset)
  function change(updater) { try { commit(updater); setSaveError('') } catch (failure) { setSaveError(failure.message) } }
  const [view, setView] = useState('overview')
  const [cancelling, setCancelling] = useState(false)
  const [addingSubject, setAddingSubject] = useState(false)
  const [picker, setPicker] = useState(null) // 'study' | 'task' | 'chat'
  const [taskSubject, setTaskSubject] = useState(null)
  const [quickNotice, setQuickNotice] = useState('')
  const navigate = useNavigate()
  const viewedWeek = weekAt(now, weekOffset)
  const viewedLabels = weekDisplay(now, weekOffset)
  function toggleTask(id) { change(current => ({ ...current, assignments: current.assignments.map(task => task.id === id ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } : task) })) }
  const goal = state.profile.goalMinutes
  const pendingCount = data.assignments.filter(item => !item.completed).length
  const hasSubjects = data.subjects.length > 0
  return (
    <div className={`dashboard-page${hasSubjects ? '' : ' dashboard-page--empty'}`}>
      <section className="dashboard-banner" aria-labelledby="dashboard-title">
        <h1 id="dashboard-title">{state.profile.nickname || user?.nickname}님, 작은 배움으로 오늘의 목표를 채워보세요!</h1>
        <p>{goal ? <>오늘의 목표 : {goal % 60 === 0 ? `${goal / 60}시간` : `${goal}분`} 학습하기{pendingCount ? ` · 남은 과제 ${pendingCount}개` : ''}</> : <>오늘의 목표를 설정해 보세요 · <Link className="dashboard-banner__link" to="/mypage?goal=1">목표 설정</Link></>}</p>
      </section>
      {(error || saveError) && <p role="alert" className="service-error">{error || saveError}</p>}
      {quickNotice && <p className="quick-notice" role="status">{quickNotice}</p>}
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
          <div className="quick-actions">
            <Link className="quick-action quick-action--0" to="/materials">강의자료실</Link>
            <button type="button" className="quick-action quick-action--1" onClick={() => setPicker('study')}>문제풀기</button>
            <button type="button" className="quick-action quick-action--2" onClick={() => setPicker('task')}>과제 등록</button>
            <button type="button" className="quick-action quick-action--3" onClick={() => setPicker('chat')}>AI chat</button>
          </div>
        </section>
        <DashboardTasks items={items} firstSubjectId={data.subjects[0]?.id} onToggle={toggleTask} onAddTask={() => setPicker('task')} />
        </div>
        <Timetable allEvents={data.calendarEvents} examTarget={data.subjects[0] ? `/materials/${data.subjects[0].id}#exams` : '/materials?add=1'} events={events} exams={exams} weekOffset={weekOffset} onWeekChange={setWeekOffset} now={now} onCancelClass={() => setCancelling(true)} onAdd={event => change(current => ({ ...current, calendarEvents: [...current.calendarEvents, event] }))} onAddPersonal={event => change(current => ({ ...current, calendarEvents: [...current.calendarEvents, event] }))} onAddSubject={() => setAddingSubject(true)} onUpdateEvent={(event, patch) => { const { name, ...timing } = patch; change(current => ({ ...current, subjects: event.subjectId ? current.subjects.map(subject => subject.id === event.subjectId ? { ...subject, name, updatedAt: new Date().toISOString() } : subject) : current.subjects, calendarEvents: current.calendarEvents.map(item => item.id === event.id ? { ...item, ...timing, ...(event.subjectId ? {} : { name }), ...(item.date ? { day: item.day } : {}) } : item) })); saveNow() }} onRemoveEvent={id => { change(current => ({ ...current, calendarEvents: current.calendarEvents.filter(event => event.id !== id) })); saveNow() }} />
      </div>
      {addingSubject && <SubjectForm onClose={() => setAddingSubject(false)} onSaved={(_id, term) => { setSemester(term); setAddingSubject(false); setQuickNotice('과목을 추가했어요.'); saveNow() }} />}
      {picker && <SubjectPickerModal title={{ study: '어떤 과목의 문제를 풀까요?', task: '어떤 과목의 과제를 등록할까요?', chat: '어떤 과목의 AI 채팅을 열까요?' }[picker]} subjects={data.subjects} onClose={() => setPicker(null)}
        onPick={subject => { setPicker(null); if (picker === 'task') setTaskSubject(subject); else navigate(picker === 'chat' ? `/materials/${subject.id}#chat` : picker === 'study' ? `/study/setup?course=${subject.id}` : `/materials/${subject.id}`) }} />}
      {taskSubject && <AssignmentQuickModal subject={taskSubject} onSaved={title => setQuickNotice(`'${title}' 과제를 등록했어요.`)} onClose={() => setTaskSubject(null)} />}
      {cancelling && <CancelClassModal subjects={data.subjects} weekRange={viewedLabels.weekRange} optionsFor={subject => classDaysOf(data, subject, viewedWeek, viewedLabels.weekLabels)} cancelledFor={subject => cancelledDatesIn(data.cancellations, subject.id, viewedWeek)} cancellations={cancellationList(data)} onRestore={(subjectId, date) => change(current => removeCancellation(current, subjectId, date))} onSave={(subject, dates) => change(current => replaceCancellations(current, subject.id, viewedWeek, dates))} onClose={() => setCancelling(false)} />}
    </div>
  )
}
