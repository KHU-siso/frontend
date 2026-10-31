import { useState } from 'react'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'

// subjects: 선택 가능한 과목. optionsFor(subject): 보고 있는 주에 그 과목이 수업하는 날짜 [{ date, label, times }],
// cancelledFor(subject): 이미 휴강 처리된 날짜 목록. onSave(subject, dates)로 선택한 날짜를 저장한다.
export default function CancelClassModal({ subjects, weekRange, optionsFor, cancelledFor, cancellations = [], onRestore, onSave, onClose }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const subject = subjects.find(item => item.id === subjectId)
  const options = subject ? optionsFor(subject) : []
  const [picked, setPicked] = useState({}) // subjectId -> 사용자가 고른 날짜들
  const selected = picked[subjectId] ?? (subject ? cancelledFor(subject) : [])
  const toggle = date => setPicked(current => ({ ...current, [subjectId]: selected.includes(date) ? selected.filter(value => value !== date) : [...selected, date] }))
  function submit(event) {
    event.preventDefault()
    if (subject) onSave(subject, selected)
    onClose()
  }
  return (
    <Modal title="휴강 등록" onClose={onClose}>
      <form className="schedule-form cancel-form" onSubmit={submit}>
        {subjects.length ? <>
          <label>과목<select value={subjectId} onChange={event => setSubjectId(event.target.value)}>{subjects.map(item => <option key={item.id} value={item.id}>{item.name} · {item.teacher}</option>)}</select></label>
          {options.length ? <fieldset className="cancel-form__days"><legend>휴강할 날 ({weekRange})</legend>
            {options.map(option => <label key={option.date}><input type="checkbox" checked={selected.includes(option.date)} onChange={() => toggle(option.date)} /><span className="cancel-form__day"><strong>{option.label} · {option.date}</strong><small>{option.times}</small></span></label>)}
          </fieldset> : <p role="status">이 주에 시간표에 등록된 수업이 없어요. 주간 시간표에서 이 과목의 수업을 먼저 추가해 주세요.</p>}
          {!!options.length && <p className="cancel-form__hint">체크를 해제하고 확인하면 휴강이 취소돼요.</p>}
        </> : <p role="status">과목을 먼저 추가해 주세요.</p>}
        <div className="schedule-actions"><button className="schedule-cancel" type="button" onClick={onClose}>취소</button>{options.length ? <Button type="submit">확인</Button> : null}</div>
      </form>
      <section className="cancel-list" aria-labelledby="cancel-list-heading">
        <h3 id="cancel-list-heading">휴강 목록 <small>{cancellations.length}</small></h3>
        {cancellations.length ? <ul>{cancellations.map(item => <li key={item.key}><span><strong>{item.subjectName}</strong><small>{item.date} ({item.weekday}){item.times ? ` · ${item.times}` : ''}</small></span><button type="button" className="cancel-list__restore" aria-label={`${item.subjectName} ${item.date} 휴강 취소`} onClick={() => onRestore(item.subjectId, item.date)}>휴강 취소</button></li>)}</ul> : <p className="cancel-list__empty">등록된 휴강이 없어요.</p>}
      </section>
    </Modal>
  )
}
