import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import { EmptyState } from '../../components/service/ServiceUI.jsx'
import faceEye from '../../assets/review/wrong-card-eye.svg'
import { makeSession, questionById } from '../../data/learningDemo.js'
import { useSubjects } from '../../state/SubjectsContext.js'
import { useDemo } from '../../state/DemoContext.js'
import './WrongAnswersPage.css'

export default function WrongAnswersPage() {
  const { state, dispatch } = useDemo()
  const { data } = useSubjects()
  const courses = data.subjects
  const courseName = id => courses.find(course => course.id === id)?.name || '삭제된 과목의 학습 기록'
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState('all')
  const [filter, setFilter] = useState('unresolved')
  const [bookmarks, setBookmarks] = useState(false)
  const [sort, setSort] = useState('recent')
  const [expanded, setExpanded] = useState([])
  const records = state.wrongAnswers
  const resolved = records.filter(record => record.resolved).length
  const filtered = records.filter(record => {
    const q = questionById[record.questionId]
    return q && (courseId === 'all' || q.courseId === courseId) && (filter === 'all' || record.resolved === (filter === 'resolved')) && (!bookmarks || record.bookmarked) && `${courseName(q.courseId)} ${q.prompt}`.includes(search.trim())
  }).sort((a, b) => sort === 'attempts' ? b.attempts - a.attempts : b.updatedAt - a.updatedAt)
  function review(ids) {
    const session = makeSession({ mode: 'review', questionType: 'multiple', count: ids.length, questionIds: ids, courseId: questionById[ids[0]]?.courseId }, records)
    dispatch({ type: 'SESSION_START', session })
    navigate(`/study/session/${session.id}`)
  }
  return (
    <section className="service-page wrong-answers-page">
      <h1 className="sr-only">오답노트</h1>
      <div className="wrong-summary-row"><section className="service-card"><h2>복습 현황</h2><p>총 오답 {records.length}개 <strong>{records.length ? Math.round(resolved / records.length * 100) : 0}%</strong></p><progress aria-label="오답 복습 완료율" max={records.length || 1} value={resolved} /><p className="service-muted">복습 완료 {resolved}개 · 남은 오답 {records.length - resolved}개</p></section><section className="service-card wrong-filters" aria-label="오답 검색과 필터"><input className="service-search" aria-label="과목명 또는 문제 검색" placeholder="과목명이나 문제를 검색하세요." value={search} onChange={event => setSearch(event.target.value)} /><div className="service-toolbar"><label className="service-field"><span className="sr-only">과목 필터</span><select aria-label="과목 필터" value={courseId} onChange={event => setCourseId(event.target.value)}><option value="all">모든 과목</option>{courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label><label className="service-field"><span className="sr-only">복습 상태</span><select aria-label="복습 상태" value={filter} onChange={event => setFilter(event.target.value)}><option value="unresolved">복습할 오답</option><option value="resolved">복습 완료</option><option value="all">모든 기록</option></select></label><label className="service-field"><span className="sr-only">정렬</span><select aria-label="정렬" value={sort} onChange={event => setSort(event.target.value)}><option value="recent">최근 틀린순</option><option value="attempts">오답 횟수순</option></select></label><button className="service-plain-button" type="button" aria-pressed={bookmarks} onClick={() => setBookmarks(value => !value)}>북마크만</button></div></section></div>
      <div className="service-action-row"><Button disabled={!filtered.length} onClick={() => review(filtered.map(record => record.questionId))}>선택 목록 복습하기</Button></div>
      <div className="wrong-list">{filtered.map((record, index) => {
        const question = questionById[record.questionId]
        const open = expanded.includes(question.id)
        return <article className="wrong-card" key={question.id}>
          <header><h2>Q. {String(index + 1).padStart(2, '0')} - {courseName(question.courseId)}</h2><button className="bookmark-button" type="button" aria-label={`${question.prompt} 북마크`} aria-pressed={record.bookmarked} onClick={() => dispatch({ type: 'BOOKMARK', id: question.id })}>{record.bookmarked ? '★' : '☆'}</button><button className="service-plain-button" type="button" onClick={() => review([question.id])}>복습퀴즈하기</button></header>
          <div className="wrong-card__body">
            {index === 0 && <div className="wrong-card__face" aria-hidden="true"><img className="wrong-card__eye wrong-card__eye--upper" src={faceEye} alt="" /><img className="wrong-card__eye wrong-card__eye--lower" src={faceEye} alt="" /></div>}
            <p>Q. {question.prompt}</p><p className="wrong-submitted">오답: {record.submittedAnswer}</p><p className="wrong-correct">정답: {question.answer}</p><span className="service-muted">{record.attempts}회 오답 · {record.resolved ? '복습 완료' : '복습 필요'}</span></div>
          <button className="wrong-explanation-toggle" type="button" aria-expanded={open} aria-controls={`explanation-${question.id}`} onClick={() => setExpanded(current => open ? current.filter(id => id !== question.id) : [...current, question.id])}>해설 <span aria-hidden="true">{open ? '⌃' : '⌄'}</span></button>
          {open && <p className="wrong-explanation" id={`explanation-${question.id}`}>{question.explanation}</p>}
        </article>
      })}</div>
      {!filtered.length && <EmptyState title="조건에 맞는 오답이 없습니다" to="/study/setup" linkLabel="새 퀴즈 풀기">검색·필터를 변경하거나 퀴즈를 풀어보세요.</EmptyState>}

    </section>
  )
}
