import { dueState, validDate } from './subjectDates.js'
import { normalizeAttendance, validSessionCount } from './attendance.js'

export const normalizedName = value => String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko-KR')
const validCancellation = item => Boolean(item) && typeof item.subjectId === 'string' && validDate(item.date)
export function createSubjectState() {
  return { version: 1, subjects: [], notes: [], exams: [], assignments: [], drafts: {}, attendance: {}, pendingFileDeletions: [], calendarEvents: [], cancellations: [] }
}
// 예전 버전이 모든 계정에 심어 두었던 예시(source: 'example') 과목·일정을 걸러낸다.
function withoutExamples(state) {
  const exampleIds = new Set(state.subjects.filter(subject => subject.source === 'example').map(subject => subject.id))
  const isSample = item => item.source === 'example' || exampleIds.has(item.subjectId)
  if (!exampleIds.size && !['notes', 'exams', 'assignments', 'calendarEvents'].some(key => state[key].some(isSample))) return state
  const omit = (object, ids) => Object.fromEntries(Object.entries(object).filter(([key]) => !ids.has(key)))
  return {
    ...state,
    subjects: state.subjects.filter(subject => !exampleIds.has(subject.id)),
    notes: state.notes.filter(item => !isSample(item)),
    exams: state.exams.filter(item => !isSample(item)),
    assignments: state.assignments.filter(item => !isSample(item)),
    calendarEvents: state.calendarEvents.filter(item => !isSample(item)),
    attendance: omit(state.attendance, exampleIds),
    drafts: Object.fromEntries(Object.entries(state.drafts).filter(([, draft]) => !exampleIds.has(draft.subjectId))),
  }
}
// 서버/스토리지에서 읽은 원본 객체를 검증하고 구버전 필드를 보정한다.
export function parseSubjectState(raw) {
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
  // 휴강 기록은 옛 데이터에 없을 수 있다. 과목이 사라졌거나 형식이 깨진 항목만 걸러낸다.
  const cancellations = (Array.isArray(raw.cancellations) ? raw.cancellations : []).filter(item => validCancellation(item) && ids.has(item.subjectId))
  return withoutExamples({ ...raw, subjects: raw.subjects.map(subject => ({ ...subject, sessionsPerWeek: subject.sessionsPerWeek ?? 1 })), attendance, cancellations })
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
