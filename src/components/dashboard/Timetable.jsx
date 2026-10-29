import { useState } from 'react'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'
import { Link } from 'react-router-dom'
import { scheduleColors } from '../../data/dashboard.js'
import { weekDisplay } from '../../data/subjectDates.js'

const scheduleHours = Array.from({ length: 24 }, (_, i) => i)
const timeLabel = value => {
  const minutes = Math.round(value * 60)
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function AddSchedule({ onAdd, onClose, events, weekLabels }) {
  const [color, setColor] = useState(0)
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const item = { id: crypto.randomUUID(), name: values.get('name').trim(), location: '', day: Number(values.get('day')), start: Number(values.get('start')), end: Number(values.get('end')), color }
    if (!item.name) return setError('시간표 이름을 입력해주세요.')
    if (item.end <= item.start) return setError('종료 시간은 시작 시간보다 늦어야 합니다.')
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
        <div className="schedule-time-row"><label>시작 시간<select name="start" defaultValue="9">{scheduleHours.map(hour => <option value={hour} key={hour}>{timeLabel(hour)}</option>)}</select></label><label>종료 시간<select name="end" defaultValue="10">{scheduleHours.map(hour => <option value={hour + 1} key={hour}>{timeLabel(hour + 1)}</option>)}</select></label></div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="schedule-actions"><button className="schedule-cancel" type="button" onClick={onClose}>취소</button><Button type="submit">추가하기</Button></div>
      </form>
    </Modal>
  )
}

export default function Timetable({ events, exams = [], onAdd, now }) {
  const { weekDates, weekLabels, weekRange } = weekDisplay(now)
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState(null)
  // Keep the existing 09–20 window; extend only as far as stored events need.
  const visibleEvents = events.filter(event => Number.isInteger(event.day) && event.day >= 0 && event.day < 7 && Number.isFinite(event.start) && Number.isFinite(event.end) && event.start >= 0 && event.end <= 24 && event.end > event.start)
  const firstHour = Math.min(9, ...visibleEvents.map(event => Math.floor(event.start)))
  const lastHour = Math.max(20, ...visibleEvents.map(event => Math.ceil(event.end)))
  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i)
  return (
    <section className="dashboard-card timetable-card" aria-labelledby="timetable-heading">
      <header className="timetable-heading"><h2 id="timetable-heading">주간 시간표</h2><div className="timetable-controls">{!!exams.length && <details className="timetable-exams"><summary>시험 일정 {exams.length}</summary><div>{exams.map(exam => <Link to={`/materials/${exam.subjectId}#exams`} key={exam.id}><strong>{exam.subjectName} · {exam.title}</strong><span>{exam.date} · {exam.time || '시간 미정'}{exam.past ? ' · 지난 시험' : ''}</span></Link>)}</div></details>}<button type="button" aria-label="새 과목 추가" onClick={() => setAdding(true)}>+</button></div></header>
      <p className="timetable-caption">{weekRange}</p>
      <div className="timetable-scroll" tabIndex={0} role="region" aria-label="주간 시간표 시간대">
        <div className="timetable-grid" style={{ '--timetable-hours': hours.length }}>
          <div className="timetable-corner" aria-hidden="true" style={{ gridColumn: 1, gridRow: 1 }} />
          {weekDates.map((date, i) => <div className="timetable-day" key={i} style={{ gridColumn: i + 2, gridRow: 1 }}><span>{date.day}일</span><span>{date.dayName}</span></div>)}
          {hours.map((hour, row) => <div className="timetable-hour" key={hour} style={{ gridColumn: 1, gridRow: row + 2 }}>{hour}</div>)}
          {hours.flatMap((hour, row) => weekLabels.map((_, col) => <div key={`${hour}-${col}`} className="timetable-cell" aria-hidden="true" style={{ gridRow: row + 2, gridColumn: col + 2 }} />))}
          {visibleEvents.map(event => <button key={event.id} type="button" className={`timetable-event schedule-color--${event.color}${event.end - event.start < 1 ? ' timetable-event--short' : ''}`} style={{ gridColumn: event.day + 2, gridRow: '2 / -1', alignSelf: 'start', marginTop: `calc(${event.start - firstHour} * var(--timetable-hour-height) + 0.5px)`, height: `calc(${event.end - event.start} * var(--timetable-hour-height) - 1px)` }} aria-label={`${event.name}, ${weekLabels[event.day]}, ${timeLabel(event.start)}부터 ${timeLabel(event.end)}`} onClick={() => setSelected(event)}><strong>{event.name}</strong><span>{event.location}</span></button>)}
        </div>
      </div>
      {adding && <AddSchedule events={events} weekLabels={weekLabels} onAdd={onAdd} onClose={() => setAdding(false)} />}
      {selected && <Modal title={selected.name} onClose={() => setSelected(null)}><p>{selected.date ? `${selected.date} · ${selected.time}` : `${weekLabels[selected.day]} · ${timeLabel(selected.start)}–${timeLabel(selected.end)}`}</p>{selected.location && <p>{selected.location}</p>}{selected.subjectId && <Link className="button" to={`/materials/${selected.subjectId}${selected.examId ? '#exams' : ''}`}>과목 홈에서 확인</Link>}</Modal>}
    </section>
  )
}
