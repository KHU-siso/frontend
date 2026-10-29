import { useState } from 'react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import { useSubjects } from '../../state/SubjectsContext.js'
import { currentSemester } from '../../data/subjectDates.js'
import './SubjectUI.css'
import { MAX_WEEKLY_SESSIONS } from '../../data/attendance.js'

export function SubjectForm({ subject, semester, onClose, onSaved }) {
  const { saveSubject } = useSubjects()
  const [values, setValues] = useState(subject ? { ...subject, sessionsPerWeek: subject.sessionsPerWeek ?? 1 } : { name: '', teacher: '', semester: semester || currentSemester(), sessionsPerWeek: 1 })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const years = Array.from(new Set([Number(values.semester.slice(0, 4)), ...Array.from({ length: 8 }, (_, i) => Number(currentSemester().slice(0, 4)) - 2 + i)] )).sort((a, b) => b - a)
  function submit(event) {
    event.preventDefault()
    try { const result = saveSubject(values, subject?.id); if (result.errors) setErrors(result.errors); else onSaved(result.id, values.semester) }
    catch (failure) { setError(failure.message) }
  }
  const field = (name, label) => <label className="service-field">{label}<input name={name} aria-label={label} required maxLength={name === 'name' ? 100 : 60} value={values[name]} onChange={event => setValues(current => ({ ...current, [name]: event.target.value }))} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `subject-${name}-error` : undefined} />{errors[name] && <span className="field-error" id={`subject-${name}-error`}>{errors[name]}</span>}</label>
  return <Modal title={subject ? '과목 수정' : '새 과목 등록'} onClose={onClose}>
    <form className="subject-form" onSubmit={submit} noValidate>
      {field('name', '과목 이름 (필수)')}
      <label className="service-field">학기 (필수)<select aria-label="학기 (필수)" value={values.semester} onChange={event => setValues(current => ({ ...current, semester: event.target.value }))}>{years.flatMap(year => [2, 1].map(term => <option key={`${year}-${term}`} value={`${year}-${term}`}>{year}년 {term}학기</option>))}</select>{errors.semester && <span className="field-error">{errors.semester}</span>}</label>
      {field('teacher', '교수 이름 (필수)')}
      <label className="service-field">주당 수업 횟수<select aria-label="주당 수업 횟수" value={values.sessionsPerWeek} onChange={event => setValues(current => ({ ...current, sessionsPerWeek: Number(event.target.value) }))}>{Array.from({ length: MAX_WEEKLY_SESSIONS }, (_, i) => <option key={i + 1} value={i + 1}>주 {i + 1}회</option>)}</select>{errors.sessionsPerWeek && <span className="field-error">{errors.sessionsPerWeek}</span>}</label>
      <p className="subject-muted">매주 {values.sessionsPerWeek}번, 14주 동안 회차별로 출결을 입력합니다.{subject ? ' 횟수를 줄여도 기존 회차 기록은 보관되며 다시 늘리면 표시됩니다.' : ''}</p>
      {error && <p className="service-error" role="alert">{error}</p>}
      <div className="subject-form__actions"><button type="button" className="service-plain-button" onClick={onClose}>취소</button><Button type="submit">{subject ? '변경 저장' : '과목 등록'}</Button></div>
    </form>
  </Modal>
}

export function ConfirmDelete({ title, description, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function confirm() { setBusy(true); try { await onConfirm() } catch (failure) { setError(failure.message); setBusy(false) } }
  return <Modal title={title} onClose={onClose} preventClose={busy}><p className="subject-delete-description">{description}</p>{error && <p className="service-error" role="alert">{error}</p>}<div className="subject-form__actions"><button className="service-plain-button" type="button" onClick={onClose} disabled={busy}>취소</button><button className="subject-danger-button" type="button" onClick={confirm} disabled={busy}>{busy ? '삭제 중…' : '삭제하기'}</button></div></Modal>
}

export function RecordForm({ kind, record, subjectId, onClose, onSaved }) {
  const { saveRecord } = useSubjects()
  const label = kind === 'exams' ? '시험' : '과제'
  const [values, setValues] = useState(record || { title: '', date: '', time: '', location: '', description: '', completed: false })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    try { const result = saveRecord(kind, subjectId, values, record?.id); if (result.errors) setErrors(result.errors); else onSaved() }
    catch (failure) { setError(failure.message) }
  }
  const field = (name, title, type = 'text', required = false) => <label className="service-field">{title}<input aria-label={title} type={type} required={required} value={values[name] || ''} maxLength={name === 'title' ? 120 : 120} onChange={event => setValues(current => ({ ...current, [name]: event.target.value }))} aria-invalid={!!errors[name]} />{errors[name] && <span className="field-error">{errors[name]}</span>}</label>
  return <Modal title={`${label} ${record ? '수정' : '추가'}`} onClose={onClose}><form className="subject-form" onSubmit={submit} noValidate>
    {field('title', `${label} 이름 (필수)`, 'text', true)}
    <div className="subject-form__row">{field('date', kind === 'exams' ? '시험 날짜 (필수)' : '마감 날짜 (필수)', 'date', true)}{field('time', kind === 'exams' ? '시험 시간 (선택)' : '마감 시간 (선택)', 'time')}</div>
    {kind === 'exams' && field('location', '시험 장소 (선택)')}
    <label className="service-field">{kind === 'exams' ? '시험 범위 / 메모 (선택)' : '과제 설명 (선택)'}<textarea rows={4} maxLength={10000} value={values.description || ''} onChange={event => setValues(current => ({ ...current, description: event.target.value }))} /></label>
    {!values.time && <p className="subject-muted">시간을 비워두면 해당 날짜가 끝날 때까지 예정으로 표시합니다.</p>}
    {error && <p className="service-error" role="alert">{error}</p>}
    <div className="subject-form__actions"><button type="button" className="service-plain-button" onClick={onClose}>취소</button><Button type="submit">{label} 저장</Button></div>
  </form></Modal>
}
