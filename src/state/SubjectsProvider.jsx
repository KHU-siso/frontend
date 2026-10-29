import { useCallback, useEffect, useRef, useState } from 'react'
import { SubjectsContext } from './SubjectsContext.js'
import { createSubjectState, readSubjectState, SUBJECTS_KEY, validateRecord, validateSubject } from '../data/subjectStore.js'
import { fileRepository } from '../services/subjectFiles.js'
import { ATTENDANCE_OPTIONS, ATTENDANCE_WEEKS } from '../data/attendance.js'
import { currentSemester } from '../data/subjectDates.js'

const SEMESTER_KEY = 'moram.subjects.selected-semester.v1'
function initialSemester() {
  try {
    const value = localStorage.getItem(SEMESTER_KEY)
    if (value === 'all' || /^\d{4}-[12]$/.test(value || '')) return value
  } catch { /* Subject records retain their existing storage/error policy. */ }
  return currentSemester()
}

function initialize() {
  try { return { data: readSubjectState(localStorage), error: '', locked: false } }
  catch (error) { return { data: createSubjectState(), error: error.message || '브라우저 저장소에 접근할 수 없습니다.', locked: true } }
}
export default function SubjectsProvider({ children }) {
  const [initial] = useState(initialize)
  const [data, setData] = useState(initial.data)
  const dataRef = useRef(initial.data)
  const [error, setError] = useState(initial.error)
  const [semester, updateSemester] = useState(initialSemester)
  const setSemester = useCallback(value => {
    if (value !== 'all' && !/^\d{4}-[12]$/.test(value || '')) return
    updateSemester(value)
    try { localStorage.setItem(SEMESTER_KEY, value) }
    catch { setError('학기 선택을 저장하지 못했습니다. 새로고침하면 선택한 학기가 유지되지 않을 수 있습니다.') }
  }, [])
  const semesters = [...new Set([currentSemester(), semester, ...data.subjects.map(subject => subject.semester)])].filter(value => value !== 'all').sort().reverse()
  const [materials, setMaterials] = useState([])
  const [filesStatus, setFilesStatus] = useState({ loading: true, error: '' })
  const [now, setNow] = useState(Date.now)
  // Persist before publishing so failed/quota-limited writes never masquerade as saved.
  const commit = useCallback(updater => {
    if (initial.locked) throw new Error(initial.error)
    const next = updater(dataRef.current)
    try { localStorage.setItem(SUBJECTS_KEY, JSON.stringify(next)) }
    catch { throw new Error('저장 공간이 부족하거나 브라우저 저장소가 차단되었습니다. 입력 내용은 아직 저장되지 않았습니다.') }
    dataRef.current = next
    setData(next)
    setError('')
    return next
  }, [initial])
  useEffect(() => {
    let active = true
    if (!initial.locked) {
      try { localStorage.setItem(SUBJECTS_KEY, JSON.stringify(initial.data)) }
      catch { queueMicrotask(() => { if (active) setError('브라우저에 과목 데이터를 저장하지 못했습니다. 저장 공간과 접근 권한을 확인해주세요.') }) }
    }
    return () => { active = false }
  }, [initial])
  useEffect(() => {
    let active = true
    async function load() {
      try {
        for (const id of dataRef.current.pendingFileDeletions) {
          await fileRepository.removeSubject(id)
          if (active) commit(current => ({ ...current, pendingFileDeletions: current.pendingFileDeletions.filter(value => value !== id) }))
        }
        const rows = await fileRepository.list()
        if (active) { setMaterials(rows.filter(row => dataRef.current.subjects.some(subject => subject.id === row.subjectId))); setFilesStatus({ loading: false, error: '' }) }
      } catch (failure) { if (active) setFilesStatus({ loading: false, error: failure.message }) }
    }
    load()
    return () => { active = false }
  }, [commit])
  useEffect(() => { const tick = () => setNow(Date.now()); const timer = setInterval(tick, 60000); document.addEventListener('visibilitychange', tick); return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick) } }, [])
  const saveSubject = (values, id) => {
    const fields = { name: values.name.trim(), teacher: values.teacher.trim(), semester: values.semester, sessionsPerWeek: Number(values.sessionsPerWeek ?? 1) }
    const errors = validateSubject(fields, dataRef.current.subjects, id)
    if (Object.keys(errors).length) return { errors }
    if (id && !dataRef.current.subjects.some(subject => subject.id === id)) throw new Error('수정할 과목을 찾을 수 없습니다.')
    const subjectId = id || crypto.randomUUID()
    const stamp = new Date().toISOString()
    commit(current => ({ ...current, subjects: id ? current.subjects.map(subject => subject.id === id ? { ...subject, ...fields, updatedAt: stamp } : subject) : [...current.subjects, { ...fields, id: subjectId, source: 'user', room: '', cancelled: false, createdAt: stamp, updatedAt: stamp }] }))
    return { id: subjectId }
  }
  const removeSubject = async id => {
    commit(current => ({ ...current, subjects: current.subjects.filter(subject => subject.id !== id), notes: current.notes.filter(item => item.subjectId !== id), exams: current.exams.filter(item => item.subjectId !== id), assignments: current.assignments.filter(item => item.subjectId !== id), drafts: Object.fromEntries(Object.entries(current.drafts).filter(([, draft]) => draft.subjectId !== id)), attendance: Object.fromEntries(Object.entries(current.attendance || {}).filter(([subjectId]) => subjectId !== id)), calendarEvents: current.calendarEvents.filter(item => item.subjectId !== id), pendingFileDeletions: [...new Set([...current.pendingFileDeletions, id])] }))
    setMaterials(current => current.filter(item => item.subjectId !== id))
    try { await fileRepository.removeSubject(id); commit(current => ({ ...current, pendingFileDeletions: current.pendingFileDeletions.filter(value => value !== id) })); return '' }
    catch { return '과목과 연결 기록은 삭제했습니다. 파일 저장소 정리는 다음 실행 때 다시 시도합니다.' }
  }
  const saveRecord = (kind, subjectId, values, id) => {
    if (!['notes', 'exams', 'assignments'].includes(kind) || !dataRef.current.subjects.some(subject => subject.id === subjectId)) throw new Error('기록을 저장할 과목을 찾을 수 없습니다.')
    const errors = validateRecord(kind, values)
    if (Object.keys(errors).length) return { errors }
    if (id && !dataRef.current[kind].some(item => item.id === id && item.subjectId === subjectId)) throw new Error('수정할 기록을 찾을 수 없습니다.')
    const stamp = new Date().toISOString()
    const record = { ...values, title: values.title.trim(), subjectId, id: id || crypto.randomUUID(), source: 'user', updatedAt: stamp }
    commit(current => ({ ...current, [kind]: id ? current[kind].map(item => item.id === id ? { ...item, ...record } : item) : [...current[kind], { ...record, createdAt: stamp }], ...(kind === 'notes' ? { drafts: Object.fromEntries(Object.entries(current.drafts).filter(([key]) => key !== `${subjectId}:${id || 'new'}`)) } : {}) }))
    return { id: record.id }
  }
  const removeRecord = (kind, subjectId, id) => commit(current => ({ ...current, [kind]: current[kind].filter(item => !(item.id === id && item.subjectId === subjectId)), drafts: Object.fromEntries(Object.entries(current.drafts).filter(([key]) => key !== `${subjectId}:${id}`)) }))
  const saveDraft = useCallback((key, draft) => {
    try { commit(current => ({ ...current, drafts: { ...current.drafts, [key]: { ...draft, updatedAt: new Date().toISOString() } } })); return true }
    catch { return false }
  }, [commit])
  const addFile = async (subjectId, file) => {
    if (!dataRef.current.subjects.some(subject => subject.id === subjectId)) throw new Error('파일을 추가할 과목이 없습니다.')
    const meta = await fileRepository.add(subjectId, file)
    if (!dataRef.current.subjects.some(subject => subject.id === subjectId)) { await fileRepository.remove(meta.id); throw new Error('업로드 도중 과목이 삭제되었습니다.') }
    setMaterials(current => [...current, meta])
    setFilesStatus({ loading: false, error: '' })
    return meta
  }
  const removeFile = async id => { await fileRepository.remove(id); setMaterials(current => current.filter(item => item.id !== id)) }
  const saveAttendance = (subjectId, week, session, status) => {
    const subject = dataRef.current.subjects.find(subject => subject.id === subjectId)
    if (!subject) throw new Error('출결을 기록할 과목이 없습니다.')
    if (!Number.isInteger(week) || week < 1 || week > ATTENDANCE_WEEKS || !ATTENDANCE_OPTIONS.some(option => option.value === status)) throw new Error('올바른 주차와 출결 상태를 선택해주세요.')
    if (!Number.isInteger(session) || session < 1 || session > (subject.sessionsPerWeek ?? 1)) throw new Error('과목의 주당 수업 횟수에 맞는 회차를 선택해주세요.')
    commit(current => ({ ...current, attendance: { ...current.attendance, [subjectId]: { ...current.attendance?.[subjectId], [week]: { ...current.attendance?.[subjectId]?.[week], [session]: status } } } }))
  }
  return <SubjectsContext.Provider value={{ data, semester, setSemester, semesters, materials, filesStatus, now, error, commit, saveSubject, removeSubject, saveRecord, removeRecord, saveDraft, addFile, removeFile, saveAttendance }}>{children}</SubjectsContext.Provider>
}
