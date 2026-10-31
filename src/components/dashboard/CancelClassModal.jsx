import { useState } from 'react'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'

// options: 이번 주 그 과목의 수업 날짜 [{ date, label, times }], cancelled: 이미 휴강 처리된 날짜 목록
export default function CancelClassModal({ title, options, cancelled, onSave, onClose }) {
  const [selected, setSelected] = useState(cancelled)
  const toggle = date => setSelected(current => current.includes(date) ? current.filter(value => value !== date) : [...current, date])
  function submit(event) {
    event.preventDefault()
    onSave(selected)
    onClose()
  }
  return (
    <Modal title="이번 주 어느 날을 휴강할까요?" onClose={onClose}>
      <form className="schedule-form cancel-form" onSubmit={submit}>
        <p className="cancel-form__subject">{title}</p>
        {options.length ? <fieldset className="cancel-form__days"><legend>수업 요일</legend>
          {options.map(option => <label key={option.date}><input type="checkbox" checked={selected.includes(option.date)} onChange={() => toggle(option.date)} /><span><strong>{option.label}</strong><small>{option.times}</small></span></label>)}
        </fieldset> : <p role="status">이번 주에 시간표에 등록된 수업이 없어요. 주간 시간표에서 이 과목의 수업을 먼저 추가해 주세요.</p>}
        {!!options.length && <p className="cancel-form__hint">체크를 해제하고 확인하면 휴강이 취소돼요.</p>}
        <div className="schedule-actions"><button className="schedule-cancel" type="button" onClick={onClose}>취소</button>{options.length ? <Button type="submit">확인</Button> : null}</div>
      </form>
    </Modal>
  )
}
