import { useState } from 'react'

// [오전|오후] 토글 + 시(1~12) + 분(00~59) 입력. 바깥과 주고받는 값은 항상 24시간 "HH:MM" 문자열이다.
// 오전 12시 = 00:xx, 오후 12시 = 12:xx.
function to24(period, hour12, minute) {
  const hour = (hour12 % 12) + (period === 'pm' ? 12 : 0)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function from24(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || ''))
  if (!match) return { period: 'am', hour12: 12, minute: 0 }
  const hour = Number(match[1])
  return { period: hour >= 12 ? 'pm' : 'am', hour12: hour % 12 || 12, minute: Number(match[2]) }
}

export default function TimeInput({ label, value, onChange }) {
  const { period, hour12, minute } = from24(value)
  // 입력 도중(예: 지우고 다시 쓰는 중)에는 초안 문자열을 보여주고, 유효한 값일 때만 바깥에 알린다. 포커스를 벗어나면 확정된 값으로 되돌린다.
  const [draft, setDraft] = useState({ hour: null, minute: null })
  const typeNumber = (field, min, max) => event => {
    const text = event.target.value.replace(/\D/g, '').slice(0, 2)
    setDraft(current => ({ ...current, [field]: text }))
    const number = Number(text)
    if (text === '' || number < min || number > max) return
    onChange(field === 'hour' ? to24(period, number, minute) : to24(period, hour12, number))
  }
  const settle = field => () => setDraft(current => ({ ...current, [field]: null }))
  return (
    <div className="time-input" role="group" aria-label={label}>
      <span className="time-input__label" aria-hidden="true">{label}</span>
      <div className="time-input__period" role="group" aria-label={`${label} 오전 오후`}>
        {[['am', '오전'], ['pm', '오후']].map(([key, text]) => (
          <button key={key} type="button" aria-pressed={period === key} className={period === key ? 'is-active' : ''} onClick={() => onChange(to24(key, hour12, minute))}>{text}</button>
        ))}
      </div>
      <div className="time-input__digits">
        <input inputMode="numeric" autoComplete="off" aria-label={`${label} 시 (1~12)`} value={draft.hour ?? String(hour12)} onChange={typeNumber('hour', 1, 12)} onFocus={event => event.target.select()} onBlur={settle('hour')} />
        <span aria-hidden="true">:</span>
        <input inputMode="numeric" autoComplete="off" aria-label={`${label} 분 (00~59)`} value={draft.minute ?? String(minute).padStart(2, '0')} onChange={typeNumber('minute', 0, 59)} onFocus={event => event.target.select()} onBlur={settle('minute')} />
      </div>
    </div>
  )
}
