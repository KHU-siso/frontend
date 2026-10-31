import { dDay, daysUntil, deadlineAt, dueState, todayInSeoul, weekAt, weekOf } from './subjectDates.js'
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
export function subjectTimetable(data, now, weekOffset = 0) {
  const days = weekAt(now, weekOffset)
  const byId = Object.fromEntries(data.subjects.map(subject => [subject.id, subject]))
  const events = data.calendarEvents
    .filter(event => !event.date || days[event.day] === event.date) // 날짜가 있는 일정(일정 추가 · 특정 날짜)은 해당 주에만 표시
    .filter(event => { const subject = eventSubject(event, data.subjects); return !(subject && isCancelled(data.cancellations, subject.id, days[event.day])) })
    .map(event => ({ ...event, name: event.kind === 'personal' ? event.name : byId[event.subjectId]?.name || event.name }))
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
  // 보고 있는 주에 걸린 시험·과제 마감 (날짜순)
  const weekItems = [
    ...data.exams.filter(exam => days.includes(exam.date)).map(exam => ({ id: `exam:${exam.id}`, kind: 'exam', subjectId: exam.subjectId, title: exam.title, subjectName: byId[exam.subjectId]?.name || '삭제된 과목', date: exam.date, time: exam.time, done: false })),
    ...data.assignments.filter(task => days.includes(task.date)).map(task => ({ id: `task:${task.id}`, kind: 'task', subjectId: task.subjectId, title: task.title, subjectName: byId[task.subjectId]?.name || '삭제된 과목', date: task.date, time: task.time, done: Boolean(task.completed) })),
  ].sort((a, b) => deadlineAt(a) - deadlineAt(b))
  return { events, exams, weekItems }
}

// 대시보드 "해야 할 일": 과목이 아니라 개별 일(과제·시험) 단위 목록.
// 지난 미완료 과제 → 마감 임박순, 완료한 과제는 맨 아래. 지난 시험은 할 일이 아니라 제외한다.
export function todoItems(data, now) {
  const today = todayInSeoul(new Date(now))
  const byId = Object.fromEntries(data.subjects.map(subject => [subject.id, subject]))
  const info = (item, kind) => {
    const subject = byId[item.subjectId]
    const days = daysUntil(item.date, today)
    const overdue = !item.completed && deadlineAt(item) < now
    return { id: `${kind}:${item.id}`, rawId: item.id, kind, title: item.title, subjectId: item.subjectId, subjectName: subject ? `${subject.name} · ${subject.teacher}` : '삭제된 과목', date: item.date, time: item.time, done: kind === 'task' && Boolean(item.completed), overdue, urgent: !overdue && !item.completed && days <= 1, dayLabel: overdue ? '기한 지남' : days === 0 ? '오늘' : days === 1 ? '내일' : `D-${days}`, at: deadlineAt(item) }
  }
  const rank = item => item.done ? 2 : item.overdue ? 0 : 1
  return [
    ...data.assignments.map(task => info(task, 'task')),
    ...data.exams.filter(exam => deadlineAt(exam) >= now).map(exam => info(exam, 'exam')),
  ].sort((a, b) => rank(a) - rank(b) || a.at - b.at)
}
