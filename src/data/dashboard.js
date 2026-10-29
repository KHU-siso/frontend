// Frontend fixtures until the dashboard API is connected. No network write occurs.
const today = new Date()
const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
export const weekDates = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][i]
  return { day: date.getDate(), dayName, label: `${date.getDate()}일 (${dayName})` }
})
export const weekLabels = weekDates.map(date => date.label)
const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6)
export const weekRange = `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 – ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`
export const initialCourses = [
  { id: 'research', title: '주제 연구', teacher: '담당 교수 A', progress: 40, deadline: 10, overdue: true, cancelled: false },
  { id: 'citizen', title: '세계와 시민', teacher: '담당 교수 B', progress: 20, deadline: 11, overdue: false, cancelled: false },
  { id: 'reflection', title: '성찰과 표현', teacher: '담당 교수 C', progress: 60, deadline: 9, overdue: false, cancelled: false },
  { id: 'human', title: '인간 가치의 탐색', teacher: '담당 교수 D', progress: 80, deadline: 8, overdue: false, cancelled: false },
]
export const initialEvents = [
  { id: 'photo', name: '사진', location: '예405', day: 1, start: 9, end: 13, color: 0 },
  { id: 'design', name: '디지털디자인', location: '예224', day: 2, start: 9, end: 13, color: 1 },
  { id: 'study-one', name: '자료구조 스터디', location: '', day: 1, start: 14, end: 16, color: 4 },
  { id: 'study-two', name: '과제 정리', location: '', day: 4, start: 14, end: 16, color: 4 },
  { id: 'work-one', name: '개인 일정', location: '', day: 2, start: 16, end: 19, color: 2 },
  { id: 'work-two', name: '개인 일정', location: '', day: 5, start: 16, end: 19, color: 2 },
]
export const scheduleColors = ['분홍', '초록', '노랑', '하늘', '보라']
