import { Link } from 'react-router-dom'
import Modal from '../common/Modal.jsx'

// 빠른 실행(학습하기·과제 등록·AI chat)이 함께 쓰는 과목 선택 창.
export default function SubjectPickerModal({ title, subjects, onPick, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      {subjects.length ? <ul className="subject-picker">{subjects.map(subject => <li key={subject.id}><button type="button" onClick={() => onPick(subject)}><strong>{subject.name}</strong><small>{subject.teacher}</small></button></li>)}</ul>
        : <div className="subject-picker-empty" role="status"><p>과목을 먼저 추가해 주세요.</p><Link className="button" to="/materials?add=1">과목 추가하기</Link></div>}
    </Modal>
  )
}
