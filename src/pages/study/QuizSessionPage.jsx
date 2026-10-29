import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import { EmptyState } from '../../components/service/ServiceUI.jsx'
import AnswerFeedback from '../../components/study/AnswerFeedback.jsx'
import { questionById } from '../../data/learningDemo.js'
import { useSubjects } from '../../state/SubjectsContext.js'
import { useDemo } from '../../state/DemoContext.js'
import './StudyPages.css'

export default function QuizSessionPage() {
  const { sessionId } = useParams()
  const { state, dispatch } = useDemo()
  const { data } = useSubjects()
  const session = state.sessions[sessionId]
  const index = session?.currentIndex || 0
  const [draft, setDraft] = useState('')
  const navigate = useNavigate()
  if (!session) return <EmptyState title="학습 세션을 찾을 수 없어요" to="/study/setup" linkLabel="새 학습 시작">진행 중인 문제는 새로고침 시 초기화됩니다. 이미 받은 코인과 보유 아이템은 유지됩니다.</EmptyState>
  if (session.status === 'complete') return <Navigate to={`/study/session/${sessionId}/result`} replace />
  const question = questionById[session.questionIds[index]]
  const answer = session.answers[index]
  function submit(event) {
    event.preventDefault()
    if (session.mode !== 'concept' && !draft.trim()) return
    dispatch({ type: 'ANSWER', id: sessionId, index, answer: session.mode === 'concept' ? question.answer : draft.trim(), at: Date.now() })
  }
  function next() {
    if (index + 1 >= session.questionIds.length) { dispatch({ type: 'SESSION_FINISH', id: sessionId }); navigate(`/study/session/${sessionId}/result`) }
    else { dispatch({ type: 'ADVANCE_QUESTION', id: sessionId }); setDraft('') }
  }
  return (
    <section className="quiz-page service-page" aria-labelledby="question-title">
      <div className="quiz-tags"><span className="service-badge">{data.subjects.find(subject => subject.id === question.courseId)?.name || session.subjectName || '삭제된 과목의 학습 기록'}</span><span className="service-badge">{session.mode === 'concept' ? '개념 학습' : session.questionType === 'multiple' ? '객관식' : '주관식'}</span>{session.mode === 'review' && <span className="service-badge">오답 복습</span>}</div>
      <h1 id="question-title">{question.prompt}</h1>
      <form onSubmit={submit}>
        {session.mode === 'concept' ? <p className="concept-card">{question.explanation}</p> : session.questionType === 'multiple' ? <fieldset className="quiz-options" disabled={!!answer}><legend className="sr-only">정답 선택</legend>{question.choices.map((choice, i) => <label key={choice} className={`${answer && choice === question.answer ? 'is-correct' : ''} ${answer && !answer.correct && choice === answer.submittedAnswer ? 'is-incorrect' : ''} ${draft === choice ? 'is-selected' : ''}`}><input type="radio" name="answer" value={choice} checked={draft === choice} onChange={() => setDraft(choice)} /><span className="quiz-option-number">{i + 1}</span><span>{choice}</span></label>)}</fieldset> : <label className="service-field quiz-short-answer"><span className="sr-only">정답 입력</span><input placeholder="정답 입력" value={draft} disabled={!!answer} onChange={event => setDraft(event.target.value)} maxLength={200} autoComplete="off" /></label>}
        {!answer && <Button className="quiz-submit" type="submit" disabled={session.mode !== 'concept' && !draft.trim()}>{session.mode === 'concept' ? '개념 확인 완료' : '정답 확인'}</Button>}
      </form>
      {answer && <><AnswerFeedback question={question} answer={answer} review={session.mode === 'review'} /><Button className="quiz-submit" onClick={next}>{index + 1 === session.questionIds.length ? '결과 확인' : session.mode === 'review' ? '다음 복습하기' : '다음 문제로 넘어가기'}</Button></>}

    </section>
  )
}
