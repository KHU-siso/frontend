import { useState } from 'react'
import { ATTENDANCE_OPTIONS, ATTENDANCE_WEEKS } from '../../data/attendance.js'
import { useSubjects } from '../../state/SubjectsContext.js'
import './SubjectAttendance.css'

export default function SubjectAttendance({ subject }) {
  const { data, saveAttendance } = useSubjects()
  const [feedback, setFeedback] = useState(null)
  const count = subject.sessionsPerWeek ?? 1
  function change(week, session, value) {
    try { saveAttendance(subject.id, week, session, value); setFeedback({ ok: true, text: `${week}주 ${session}회차 출결: ${ATTENDANCE_OPTIONS.find(option => option.value === value).label} · 저장됨` }) }
    catch (error) { setFeedback({ ok: false, text: error.message }) }
  }
  return <div className="subject-attendance">
    <div className="attendance-scroll" role="region" aria-label={`${subject.name} 14주 출결`} tabIndex={0}>
      <table className="attendance-table">
        <caption>14주 출결 · 주 {count}회</caption>
        <thead><tr>{Array.from({ length: ATTENDANCE_WEEKS }, (_, i) => <th scope="col" key={i}>{i + 1}주</th>)}</tr></thead>
        <tbody><tr>{Array.from({ length: ATTENDANCE_WEEKS }, (_, i) => {
          const week = i + 1
          return <td key={week}><div className="attendance-sessions">{Array.from({ length: count }, (_, index) => {
            const session = index + 1
            const value = data.attendance?.[subject.id]?.[week]?.[session] || 'unset'
            return <label className="attendance-session" key={session}>{count > 1 && <span>{session}회차</span>}<select className={`attendance-select attendance-select--${value}`} aria-label={`${subject.name} ${week}주${count > 1 ? ` ${session}회차` : ''} 출결`} value={value} onChange={event => change(week, session, event.target.value)}>{ATTENDANCE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          })}</div></td>
        })}</tr></tbody>
      </table>
    </div>
    <p className="subject-muted">각 주의 상태를 눌러 출결을 입력하거나 수정할 수 있습니다. 직접 입력한 기록은 이 브라우저에 저장되며 학교 출결과 자동 연동되지 않습니다.</p>
    {feedback && <p className={feedback.ok ? 'subject-muted' : 'service-error'} role={feedback.ok ? 'status' : 'alert'}>{feedback.text}</p>}
  </div>
}
