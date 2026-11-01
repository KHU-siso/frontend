import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AiKeyPanel from '../../components/common/AiKeyPanel.jsx'
import { AI_ERRORS, isAiKeyError } from '../../components/common/aiKey.js'
import Button from '../../components/common/Button.jsx'
import { clearAiKey, generateQuiz, getAiKey, listDocuments, listWrongNotes } from '../../services/api.js'
import { useSubjects } from '../../state/SubjectsContext.js'
import './StudyPages.css'

const modes = [['practice', '문제 풀기', '업로드한 PDF 자료로 AI가 만든 문제를 풀어요.'], ['review', '오답 복습', '틀렸던 문제를 다시 풀어봐요.']]
const titles = ['오늘의 학습을 시작해볼까요?', '무엇을 공부할까요?', '어떻게 학습할까요?', '문제 풀기']

export default function StudySetupPage() {
  const [params] = useSearchParams()
  const { data } = useSubjects()
  const courses = data.subjects
  const courseById = Object.fromEntries(courses.map(course => [course.id, course]))
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState({ minutes: 30, streak: 3, count: 10, courseId: courseById[params.get('course')] ? params.get('course') : '', mode: 'practice', questionType: 'multiple' })
  const [error, setError] = useState('')
  // AI 키 오류(키 없음·잘못됨·한도·모델·연결): 이 화면 안에서 키를 입력/변경하고 같은 설정으로 다시 시도할 수 있게 안내를 띄운다.
  const [aiError, setAiError] = useState('')
  const [aiProvider, setAiProvider] = useState(() => getAiKey()?.provider ?? null)
  const [keyNotice, setKeyNotice] = useState('')
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [busy, setBusy] = useState(false)
  useEffect(() => { listDocuments().then(setDocuments).catch(() => {}) }, [])
  const courseDocs = documents.filter(doc => doc.subject_ref === config.courseId)
  async function start() {
    if (!courseById[config.courseId]) return setError('자료실에서 학습할 과목을 등록하거나 선택해주세요.')
    setBusy(true)
    setError('')
    setAiError('')
    setKeyNotice('')
    try {
      if (config.mode === 'review') {
        const notes = (await listWrongNotes()).filter(note => note.subject_ref === config.courseId && !note.resolved)
        if (!notes.length) return setError('이 과목에는 복습할 오답이 없습니다.')
        navigate(`/study/review?ids=${notes.map(note => note.quiz_question_id).join(',')}`)
        return
      }
      const doc = courseDocs[0]
      if (!doc) return setError('이 과목에 업로드한 PDF 자료가 없습니다. 자료실에서 PDF를 먼저 올려주세요.')
      const quizSet = await generateQuiz(doc.id, config.questionType === 'multiple' ? '객관식' : '주관식')
      navigate(`/study/session/${quizSet.id}`)
    } catch (failure) {
      if (isAiKeyError(failure)) {
        if (failure.code === 'AI_KEY_REQUIRED') { clearAiKey(); setAiProvider(null) }
        setAiError(AI_ERRORS[failure.code])
      } else setError(failure.message)
    } finally {
      setBusy(false)
    }
  }
  function next(event) {
    event.preventDefault()
    setError('')
    if (step === 1 && !config.courseId) return setError('과목을 선택해주세요.')
    if (step < 3) setStep(current => current + 1)
    else if (!busy) start()
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
        {config.courseId && !courseDocs.length && config.mode !== 'review' && <p className="service-muted">이 과목에는 업로드한 PDF 자료가 없습니다. <Link to="/materials">자료실에서 PDF 올리기</Link></p>}
        {busy && <p className="service-muted" role="status">AI가 문제를 만드는 중이에요. 최대 1분 정도 걸릴 수 있어요…</p>}
        {error && <p className="service-error" role="alert">{error} <Link to="/wrong-answers">오답노트 보기</Link></p>}
        {keyNotice && <p className="service-muted" role="status">{keyNotice}</p>}
        {aiError && <>
          <p className="service-error" role="alert">{aiError}</p>
          <AiKeyPanel savedProvider={aiProvider} onError={setAiError}
            onSaved={provider => { setAiProvider(provider); setAiError(''); setKeyNotice('키를 저장했어요. 설정은 그대로예요. 다시 "학습 시작"을 눌러주세요.') }}
            onRemoved={() => { setAiProvider(null); setAiError(AI_ERRORS.AI_KEY_REQUIRED) }}
            onCancel={() => setAiError('')} />
        </>}
        <div className="service-action-row">{step > 0 && <button className="service-plain-button" type="button" onClick={() => { setStep(current => current - 1); setError(''); setAiError(''); setKeyNotice('') }}>이전</button>}<Button type="submit" disabled={busy}>{step < 3 ? '넘어가기' : busy ? '문제 생성 중…' : '학습 시작'}</Button></div>
      </form>

    </section>
  )
}
