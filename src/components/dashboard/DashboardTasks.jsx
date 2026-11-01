import { Link } from 'react-router-dom'
import './DashboardTasks.css'

const KIND = { task: '과제', exam: '시험' }

export default function DashboardTasks({ items, firstSubjectId, onToggle, onAddTask }) {
  return (
    <div className="dashboard-tasks">
      <section className="dashboard-card todo-panel" aria-labelledby="tasks-heading">
        <h2 id="tasks-heading">해야 할 일</h2>
        {items.length === 0 ? (
          <div className="empty-state" role="status">
            <p>해야 할 일이 없어요. 과제나 시험 일정을 등록해 보세요</p>
            <div className="todo-empty-actions">
              <button className="button" type="button" onClick={onAddTask}>과제 등록</button>
              <Link className="button" to={firstSubjectId ? `/materials/${firstSubjectId}#exams` : '/materials?add=1'}>시험 일정 등록</Link>
            </div>
          </div>
        ) : (
          <ul className="todo-items" aria-label="해야 할 일 목록">
            {items.map(item => (
              <li key={item.id} className={`todo-item todo-item--${item.kind}${item.overdue ? ' is-overdue' : ''}${item.urgent ? ' is-urgent' : ''}${item.done ? ' is-done' : ''}`}>
                <span className={`todo-badge todo-badge--${item.kind}`}>{KIND[item.kind]}</span>
                <div className="todo-item__copy">
                  <Link className="todo-item__title" to={`/materials/${item.subjectId}#${item.kind === 'exam' ? 'exams' : 'assignments'}`} title={item.title}>{item.title}</Link>
                  <small className="todo-item__subject" title={item.subjectName}>{item.subjectName}</small>
                </div>
                <div className="todo-item__due">
                  <strong className={item.overdue ? 'is-overdue' : item.urgent ? 'is-urgent' : ''}>{item.done ? '완료' : item.dayLabel}</strong>
                  <small>{item.date}{item.time ? ` ${item.time}` : ''}</small>
                </div>
                {item.kind === 'task' && (
                  <button type="button" className="todo-check" role="checkbox" aria-checked={item.done} aria-label={`${item.title} ${item.done ? '완료 취소' : '완료'}`} onClick={() => onToggle(item.rawId)}><span aria-hidden="true">{item.done ? '✓' : ''}</span></button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
