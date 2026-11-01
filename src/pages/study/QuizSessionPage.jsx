import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import { EmptyState } from '../../components/service/ServiceUI.jsx'
import AnswerFeedback from '../../components/study/AnswerFeedback.jsx'
import { getQuestion, listWrongNotes, retryAnswer, submitAnswer } from '../../services/api.js'
import './StudyPages.css'

const MAX_QUESTIONS = 10

// 보기 순서를 무작위로 섞는다(Fisher–Yates). 예전에 저장된 퀴즈는 정답이 항상 1번이라 화면에서도 섞어 보여준다.
function shuffled(items) {
  if (!Array.isArray(items)) return items
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// 퀴즈 풀이 화면. /study/session/:sessionId(서버 퀴즈 세트) 와 /study/review?ids=(오답 복습) 둘 다 처리한다.
export default function QuizSessionPage() {
  const { sessionId } = useParams()
  const [params] = useSearchParams()
  const isReview = !sessionId
  const reviewKey = params.get('ids') || ''
  const navigate = useNavigate()
  const [questions, setQuestions] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        let list
        if (isReview) {
          const wanted = new Set(reviewKey.split(',').map(Number))
          list = (await listWrongNotes()).filter(note => wanted.has(note.quiz_question_id)).map(note => ({ id: note.quiz_question_id, prompt: note.question_text, choices: shuffled(note.options) }))
        } else {
          const rows = await Promise.all(Array.from({ length: MAX_QUESTIONS }, (_, i) => getQuestion(sessionId, i + 1).catch(() => null)))
          list = rows.filter(Boolean).map(row => ({ id: row.id, prompt: row.question_text, choices: shuffled(row.options) }))
        }
        if (active) setQuestions(list)
      } catch (failure) { if (active) setLoadError(failure.message) }
    }
    load()
    return () => { active = false }
  }, [isReview, reviewKey, sessionId])

  if (loadError) return <EmptyState title="문제를 불러오지 못했어요" to="/study/setup" linkLabel="새 학습 시작">{loadError}</EmptyState>
  if (!questions) return <p className="service-page" role="status">문제를 불러오는 중…</p>
  if (!questions.length) return <EmptyState title="풀 문제가 없어요" to="/study/setup" linkLabel="새 학습 시작">문제가 없거나 접근할 수 없는 학습입니다.</EmptyState>

  const finished = index >= questions.length
  if (finished) {
    const correct = answers.filter(answer => answer.correct).length
    return <section className="study-result service-page"><h1>오답 복습 완료!</h1><p>총 {questions.length}문제 중 <strong>{correct}문제</strong> 정답</p>
      <div className="result-actions"><Button to="/wrong-answers">오답노트 보기</Button><Link to="/study/setup">새 학습</Link><Link to="/dashboard">나가기</Link></div></section>
  }

  const question = questions[index]
  const answer = answers[index]
  const multiple = Array.isArray(question.choices) && question.choices.length > 0
  async function submit(event) {
    event.preventDefault()
    if (!draft.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const result = await (isReview ? retryAnswer : submitAnswer)(question.id, draft.trim())
      setAnswers(current => [...current, { correct: result.is_correct, submittedAnswer: result.user_answer, answer: result.correct_answer, explanation: result.explanation }])
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }
  function next() {
    if (index + 1 >= questions.length && !isReview) { navigate(`/study/session/${sessionId}/result`); return }
    setIndex(current => current + 1)
    setDraft('')
  }
  return (
    <section className="quiz-page service-page" aria-labelledby="question-title">
      <div className="quiz-tags"><span className="service-badge">{index + 1} / {questions.length}</span><span className="service-badge">{multiple ? '객관식' : '주관식'}</span>{isReview && <span className="service-badge">오답 복습</span>}</div>
      <h1 id="question-title">{question.prompt}</h1>
      <form onSubmit={submit}>
        {multiple ? <fieldset className="quiz-options" disabled={!!answer}><legend className="sr-only">정답 선택</legend>{question.choices.map((choice, i) => <label key={choice} className={`${answer && choice === answer.answer ? 'is-correct' : ''} ${answer && !answer.correct && choice === answer.submittedAnswer ? 'is-incorrect' : ''} ${draft === choice ? 'is-selected' : ''}`}><input type="radio" name="answer" value={choice} checked={draft === choice} onChange={() => setDraft(choice)} /><span className="quiz-option-number">{i + 1}</span><span>{choice}</span></label>)}</fieldset>
          : <label className="service-field quiz-short-answer"><span className="sr-only">정답 입력</span><input placeholder="정답 입력" value={draft} disabled={!!answer} onChange={event => setDraft(event.target.value)} maxLength={200} autoComplete="off" /></label>}
        {!answer && <Button className="quiz-submit" type="submit" disabled={!draft.trim() || busy}>{busy ? '채점 중…' : '정답 확인'}</Button>}
      </form>
      {error && <p className="service-error" role="alert">{error}</p>}
      {answer && <><AnswerFeedback question={{ answer: answer.answer, explanation: answer.explanation }} answer={answer} review={isReview} /><Button className="quiz-submit" onClick={next}>{index + 1 === questions.length ? '결과 확인' : isReview ? '다음 복습하기' : '다음 문제로 넘어가기'}</Button></>}
    </section>
  )
}
