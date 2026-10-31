import { normalizedName } from './subjectStore.js'

// 휴강은 (과목, 날짜) 단위로 저장한다. 주간 시간표의 수업은 요일 반복 일정이라, 날짜를 함께 저장해야
// 다른 주에는 영향이 없다.
export const eventSubject = (event, subjects) => event.kind === 'personal' ? undefined : subjects.find(subject => subject.id === event.subjectId) || (event.subjectId ? undefined : subjects.find(subject => normalizedName(subject.name) === normalizedName(event.name)))
export const isCancelled = (cancellations, subjectId, date) => cancellations.some(item => item.subjectId === subjectId && item.date === date)
export const cancelledDatesIn = (cancellations, subjectId, dates) => dates.filter(date => isCancelled(cancellations, subjectId, date))

const hourLabel = value => { const minutes = Math.round(value * 60); return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}` }

// 한 과목이 주어진 주(dates: 일~토 날짜 7개)에 수업하는 날짜 목록. 같은 날 수업이 여러 개면 한 줄로 합친다.
export function classDaysOf(data, subject, dates, weekLabels) {
  const days = new Map()
  for (const event of data.calendarEvents) {
    if (!Number.isInteger(event.day) || event.day < 0 || event.day > 6 || eventSubject(event, data.subjects)?.id !== subject.id) continue
    days.set(event.day, [...(days.get(event.day) || []), `${hourLabel(event.start)}–${hourLabel(event.end)}`])
  }
  return [...days].sort(([a], [b]) => a - b).map(([day, times]) => ({ date: dates[day], label: weekLabels[day], times: times.join(', ') }))
}

// 이번 주 날짜(dates) 안의 해당 과목 휴강을 selected로 교체한다. (체크 해제 = 휴강 되돌리기)
export function replaceCancellations(data, subjectId, dates, selected) {
  const keep = data.cancellations.filter(item => !(item.subjectId === subjectId && dates.includes(item.date)))
  return { ...data, cancellations: [...keep, ...selected.map(date => ({ subjectId, date }))] }
}

// 등록된 모든 휴강을 (과목명, 날짜, 시간) 목록으로. 시간은 그 요일의 해당 과목 수업 시간이고, 최근 날짜가 위.
export function cancellationList(data) {
  const names = ['일', '월', '화', '수', '목', '금', '토']
  return data.cancellations.map(item => {
    const subject = data.subjects.find(value => value.id === item.subjectId)
    const day = new Date(`${item.date}T00:00:00Z`).getUTCDay()
    const times = data.calendarEvents.filter(event => event.day === day && eventSubject(event, data.subjects)?.id === item.subjectId).map(event => `${hourLabel(event.start)}–${hourLabel(event.end)}`).join(', ')
    return { key: `${item.subjectId}:${item.date}`, subjectId: item.subjectId, subjectName: subject?.name || '삭제된 과목', date: item.date, weekday: names[day], times }
  }).sort((a, b) => b.date.localeCompare(a.date) || a.subjectName.localeCompare(b.subjectName, 'ko'))
}

// 휴강 하나를 취소(되돌리기).
export function removeCancellation(data, subjectId, date) {
  return { ...data, cancellations: data.cancellations.filter(item => !(item.subjectId === subjectId && item.date === date)) }
}
