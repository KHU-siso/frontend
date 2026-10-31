import { useState } from 'react'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'
import { useSubjects } from '../../state/SubjectsContext.js'

// 선택한 과목에 과제를 바로 등록한다. 등록한 과제는 해야 할 일·알림·과목 홈에 그대로 반영된다.
export default function AssignmentQuickModal({ subject, onSaved, onClose }) {
  const { saveRecord } = useSubjects()
  const [errors, setErrors] = useState({})
  function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const result = saveRecord('assignments', subject.id, { title: String(form.get('title')), date: String(form.get('date')), time: String(form.get('time') || '') })
      if (result.errors) return setErrors(result.errors)
      onSaved(String(form.get('title')).trim())
      onClose()
    } catch (failure) { setErrors({ form: failure.message }) }
  }
  return (
    <Modal title="과제 등록" onClose={onClose}>
      <form className="schedule-form" onSubmit={submit}>
        <p className="cancel-form__subject">{subject.name}</p>
        <label>과제 이름<input name="title" required maxLength={80} placeholder="과제 이름을 입력하세요." autoFocus />{errors.title && <span className="field-error" role="alert">{errors.title}</span>}</label>
        <div className="schedule-time-row"><label>마감일<input name="date" type="date" required />{errors.date && <span className="field-error" role="alert">{errors.date}</span>}</label><label>마감 시간 (선택)<input name="time" type="time" />{errors.time && <span className="field-error" role="alert">{errors.time}</span>}</label></div>
        {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
        <div className="schedule-actions"><button className="schedule-cancel" type="button" onClick={onClose}>취소</button><Button type="submit">등록하기</Button></div>
      </form>
    </Modal>
  )
}
