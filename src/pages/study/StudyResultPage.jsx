import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import { EmptyState } from '../../components/service/ServiceUI.jsx'
import { makeSession } from '../../data/learningDemo.js'
import { useDemo } from '../../state/DemoContext.js'
import './StudyPages.css'

export default function StudyResultPage() {
  const { sessionId } = useParams()
  const { state, dispatch } = useDemo()
  const session = state.sessions[sessionId]
  const navigate = useNavigate()
  if (!session || session.status !== 'complete') return <EmptyState title="완료된 학습 결과가 없습니다" to="/study/setup" linkLabel="학습 시작">새로고침하면 학습 세션은 초기화됩니다. 보상 기록과 코인은 별도로 유지됩니다.</EmptyState>
  const correct = session.answers.filter(answer => answer.correct).length
  const total = session.questionIds.length
  const percent = Math.round(correct / total * 100)
  function replay() { const fresh = makeSession({ ...session, questionIds: session.questionIds }); dispatch({ type: 'SESSION_START', session: fresh }); navigate(`/study/session/${fresh.id}`) }
  return <section className="study-result service-page"><div className="result-ring" style={{ background: `conic-gradient(#123263 ${percent}%, #d9d9d9 0)` }}><strong>{percent}%</strong></div><h1>{session.mode === 'review' ? '오답 복습 완료!' : session.mode === 'concept' ? '개념 학습 완료!' : percent >= 50 ? '좋은 시작이에요!' : '다시 복습해볼까요?'}</h1><p>총 {total}문제 중 <strong>{correct}문제</strong> 정답</p><dl className="result-stats"><div><dt>정답</dt><dd>{correct}</dd></div><div><dt>오답</dt><dd>{total - correct}</dd></div><div><dt>정확도</dt><dd>{percent}%</dd></div></dl><div className="result-actions"><Button to={`/study/session/${sessionId}/reward`}>코인 보상 확인</Button><button className="service-plain-button" onClick={replay}>다시 풀기</button><Link className="service-plain-button" to="/wrong-answers">오답노트 보기</Link><Link to="/dashboard">나가기</Link></div><p className="service-muted">정답 1개당 1코인, 한 학습당 최대 3코인. 개념 학습에는 코인이 지급되지 않습니다.</p></section>
}
