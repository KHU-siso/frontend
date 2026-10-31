// Civil dates and deadlines use the service timezone, independent of host timezone.
export function todayInSeoul(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(+date) && date.toISOString().slice(0, 10) === value
}
export function shiftDate(value, amount) {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}
export function daysUntil(date, today = todayInSeoul()) { return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000) }
export function dDay(date, today) { const days = daysUntil(date, today); return days === 0 ? 'D-DAY' : days > 0 ? `D-${days}` : `D+${-days}` }
export function deadlineAt(item) { return Date.parse(`${item.date}T${item.time ? `${item.time}:00` : '23:59:59.999'}+09:00`) }
export function dueState(item, now = Date.now()) { const left = deadlineAt(item) - now; return left < 0 ? 'overdue' : left <= 48 * 3600000 ? 'soon' : 'upcoming' }
export function semesterLabel(value) { return value.replace(/^(\d{4})-([12])$/, '$1년 $2학기') }
export const formatStamp = value => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(value))
export function currentSemester() { const today = todayInSeoul(); return `${today.slice(0, 4)}-${Number(today.slice(5, 7)) < 7 ? 1 : 2}` }
export function weekOf(today = todayInSeoul()) { const start = shiftDate(today, -new Date(`${today}T00:00:00Z`).getUTCDay()); return Array.from({ length: 7 }, (_, i) => shiftDate(start, i)) }
// offset: 0 = 이번 주, -1 = 지난주, 1 = 다음 주
export function weekAt(now = Date.now(), offset = 0) { return weekOf(shiftDate(todayInSeoul(new Date(now)), offset * 7)) }
export function weekDisplay(now = Date.now(), offset = 0) {
  const dates = weekAt(now, offset)
  const names = ['일', '월', '화', '수', '목', '금', '토']
  const weekDates = dates.map((date, i) => ({ day: Number(date.slice(8)), dayName: names[i], label: `${Number(date.slice(8))}일 (${names[i]})` }))
  return { weekDates, weekLabels: weekDates.map(date => date.label), weekRange: `${dates[0].slice(0, 4)}년 ${Number(dates[0].slice(5, 7))}월 ${Number(dates[0].slice(8))}일 – ${Number(dates[6].slice(5, 7))}월 ${Number(dates[6].slice(8))}일` }
}
