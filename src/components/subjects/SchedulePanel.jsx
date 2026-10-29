import { useState } from 'react'
import { useSubjects } from '../../state/SubjectsContext.js'
import { dDay, dueState } from '../../data/subjectDates.js'
import { ConfirmDelete, RecordForm } from './SubjectForms.jsx'

export default function SchedulePanel({ kind, subjectId, notify }) {
  const { data, now, removeRecord, commit } = useSubjects()
  const exams = kind === 'exams'
  const label = exams ? '시험' : '과제'
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const all = data[kind].filter(item => item.subjectId === subjectId)
  const items = all.filter(item => exams ? filter === 'all' || (dueState(item, now) === 'overdue') === (filter === 'past') : filter === 'all' || item.completed === (filter === 'done')).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  function toggle(item) { try { commit(current => ({ ...current, assignments: current.assignments.map(task => task.id === item.id ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } : task) })); notify(item.completed ? '과제를 미완료로 변경했습니다.' : '과제를 완료했습니다. 대시보드에도 반영됩니다.') } catch (failure) { notify(failure.message) } }
  return <section className={`service-card subject-panel subject-panel--${kind}`} id={kind} aria-labelledby={`subject-${kind}-title`}>
    <header className="subject-panel__heading"><div><span className="subject-eyebrow">{exams ? 'EXAM SCHEDULE' : 'ASSIGNMENTS'}</span><h2 id={`subject-${kind}-title`}>{exams ? '시험 일정' : '과제'} <small>{all.length}</small></h2></div><button className="subject-add-button" type="button" onClick={() => setEditing({})}>＋ {label} 추가</button></header>
    <div className="subject-filters" aria-label={`${label} 필터`}>{(exams ? [['all', '전체'], ['upcoming', '예정'], ['past', '지난 시험']] : [['all', '전체'], ['pending', '미완료'], ['done', '완료']]).map(([value, name]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{name}</button>)}</div>
    <div className="subject-record-list">{items.map(item => {
      const status = dueState(item, now)
      const complete = !exams && item.completed
      return <article className={`subject-schedule ${complete ? 'is-complete' : ''}`} key={item.id}>
        <div className="subject-schedule__title">{!exams && <input type="checkbox" checked={!!item.completed} aria-label={`${item.title} 완료`} onChange={() => toggle(item)} />}<h3>{item.title}</h3><span className={`subject-pill subject-pill--${complete ? 'done' : status}`}>{complete ? '완료' : exams ? status === 'overdue' ? '지난 시험' : dDay(item.date) : status === 'overdue' ? '마감 지남' : status === 'soon' ? '마감 임박' : dDay(item.date)}</span></div>
        <p className="subject-schedule__date">{item.date.replaceAll('-', '.')} · {item.time || (exams ? '시간 미정' : '당일 자정까지')}{exams && item.location ? ` · ${item.location}` : ''}</p>
        {item.description && <p className="subject-schedule__description">{item.description}</p>}
        <div className="subject-schedule__footer">{item.source === 'example' && <span className="subject-example">예시 일정</span>}<div className="subject-item-actions"><button type="button" onClick={() => setEditing(item)} aria-label={`${item.title} ${label} 수정`}>수정</button><button type="button" className="is-danger" onClick={() => setDeleting(item)} aria-label={`${item.title} ${label} 삭제`}>삭제</button></div></div>
      </article>
    })}</div>
    {!items.length && <div className="subject-empty"><strong>{all.length ? '이 조건에 맞는 일정이 없어요' : `${exams ? '시험 일정을' : '첫 과제를'} 등록해보세요`}</strong><p>{exams ? '중간고사부터 작은 퀴즈까지, 날짜와 범위를 모아두세요.' : '제출 기한을 정리하고 하나씩 완료해보세요.'}</p></div>}
    {editing && <RecordForm kind={kind} subjectId={subjectId} record={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); notify(`${label} 일정을 저장했습니다.`) }} />}
    {deleting && <ConfirmDelete title={`${label} 삭제`} description={`‘${deleting.title}’ ${label} 기록을 삭제합니다. 대시보드에도 반영됩니다.`} onClose={() => setDeleting(null)} onConfirm={() => { removeRecord(kind, subjectId, deleting.id); setDeleting(null); notify(`${label} 기록을 삭제했습니다.`) }} />}
  </section>
}
