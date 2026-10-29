import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/service/ServiceUI.jsx'
import { useSubjects } from '../../state/SubjectsContext.js'
import { dDay, formatStamp, semesterLabel } from '../../data/subjectDates.js'
import { subjectSummary } from '../../data/subjectStore.js'
import { ConfirmDelete, SubjectForm } from '../../components/subjects/SubjectForms.jsx'
import NotesPanel from '../../components/subjects/NotesPanel.jsx'
import SchedulePanel from '../../components/subjects/SchedulePanel.jsx'
import SubjectMaterials from '../../components/subjects/SubjectMaterials.jsx'
import './SubjectHomePage.css'

export default function SubjectHomePage() {
  const { subjectId } = useParams()
  // Reset per-subject filters/modals on route changes, while preserving shared data.
  return <SubjectHome key={subjectId} subjectId={subjectId} />
}
function SubjectHome({ subjectId }) {
  const { data, materials, now, error, removeSubject } = useSubjects()
  const { search } = useOutletContext()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const subject = data.subjects.find(item => item.id === subjectId)
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }) }, [hash])
  if (!subject) return <EmptyState title="과목을 찾을 수 없습니다" to="/materials" linkLabel="자료실로 돌아가기">삭제되었거나 존재하지 않는 과목입니다. 자료실에서 과목을 확인해주세요.</EmptyState>
  const summary = subjectSummary(data, subjectId, now)
  const notes = data.notes.filter(item => item.subjectId === subjectId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const count = materials.filter(item => item.subjectId === subjectId).length
  return <div className="service-page subject-home">
    <div className="subject-breadcrumb"><Link to="/materials">← 자료실로 돌아가기</Link><div className="subject-item-actions"><button type="button" onClick={() => setEditing(true)}>과목 수정</button><button type="button" className="is-danger" onClick={() => setDeleting(true)}>과목 삭제</button></div></div>
    <header className="subject-hero"><div className="subject-hero__info"><span className="subject-hero__term">{semesterLabel(subject.semester)}{subject.source === 'example' ? ' · 기본 제공 예시' : ''}</span><h1>{subject.name}</h1><p>{subject.teacher} · 주 {subject.sessionsPerWeek ?? 1}회{subject.room ? ` · ${subject.room}` : ''}</p><Link to={`/study/setup?course=${subjectId}`}>이 과목으로 학습하기 →</Link></div><div className="subject-hero__progress"><span>과제 완료율</span><strong>{summary.progress}<small>%</small></strong><progress max="100" value={summary.progress} aria-label="과목 과제 완료율" /><span>{summary.taskCount - summary.pending.length} / {summary.taskCount}개 완료</span></div></header>
    {error && <p className="service-error" role="alert">{error}</p>}
    {message && <p className="subject-feedback" role="status">{message}</p>}
    <dl className="subject-overview"><div><dt>다음 시험</dt><dd>{summary.nextExam ? dDay(summary.nextExam.date) : '일정 없음'}</dd><span>{summary.nextExam ? `${summary.nextExam.title} · ${summary.nextExam.date}` : '시험 일정을 등록해보세요'}</span></div><div><dt>진행 중인 과제</dt><dd>{summary.pending.length}<small>개</small></dd><span>{summary.pending[0] ? `가장 빠른 마감 · ${summary.pending[0].date}` : '지금은 미완료 과제가 없어요'}</span></div><div><dt>보관한 강의자료</dt><dd>{count}<small>개</small></dd><span>이 브라우저에 저장된 파일</span></div><div><dt>최근 학습 기록</dt><dd>{notes.length}<small>개 노트</small></dd><span>{notes[0] ? `${notes[0].title} · ${formatStamp(notes[0].updatedAt)}` : '오늘의 배움을 기록해보세요'}</span></div></dl>
    <nav className="subject-section-nav" aria-label="과목 홈 영역"><a href="#notes">학습 노트</a><a href="#exams">시험 일정</a><a href="#assignments">과제</a><a href="#materials">강의자료</a></nav>
    <div className="subject-home-grid"><NotesPanel subjectId={subjectId} globalSearch={search} notify={setMessage} /><SchedulePanel kind="exams" subjectId={subjectId} notify={setMessage} /><SchedulePanel kind="assignments" subjectId={subjectId} notify={setMessage} /><SubjectMaterials subjectId={subjectId} notify={setMessage} /></div>
    {editing && <SubjectForm subject={subject} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); setMessage('과목 정보를 수정했습니다. 자료실과 대시보드에도 반영됩니다.') }} />}
    {deleting && <ConfirmDelete title="과목 삭제" description={`‘${subject.name}’ 과목과 연결된 모든 노트, 초안, 시험, 과제, 강의자료 및 일정을 삭제합니다. 출결 기록도 함께 삭제합니다. 되돌릴 수 없습니다. 기존 코인·아이템·퀴즈 기록은 삭제하지 않습니다.`} onClose={() => setDeleting(false)} onConfirm={async () => { const warning = await removeSubject(subjectId); if (warning) window.alert(warning); navigate('/materials', { replace: true }) }} />}
  </div>
}
