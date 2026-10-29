import { courses as exampleCourses } from './learningDemo.js'
import { initialEvents } from './dashboard.js'
import { dueState, shiftDate, todayInSeoul, validDate } from './subjectDates.js'
import { normalizeAttendance, validSessionCount } from './attendance.js'

export const SUBJECTS_KEY = 'moram.subjects.v1'
export const normalizedName = value => String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko-KR')
export function createSubjectState() {
  const today = todayInSeoul()
  const createdAt = new Date().toISOString()
  const subjects = [...exampleCourses, { id: 'research', name: '주제 연구', teacher: '담당 교수 A', semester: '2026-2', room: '' }].map(subject => ({ ...subject, source: 'example', createdAt, updatedAt: createdAt, cancelled: false, sessionsPerWeek: 1 }))
  const pinned = ['research', 'citizen', 'writing', 'values']
  const titles = ['연구 개요 작성', '강의 복습 정리', '성찰문 작성', '읽기 활동 정리']
  const completedCounts = [2, 1, 3, 4]
  const assignments = pinned.flatMap((subjectId, i) => Array.from({ length: 5 }, (_, j) => ({ id: `example-task-${subjectId}-${j}`, subjectId, title: j === completedCounts[i] ? titles[i] : `${j + 1}주차 학습 정리`, date: shiftDate(today, i === 0 && j >= 2 ? -2 : j), time: '', description: '기존 화면의 학습 현황을 공통 데이터로 옮긴 예시 과제입니다. 수정하거나 삭제할 수 있습니다.', completed: j < completedCounts[i], source: 'example', createdAt, updatedAt: createdAt })))
  const exams = pinned.map((subjectId, i) => ({ id: `example-exam-${subjectId}`, subjectId, title: '중간고사', date: shiftDate(today, [10, 11, 9, 8][i]), time: '', location: '', description: '기존 대시보드의 D-day 예시입니다. 실제 일정으로 수정해주세요.', source: 'example', createdAt, updatedAt: createdAt }))
  return { version: 1, subjects, notes: [], exams, assignments, drafts: {}, attendance: {}, pendingFileDeletions: [], calendarEvents: initialEvents.map(event => ({ ...event, subjectId: ['photo', 'design'].includes(event.id) ? event.id : null, source: 'example' })) }
}
export function readSubjectState(storage) {
  const text = storage.getItem(SUBJECTS_KEY)
  if (!text) return createSubjectState()
  const raw = JSON.parse(text)
  if (raw.version !== 1 || !Array.isArray(raw.subjects) || !['notes', 'exams', 'assignments', 'calendarEvents', 'pendingFileDeletions'].every(key => Array.isArray(raw[key])) || !raw.drafts || typeof raw.drafts !== 'object') throw new Error('저장된 과목 데이터를 읽을 수 없습니다. 원본 데이터는 덮어쓰지 않았습니다.')
  const ids = new Set()
  for (const subject of raw.subjects) {
    if (typeof subject.id !== 'string' || !subject.id || ids.has(subject.id) || typeof subject.name !== 'string' || !subject.name.trim() || typeof subject.teacher !== 'string' || !subject.teacher.trim() || !/^\d{4}-[12]$/.test(subject.semester)) throw new Error('저장된 과목 데이터 형식이 올바르지 않습니다. 원본을 보존했습니다.')
    ids.add(subject.id)
    if (subject.sessionsPerWeek !== undefined && !validSessionCount(subject.sessionsPerWeek)) throw new Error('저장된 주당 수업 횟수가 올바르지 않습니다. 원본을 보존했습니다.')
  }
  for (const key of ['notes', 'exams', 'assignments']) if (raw[key].some(item => !item.id || !ids.has(item.subjectId) || typeof item.title !== 'string' || !Number.isFinite(Date.parse(item.createdAt)) || !Number.isFinite(Date.parse(item.updatedAt)) || (key === 'notes' ? typeof item.body !== 'string' : !validDate(item.date) || (item.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time))))) throw new Error('과목에 연결된 기록을 읽을 수 없어 저장을 중단했습니다. 원본 데이터는 보존했습니다.')
  if (Object.values(raw.drafts).some(draft => !ids.has(draft.subjectId) || typeof draft.title !== 'string' || typeof draft.body !== 'string')) throw new Error('노트 초안의 형식이 올바르지 않습니다. 원본을 보존했습니다.')
  // Add the optional field to older v1 stores without changing any existing records.
  const attendance = normalizeAttendance(raw.attendance ?? {}, ids)
  return { ...raw, subjects: raw.subjects.map(subject => ({ ...subject, sessionsPerWeek: subject.sessionsPerWeek ?? 1 })), attendance }
}
export function validateSubject(values, subjects, exceptId) {
  const errors = {}
  if (!values.name.trim()) errors.name = '과목 이름을 입력해주세요.'
  if (!/^\d{4}-[12]$/.test(values.semester)) errors.semester = '학기를 선택해주세요.'
  if (!values.teacher.trim()) errors.teacher = '교수 이름을 입력해주세요.'
  if (!validSessionCount(values.sessionsPerWeek ?? 1)) errors.sessionsPerWeek = '주당 수업 횟수를 1~7회 중에서 선택해주세요.'
  if (subjects.some(subject => subject.id !== exceptId && subject.semester === values.semester && normalizedName(subject.name) === normalizedName(values.name))) errors.name = '같은 학기에 이미 등록한 과목입니다.'
  return errors
}
export function validateRecord(kind, values) {
  const errors = {}
  if (!values.title.trim()) errors.title = `${kind === 'notes' ? '노트' : kind === 'exams' ? '시험' : '과제'} 제목을 입력해주세요.`
  if (kind !== 'notes' && !validDate(values.date)) errors.date = '올바른 날짜를 입력해주세요.'
  if (kind !== 'notes' && values.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(values.time)) errors.time = '올바른 시간을 입력해주세요.'
  return errors
}
export function subjectSummary(data, subjectId, now = Date.now()) {
  const tasks = data.assignments.filter(item => item.subjectId === subjectId)
  const pending = tasks.filter(item => !item.completed).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const nextExam = data.exams.filter(item => item.subjectId === subjectId && dueState(item, now) !== 'overdue').sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
  return { pending, nextExam, progress: tasks.length ? Math.round(tasks.filter(item => item.completed).length / tasks.length * 100) : 0, taskCount: tasks.length }
}
