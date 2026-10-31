import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listWrongNotes } from '../../services/api.js'

// 과목 홈의 "퀴즈 오답" 카드. 오답노트 페이지와 같은 서버 기록(/api/wrong-notes)에서 이 과목(subject_ref) 것만 보여준다.
export default function SubjectWrongNotes({ subjectId }) {
  const [state, setState] = useState({ loading: true, error: '', notes: [] })
  useEffect(() => {
    let active = true
    listWrongNotes(subjectId)
      .then(rows => active && setState({ loading: false, error: '', notes: rows.filter(note => note.subject_ref === subjectId).sort((a, b) => Number(a.resolved) - Number(b.resolved) || Date.parse(b.answered_at) - Date.parse(a.answered_at)) }))
      .catch(failure => active && setState({ loading: false, error: failure.message, notes: [] }))
    return () => { active = false }
  }, [subjectId])
  const { loading, error, notes } = state
  const open = notes.filter(note => !note.resolved)
  return <section className="service-card subject-panel subject-panel--wrong" id="wrong-notes" aria-labelledby="subject-wrong-title">
    <header className="subject-panel__heading"><div><span className="subject-eyebrow">QUIZ REVIEW</span><h2 id="subject-wrong-title">퀴즈 오답 <small>{notes.length}</small></h2></div>{open.length > 0 && <Link className="subject-add-button" to={`/study/review?ids=${open.map(note => note.quiz_question_id).join(',')}`}>오답 복습하기</Link>}</header>
    {loading && <p className="subject-muted" role="status">오답 기록을 불러오는 중…</p>}
    {error && <p className="service-error" role="alert">{error}</p>}
    {!loading && !error && !notes.length && <div className="subject-empty"><strong>틀린 문제가 아직 없어요</strong><p>퀴즈를 풀다가 틀린 문제는 여기에 모여요.</p></div>}
    {notes.length > 0 && <ul className="subject-wrong-list" aria-label="퀴즈 오답 목록">{notes.map(note => <li className={`subject-wrong${note.resolved ? ' is-resolved' : ''}`} key={note.quiz_question_id}>
      <p className="subject-wrong__question">Q. {note.question_text}</p>
      <p className="subject-wrong__mine">내가 고른 답: {note.user_answer}</p>
      <p className="subject-wrong__answer">정답: {note.correct_answer}</p>
      {note.explanation && <p className="subject-wrong__explanation">해설: {note.explanation}</p>}
      <span className="subject-wrong__meta">{note.attempts}회 오답 · {note.resolved ? '복습 완료' : '복습 필요'}</span>
    </li>)}</ul>}
  </section>
}
