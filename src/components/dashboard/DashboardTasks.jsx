import './DashboardTasks.css'
import { Link } from 'react-router-dom'

export default function DashboardTasks({ courses, hasSubjects = true, onCancelClass }) {
  return (
    <div className="dashboard-tasks">
      <section className="dashboard-card todo-panel" aria-labelledby="tasks-heading">
        <h2 id="tasks-heading">해야 할 일</h2>
        <div className="todo-list" role="list" aria-label="과목별 해야 할 일" tabIndex={courses.length > 4 ? 0 : undefined}>
          {courses.map(course => (
            <article className={`todo-card ${course.overdue ? 'todo-card--overdue' : ''} ${course.cancelled ? 'is-cancelled' : ''}`} role="listitem" key={course.id}>
              <div className="todo-copy">
                <div className="todo-heading"><h3 title={course.title}><Link to={`/materials/${course.id}`}>{course.title}</Link></h3><p className="todo-teacher" title={course.teacher}>{course.teacher}</p></div>
                <p className="todo-progress-label"><span>현재 진행률 {course.progress}%{course.pendingCount !== undefined ? ` · 과제 ${course.pendingCount}개` : ''}</span><span title={course.deadlineLabel}>{course.deadlineLabel || `중간고사 D-${course.deadline}`}</span></p>
                <progress max="100" value={course.progress} aria-label={`${course.title} 학습 진행률`} />
              </div>
              <div className="todo-state">
                <span className={course.overdue ? 'is-overdue' : ''} title={course.statusDescription}><span className="todo-status-text">{course.statusText || (course.overdue ? '지난 주에 밀렸어요!' : '오늘의 할 일')}</span></span>
                <button type="button" aria-label={`${course.title} ${course.cancelled ? '휴강 변경' : '휴강 처리'}`} onClick={() => onCancelClass(course.id)}><span aria-hidden="true">휴강<br />{course.cancelled ? '변경' : '처리'}</span></button>
              </div>
            </article>
          ))}
          {courses.length === 0 && hasSubjects && <p className="todo-empty" role="status">검색한 과목이 없습니다.</p>}
          {!hasSubjects && <div className="empty-state" role="status"><p>아직 등록된 과목이 없어요</p><Link className="button" to="/materials?add=1">과목 추가</Link></div>}
        </div>
      </section>
    </div>
  )
}
