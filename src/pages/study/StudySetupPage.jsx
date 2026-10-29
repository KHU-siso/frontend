import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import { makeSession, questions } from '../../data/learningDemo.js'
import { useSubjects } from '../../state/SubjectsContext.js'
import { useDemo } from '../../state/DemoContext.js'
import './StudyPages.css'

const modes = [['practice', '문제 풀기', '배운 내용을 문제로 확인해요.'], ['review', '오답 복습', '틀렸던 문제를 다시 풀어봐요.'], ['concept', '개념 학습', '중요한 개념을 다시 확인해요.'], ['quick', '빠른 학습', '짧은 시간 동안 핵심 문제만 풀어요.']]
const titles = ['오늘의 학습을 시작해볼까요?', '무엇을 공부할까요?', '어떻게 학습할까요?', '문제 풀기']

export default function StudySetupPage() {
  const [params] = useSearchParams()
  const { data } = useSubjects()
  const courses = data.subjects
  const courseById = Object.fromEntries(courses.map(course => [course.id, course]))
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState({ minutes: 30, streak: 3, count: 10, courseId: courseById[params.get('course')] ? params.get('course') : '', mode: 'practice', questionType: 'multiple' })
  const [error, setError] = useState('')
  const { state, dispatch } = useDemo()
  const navigate = useNavigate()
  function start() {
    if (!courseById[config.courseId]) return setError('자료실에서 학습할 과목을 등록하거나 선택해주세요.')
    const session = makeSession({ ...config, subjectName: courseById[config.courseId].name }, state.wrongAnswers)
    if (!session.questionIds.length) return setError(config.mode === 'review' ? '이 과목에는 복습할 오답이 없습니다.' : '이 과목에는 아직 연결된 문제가 없습니다. 자료와 노트를 먼저 정리해주세요. 퀴즈 생성은 학습 API 연결 후 제공됩니다.')
    dispatch({ type: 'SESSION_START', session })
    navigate(`/study/session/${session.id}`)
  }
  function next(event) {
    event.preventDefault()
    setError('')
    if (step === 1 && !config.courseId) return setError('과목을 선택해주세요.')
    if (step < 3) setStep(current => current + 1)
    else start()
  }
  const update = (key, value) => setConfig(current => ({ ...current, [key]: value }))
  return (
    <section className="study-setup service-page">
      <h1>{titles[step]}</h1>
      <p className="study-step-label">{step + 1} / 4 · {['학습 목표', '과목 선택', '학습 방식', '문제 유형'][step]}</p>
      <form onSubmit={next} className="study-setup-form">
        {step === 0 && <div className="study-goals"><label className="service-field">오늘의 학습 목표<select value={config.minutes} onChange={event => update('minutes', Number(event.target.value))}><option value="30">30분</option><option value="60">1시간</option><option value="90">1시간 30분</option></select></label><label className="service-field">연속 학습 목표 (일)<input type="number" min="1" max="30" required value={config.streak} onChange={event => update('streak', event.target.value)} /></label><label className="service-field">오늘 풀 문제 (직접 작성 가능)<input type="number" min="1" max="30" required value={config.count} onChange={event => update('count', event.target.value)} /></label></div>}
        {step === 1 && <div className="study-choices">{courses.map(course => <button className="study-choice" type="button" key={course.id} aria-pressed={config.courseId === course.id} onClick={() => update('courseId', course.id)}>{course.name}</button>)}</div>}
        {step === 2 && <div className="study-choices study-modes">{modes.map(([id, name, description]) => <button className="study-choice" type="button" key={id} aria-pressed={config.mode === id} onClick={() => update('mode', id)}><strong>{name}</strong><small>{description}</small></button>)}</div>}
        {step === 3 && <div className="study-choices study-types">{[['short', '주관식'], ['multiple', '객관식']].map(([id, label]) => <button className="study-choice" type="button" key={id} aria-pressed={config.questionType === id} onClick={() => update('questionType', id)}>{label}</button>)}</div>}
        {config.courseId && !questions.some(question => question.courseId === config.courseId) && <p className="service-muted">등록한 과목이 선택되었습니다. 아직 연결된 문제가 없습니다. <Link to={`/materials/${config.courseId}`}>과목 홈에서 노트·강의자료 정리하기</Link></p>}
        {error && <p className="service-error" role="alert">{error} <Link to="/wrong-answers">오답노트 보기</Link></p>}
        <div className="service-action-row">{step > 0 && <button className="service-plain-button" type="button" onClick={() => { setStep(current => current - 1); setError('') }}>이전</button>}<Button type="submit">{step < 3 ? '넘어가기' : '학습 시작'}</Button></div>
      </form>

    </section>
  )
}
