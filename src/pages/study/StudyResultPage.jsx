import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import { EmptyState } from '../../components/service/ServiceUI.jsx'
import { getQuizResult } from '../../services/api.js'
import { useDemo } from '../../state/DemoContext.js'
import './StudyPages.css'

export default function StudyResultPage() {
  const { sessionId } = useParams()
  const { refreshShop } = useDemo()
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    // 결과 조회 시 서버가 점수를 계산하고 코인을 (한 번만) 지급한다.
    getQuizResult(sessionId).then(data => { if (active) { setResult(data); refreshShop().catch(() => {}) } }).catch(failure => active && setError(failure.message))
    return () => { active = false }
  }, [sessionId, refreshShop])
  if (error) return <EmptyState title="학습 결과를 불러오지 못했습니다" to="/study/setup" linkLabel="학습 시작">{error}</EmptyState>
  if (!result) return <p className="service-page" role="status">결과를 계산하는 중…</p>
  const { correct_count: correct, total_questions: total, score: percent } = result
  return <section className="study-result service-page"><div className="result-ring" style={{ background: `conic-gradient(#123263 ${percent}%, #d9d9d9 0)` }}><strong>{percent}%</strong></div><h1>{percent >= 50 ? '좋은 시작이에요!' : '다시 복습해볼까요?'}</h1><p>총 {total}문제 중 <strong>{correct}문제</strong> 정답</p><dl className="result-stats"><div><dt>정답</dt><dd>{correct}</dd></div><div><dt>오답</dt><dd>{total - correct}</dd></div><div><dt>정확도</dt><dd>{percent}%</dd></div></dl><div className="result-actions"><Button to={`/study/session/${sessionId}/reward`}>코인 보상 확인</Button><Link className="service-plain-button" to="/study/setup">다시 풀기</Link><Link className="service-plain-button" to="/wrong-answers">오답노트 보기</Link><Link to="/dashboard">나가기</Link></div><p className="service-muted">정답률 50% 이상이면 코인을 받아요 (50~74% 1코인, 75% 이상 3코인).</p></section>
}
