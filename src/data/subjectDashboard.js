import { dDay, deadlineAt, dueState, todayInSeoul, weekOf } from './subjectDates.js'
import { subjectSummary } from './subjectStore.js'
import { cancelledDatesIn, eventSubject, isCancelled } from './cancellations.js'

export function dashboardSubjects(data, now) {
  const thisWeek = weekOf(todayInSeoul(new Date(now)))
  const pinned = ['research', 'citizen', 'writing', 'values']
  return data.subjects.filter(subject => subject.source === 'user' || data.assignments.some(item => item.subjectId === subject.id) || data.exams.some(item => item.subjectId === subject.id)).sort((a, b) => a.source !== b.source ? a.source === 'user' ? -1 : 1 : a.source === 'user' ? b.createdAt.localeCompare(a.createdAt) : pinned.indexOf(a.id) - pinned.indexOf(b.id)).map(subject => {
    const { pending, nextExam, progress, taskCount } = subjectSummary(data, subject.id, now)
    return { id: subject.id, title: subject.name, teacher: subject.teacher, progress, cancelled: cancelledDatesIn(data.cancellations, subject.id, thisWeek).length > 0, deadlineLabel: nextExam ? `${nextExam.title} ${dDay(nextExam.date)}` : '예정된 시험 없음', overdue: pending.some(item => dueState(item, now) === 'overdue'), statusText: pending[0]?.title || (taskCount ? '과제 모두 완료' : '새 과목'), statusDescription: pending.length ? `미완료 과제 ${pending.length}개 · ${pending.map(item => `${item.title} (${item.date})`).join(', ')}` : '미완료 과제가 없습니다.', pendingCount: pending.length }
  })
}
export function subjectTimetable(data, now) {
  const days = weekOf(todayInSeoul(new Date(now)))
  const byId = Object.fromEntries(data.subjects.map(subject => [subject.id, subject]))
  const events = data.calendarEvents
    .filter(event => { const subject = eventSubject(event, data.subjects); return !(subject && isCancelled(data.cancellations, subject.id, days[event.day])) })
    .map(event => ({ ...event, name: byId[event.subjectId]?.name || event.name }))
  for (const exam of data.exams) {
    const day = days.indexOf(exam.date)
    if (day < 0 || !exam.time) continue
    const [hour, minute] = exam.time.split(':').map(Number)
    const start = hour + minute / 60
    // Exams have no duration field yet; retain the existing one-hour display.
    // Include early/late exams and preserve their actual start minute.
    if (!Number.isFinite(start) || start < 0 || start >= 24) continue
    events.push({ id: `exam:${exam.id}`, examId: exam.id, subjectId: exam.subjectId, name: `${byId[exam.subjectId]?.name || '과목'} · ${exam.title}`, location: `${exam.time}${exam.location ? ` · ${exam.location}` : ''}`, date: exam.date, time: exam.time, day, start, end: Math.min(start + 1, 24), color: 3 })
  }
  const exams = data.exams.map(exam => ({ ...exam, subjectName: byId[exam.subjectId]?.name || '삭제된 과목', past: deadlineAt(exam) < now })).sort((a, b) => Number(a.past) - Number(b.past) || deadlineAt(a) - deadlineAt(b))
  return { events, exams }
}
