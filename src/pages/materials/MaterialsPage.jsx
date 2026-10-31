import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { EmptyState, PageTitle } from '../../components/service/ServiceUI.jsx'
import { useSubjects } from '../../state/SubjectsContext.js'
import { semesterLabel } from '../../data/subjectDates.js'
import { ConfirmDelete, SubjectForm } from '../../components/subjects/SubjectForms.jsx'
import SubjectAttendance from '../../components/subjects/SubjectAttendance.jsx'
import SemesterSelect from '../../components/subjects/SemesterSelect.jsx'
import './MaterialsPage.css'

export default function MaterialsPage() {
  const { search } = useOutletContext()
  const { data, semester, setSemester, materials, error, removeSubject } = useSubjects()
  const courses = data.subjects
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState([])
  const [attendanceOpen, setAttendanceOpen] = useState({})
  const visible = courses.filter(course => (semester === 'all' || course.semester === semester) && `${course.name} ${course.teacher}`.includes(search.trim()))
  function toggle(id) { setExpanded(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]) }
  return (
    <div className="service-page materials-page">
      <PageTitle title="자료실" description="강의자료와 학습 자료를 한 눈에 확인해보세요."><button className="button materials-add" type="button" onClick={() => setEditing({})}>＋ 과목 추가</button></PageTitle>
      {error && <p className="service-error" role="alert">{error}</p>}
      {message && <p className="subject-feedback" role="status">{message}</p>}
      <div className="service-toolbar"><SemesterSelect selectClassName="materials-semester-select" /><span className="subject-muted">{visible.length}개 과목 · 과목과 학습 기록은 이 브라우저에 저장됩니다.</span></div>
      <div className="materials-summary"><div className="service-card"><span>공지</span><strong>0</strong></div><div className="service-card"><span>메시지</span><strong>0</strong></div></div>
      <div className="materials-courses">
        {visible.map(course => {
          const open = expanded.includes(course.id)
          return <article className="service-card material-course" key={course.id}>
            <div className="material-course__header"><button className="material-course__toggle" type="button" aria-expanded={open} aria-controls={`course-details-${course.id}`} onClick={() => toggle(course.id)}><svg className="material-course__chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg><span><strong>{course.name}</strong><small>{semesterLabel(course.semester)} · {course.teacher} · 주 {course.sessionsPerWeek ?? 1}회</small></span></button><dl className="material-course__counts"><div><dt>노트</dt><dd>{data.notes.filter(item => item.subjectId === course.id).length}</dd></div><div><dt>시험</dt><dd>{data.exams.filter(item => item.subjectId === course.id).length}</dd></div><div><dt>미완료 과제</dt><dd>{data.assignments.filter(item => item.subjectId === course.id && !item.completed).length}</dd></div><div><dt>강의자료</dt><dd>{materials.filter(item => item.subjectId === course.id).length}</dd></div></dl><Link className="material-course__home" to={`/materials/${course.id}`}>과목 홈 바로가기 →</Link></div>
            <div className="material-course__manage"><span className="subject-muted">직접 등록한 과목</span><div className="subject-item-actions"><button type="button" aria-label={`${course.name} 과목 수정`} onClick={() => setEditing(course)}>수정</button><button type="button" className="is-danger" aria-label={`${course.name} 과목 삭제`} onClick={() => setDeleting(course)}>삭제</button></div></div>
            {open && <div className="material-course__details" id={`course-details-${course.id}`}>
              <div className="material-course__actions"><Link className="service-plain-button" to={`/study/setup?course=${course.id}`}>학습하기 →</Link><Link className="service-plain-button" to={`/materials/${course.id}#materials`}>강의자료 관리 →</Link>{<button className="service-plain-button" type="button" aria-expanded={attendanceOpen[course.id] !== false} onClick={() => setAttendanceOpen(current => ({ ...current, [course.id]: current[course.id] === false }))}>{attendanceOpen[course.id] === false ? '출결 확인' : '출결 접기'}</button>}</div>
              <p className="subject-muted">과목 홈에서 노트, 시험, 과제와 강의자료를 관리할 수 있습니다.</p>
              {attendanceOpen[course.id] !== false && <SubjectAttendance key={course.id} subject={course} />}
            </div>}
          </article>
        })}
        {!visible.length && <EmptyState title="해당 과목이 없습니다">학기나 검색어를 변경해주세요.</EmptyState>}
      </div>

      {editing && <SubjectForm subject={editing.id ? editing : null} semester={semester === 'all' ? undefined : semester} onClose={() => setEditing(null)} onSaved={(_id, term) => { setSemester(term); setEditing(null); setMessage('과목 정보를 저장했습니다.') }} />}
      {deleting && <ConfirmDelete title="과목 삭제" description={`‘${deleting.name}’ 과목과 연결된 노트 ${data.notes.filter(item => item.subjectId === deleting.id).length}개, 시험 ${data.exams.filter(item => item.subjectId === deleting.id).length}개, 과제 ${data.assignments.filter(item => item.subjectId === deleting.id).length}개, 강의자료 ${materials.filter(item => item.subjectId === deleting.id).length}개, 작성 중인 초안, 출결 기록 및 연결 일정을 함께 삭제합니다. 이 작업은 되돌릴 수 없습니다. 기존 코인·아이템·퀴즈 기록은 유지됩니다.`} onClose={() => setDeleting(null)} onConfirm={async () => { const warning = await removeSubject(deleting.id); setDeleting(null); setMessage(warning || '과목과 연결된 기록을 삭제했습니다.') }} />}
    </div>
  )
}
