import { useState } from 'react'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'
import { Link } from 'react-router-dom'
import { scheduleColors } from '../../data/dashboard.js'
import { validDate, weekDisplay } from '../../data/subjectDates.js'

// "HH:MM" → 시간 단위 숫자(9시 30분 = 9.5). 저장 형식은 기존과 같은 숫자(시간)이고, 형식이 틀리면 null.
const parseTime = value => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || '').trim())
  return match ? Number(match[1]) + Number(match[2]) / 60 : null
}
const timeLabel = value => {
  const minutes = Math.round(value * 60)
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function AddSchedule({ onAdd, onClose, events, weekLabels }) {
  const [color, setColor] = useState(0)
  const [error, setError] = useState('')
  const [times, setTimes] = useState({ start: '09:00', end: '10:00' })
  const start = parseTime(times.start)
  const end = parseTime(times.end)
  const timeError = start === null || end === null ? '시간을 HH:MM 형식(예: 09:30)으로 입력해주세요.' : end <= start ? '종료 시간은 시작 시간보다 늦어야 합니다.' : ''
  function submit(event) {
    event.preventDefault()
    if (timeError) return
    const values = new FormData(event.currentTarget)
    const item = { id: crypto.randomUUID(), name: values.get('name').trim(), location: '', day: Number(values.get('day')), start, end, color }
    if (!item.name) return setError('시간표 이름을 입력해주세요.')
    if (events.some(existing => existing.day === item.day && item.start < existing.end && item.end > existing.start)) return setError('해당 시간에는 이미 일정이 있습니다. 다른 시간을 선택해주세요.')
    onAdd(item)
    onClose()
  }
  return (
    <Modal title="새 과목 추가" onClose={onClose}>
      <form className="schedule-form" onSubmit={submit}>
        <label>시간표 이름<input name="name" placeholder="이름을 입력하세요." required maxLength={40} /></label>
        <fieldset className="schedule-colors"><legend>블록 색상</legend><div>{scheduleColors.map((label, index) => <label key={label} className={`schedule-color schedule-color--${index}`}><input type="radio" name="color" value={index} aria-label={label} checked={color === index} onChange={() => setColor(index)} /></label>)}</div></fieldset>
        <label>요일<select name="day" defaultValue="3">{weekLabels.map((day, i) => <option value={i} key={day}>{day}</option>)}</select></label>
        <div className="schedule-time-row"><label>시작 시간<input type="time" step="60" required value={times.start} onChange={event => { setTimes(current => ({ ...current, start: event.target.value })); setError('') }} aria-invalid={start === null} /></label><label>종료 시간<input type="time" step="60" required value={times.end} onChange={event => { setTimes(current => ({ ...current, end: event.target.value })); setError('') }} aria-invalid={end === null || end <= start} /></label></div>
        {(timeError || error) && <p className="field-error" role="alert">{timeError || error}</p>}
        <div className="schedule-actions"><button className="schedule-cancel" type="button" onClick={onClose}>취소</button><Button type="submit" disabled={Boolean(timeError)}>추가하기</Button></div>
      </form>
    </Modal>
  )
}

// 과목과 별개인 일반 일정(동아리·알바·약속 등). calendarEvents에 kind:'personal'로 저장하고,
// 매주 반복(요일)이면 day만, 특정 날짜면 date와 그 요일(day)을 함께 저장한다.
function AddPersonalEvent({ onAdd, onClose }) {
  const [color, setColor] = useState(3)
  const [mode, setMode] = useState('weekly')
  const [times, setTimes] = useState({ start: '18:00', end: '19:00' })
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [day, setDay] = useState('1')
  const start = parseTime(times.start)
  const end = parseTime(times.end)
  const problem = !name.trim() ? '일정 제목을 입력해주세요.' : mode === 'date' && !validDate(date) ? '날짜를 선택해주세요.' : start === null || end === null ? '시간을 HH:MM 형식(예: 18:30)으로 입력해주세요.' : end <= start ? '종료 시간은 시작 시간보다 늦어야 합니다.' : ''
  const [touched, setTouched] = useState(false)
  function submit(event) {
    event.preventDefault()
    setTouched(true)
    if (problem) return
    const base = { id: crypto.randomUUID(), kind: 'personal', name: name.trim(), location: '', start, end, color }
    onAdd(mode === 'date' ? { ...base, date, day: new Date(`${date}T00:00:00Z`).getUTCDay() } : { ...base, day: Number(day) })
    onClose()
  }
  const timeInput = key => <input type="time" step="60" required value={times[key]} onChange={event => setTimes(current => ({ ...current, [key]: event.target.value }))} />
  return (
    <Modal title="일정 추가" onClose={onClose}>
      <form className="schedule-form" onSubmit={submit} noValidate>
        <label>일정 제목<input value={name} placeholder="예: 동아리, 알바, 약속" maxLength={40} required onChange={event => setName(event.target.value)} /></label>
        <fieldset className="schedule-colors"><legend>블록 색상</legend><div>{scheduleColors.map((label, index) => <label key={label} className={`schedule-color schedule-color--${index}`}><input type="radio" name="personal-color" value={index} aria-label={label} checked={color === index} onChange={() => setColor(index)} /></label>)}</div></fieldset>
        <fieldset className="schedule-repeat"><legend>반복</legend><label><input type="radio" name="personal-mode" checked={mode === 'weekly'} onChange={() => setMode('weekly')} />매주 같은 요일</label><label><input type="radio" name="personal-mode" checked={mode === 'date'} onChange={() => setMode('date')} />특정 날짜 하루만</label></fieldset>
        {mode === 'weekly' ? <label>요일<select value={day} onChange={event => setDay(event.target.value)}>{['일', '월', '화', '수', '목', '금', '토'].map((name, i) => <option value={i} key={name}>{name}요일</option>)}</select></label> : <label>날짜<input type="date" value={date} required onChange={event => setDate(event.target.value)} /></label>}
        <div className="schedule-time-row"><label>시작 시간{timeInput('start')}</label><label>종료 시간{timeInput('end')}</label></div>
        {touched && problem && <p className="field-error" role="alert">{problem}</p>}
        <div className="schedule-actions"><button className="schedule-cancel" type="button" onClick={onClose}>취소</button><Button type="submit">일정 추가</Button></div>
      </form>
    </Modal>
  )
}

export default function Timetable({ events, allEvents = events, exams = [], weekItems = [], weekOffset = 0, onWeekChange, examTarget = '/materials?add=1', onAdd, onAddPersonal, onRemoveEvent, onCancelClass, now }) {
  const { weekDates, weekLabels, weekRange } = weekDisplay(now, weekOffset)
  const [adding, setAdding] = useState(false)
  const [addingPersonal, setAddingPersonal] = useState(false)
  const [selected, setSelected] = useState(null)
  // Keep the existing 09–20 window; extend only as far as stored events need.
  const visibleEvents = events.filter(event => Number.isInteger(event.day) && event.day >= 0 && event.day < 7 && Number.isFinite(event.start) && Number.isFinite(event.end) && event.start >= 0 && event.end <= 24 && event.end > event.start)
  const firstHour = Math.min(9, ...visibleEvents.map(event => Math.floor(event.start)))
  const lastHour = Math.max(20, ...visibleEvents.map(event => Math.ceil(event.end)))
  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i)
  return (
    <section className="dashboard-card timetable-card" aria-labelledby="timetable-heading">
      <header className="timetable-heading"><div className="timetable-title"><h2 id="timetable-heading">주간 시간표</h2><div className="timetable-week-nav" role="group" aria-label="주 이동"><button type="button" aria-label="이전 주" onClick={() => onWeekChange(weekOffset - 1)}>&lt;</button><button type="button" aria-label="다음 주" onClick={() => onWeekChange(weekOffset + 1)}>&gt;</button><button type="button" className="timetable-this-week" disabled={weekOffset === 0} onClick={() => onWeekChange(0)}>이번 주</button><button type="button" className="timetable-cancel-class" onClick={onCancelClass}>휴강 등록</button><button type="button" className="timetable-add-event" onClick={() => setAddingPersonal(true)}>일정 추가</button></div></div><div className="timetable-controls">{!!weekItems.length && <details className="timetable-exams" key={weekOffset}><summary>이 주의 시험·과제 {weekItems.length}</summary><div>{weekItems.map(item => <Link to={`/materials/${item.subjectId}#${item.kind === 'exam' ? 'exams' : 'assignments'}`} key={item.id}><strong>{item.kind === 'exam' ? '시험' : '과제'} · {item.subjectName} · {item.title}</strong><span>{item.date} · {item.time || (item.kind === 'exam' ? '시간 미정' : '하루 종일')}{item.done ? ' · 완료' : ''}</span></Link>)}</div></details>}<button type="button" aria-label="새 과목 추가" onClick={() => setAdding(true)}>+</button></div></header>
      {!exams.length && <div className="empty-state empty-state--inline" role="status"><p>시험 일정을 등록해 주세요</p><Link className="button" to={examTarget}>시험 일정 등록</Link></div>}
      {!visibleEvents.length && <div className="empty-state empty-state--inline" role="status"><p>시간표를 등록해 주세요</p><button className="button" type="button" onClick={() => setAdding(true)}>시간표 등록</button></div>}
      <p className="timetable-caption">{weekRange}</p>
      <div className="timetable-scroll" tabIndex={0} role="region" aria-label="주간 시간표 시간대">
        <div className="timetable-grid" style={{ '--timetable-hours': hours.length }}>
          <div className="timetable-corner" aria-hidden="true" style={{ gridColumn: 1, gridRow: 1 }} />
          {weekDates.map((date, i) => <div className="timetable-day" key={i} style={{ gridColumn: i + 2, gridRow: 1 }}><span>{date.day}일</span><span>{date.dayName}</span></div>)}
          {hours.map((hour, row) => <div className="timetable-hour" key={hour} style={{ gridColumn: 1, gridRow: row + 2 }}>{hour}</div>)}
          {hours.flatMap((hour, row) => weekLabels.map((_, col) => <div key={`${hour}-${col}`} className="timetable-cell" aria-hidden="true" style={{ gridRow: row + 2, gridColumn: col + 2 }} />))}
          {visibleEvents.map(event => <button key={event.id} type="button" className={`timetable-event schedule-color--${event.color}${event.kind === 'personal' ? ' timetable-event--personal' : ''}${event.end - event.start < 1 ? ' timetable-event--short' : ''}`} style={{ gridColumn: event.day + 2, gridRow: '2 / -1', alignSelf: 'start', marginTop: `calc(${event.start - firstHour} * var(--timetable-hour-height) + 0.5px)`, height: `calc(${event.end - event.start} * var(--timetable-hour-height) - 1px)` }} aria-label={`${event.kind === 'personal' ? '일정 ' : ''}${event.name}, ${weekLabels[event.day]}, ${timeLabel(event.start)}부터 ${timeLabel(event.end)}`} onClick={() => setSelected(event)}><strong>{event.name}</strong><span>{event.location}</span></button>)}
        </div>
      </div>
      {addingPersonal && <AddPersonalEvent onAdd={onAddPersonal} onClose={() => setAddingPersonal(false)} />}
      {adding && <AddSchedule events={allEvents} weekLabels={weekLabels} onAdd={onAdd} onClose={() => setAdding(false)} />}
      {selected && <Modal title={selected.name} onClose={() => setSelected(null)}><p>{selected.date && selected.time ? `${selected.date} · ${selected.time}` : selected.date ? `${selected.date} · ${timeLabel(selected.start)}–${timeLabel(selected.end)}` : `${weekLabels[selected.day]} · ${timeLabel(selected.start)}–${timeLabel(selected.end)}`}</p>{selected.location && <p>{selected.location}</p>}{selected.kind === 'personal' && <><p>{selected.date ? '특정 날짜 일정' : '매주 반복 일정'}</p><button className="button" type="button" onClick={() => { onRemoveEvent(selected.id); setSelected(null) }}>일정 삭제</button></>}{selected.subjectId && <Link className="button" to={`/materials/${selected.subjectId}${selected.examId ? '#exams' : ''}`}>과목 홈에서 확인</Link>}</Modal>}
    </section>
  )
}
