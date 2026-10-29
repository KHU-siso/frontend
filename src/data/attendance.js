export const ATTENDANCE_OPTIONS = [
  { value: 'unset', label: '미정' },
  { value: 'present', label: '출석' },
  { value: 'absent', label: '결석' },
  { value: 'late', label: '지각' },
  { value: 'cancelled', label: '휴강' },
]
export const ATTENDANCE_WEEKS = 14
export const MAX_WEEKLY_SESSIONS = 7
export const validSessionCount = count => Number.isInteger(count) && count >= 1 && count <= MAX_WEEKLY_SESSIONS

export function normalizeAttendance(value, subjectIds) {
  const invalid = () => { throw new Error('저장된 출결 기록을 읽을 수 없습니다. 원본 데이터는 보존했습니다.') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid()
  return Object.fromEntries(Object.entries(value).map(([subjectId, weeks]) => {
    if (!subjectIds.has(subjectId) || !weeks || typeof weeks !== 'object' || Array.isArray(weeks)) return invalid()
    return [subjectId, Object.fromEntries(Object.entries(weeks).map(([week, old]) => {
      if (!/^(?:[1-9]|1[0-4])$/.test(week)) return invalid()
      // A former single weekly status becomes the first meeting, never discarded.
      const sessions = typeof old === 'string' ? { 1: old } : old
      if (!sessions || typeof sessions !== 'object' || Array.isArray(sessions) || Object.entries(sessions).some(([session, status]) => !/^[1-7]$/.test(session) || !ATTENDANCE_OPTIONS.some(option => option.value === status))) return invalid()
      return [week, sessions]
    }))]
  }))
}
