import { dDay, deadlineAt, dueState } from './subjectDates.js'

const DAY = 24 * 3600000

// 계정에 저장된 과제·시험 마감에서 알림 목록을 만든다. (서버의 과목/과제 테이블이 아니라 사용자 상태 데이터 기준)
export function buildNotifications(data, now = Date.now()) {
  const nameOf = id => data.subjects.find(subject => subject.id === id)?.name || '과목'
  const items = []
  for (const task of data.assignments) {
    if (task.completed) continue
    const state = dueState(task, now)
    if (state === 'upcoming' && deadlineAt(task) - now > 3 * DAY) continue
    items.push({
      id: `task:${task.id}`, kind: state === 'overdue' ? 'overdue' : 'soon', at: deadlineAt(task), to: `/materials/${task.subjectId}#assignments`,
      text: `${nameOf(task.subjectId)} · ${task.title}`, detail: state === 'overdue' ? '과제 기한이 지났어요' : `과제 마감 ${dDay(task.date)}`,
    })
  }
  for (const exam of data.exams) {
    const left = deadlineAt(exam) - now
    if (left < 0 || left > 7 * DAY) continue
    items.push({ id: `exam:${exam.id}`, kind: 'exam', at: deadlineAt(exam), to: `/materials/${exam.subjectId}#exams`, text: `${nameOf(exam.subjectId)} · ${exam.title}`, detail: `시험 ${dDay(exam.date)}` })
  }
  return items.sort((a, b) => a.at - b.at)
}
