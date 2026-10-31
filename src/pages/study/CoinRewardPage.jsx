import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import { EmptyState } from '../../components/service/ServiceUI.jsx'
import { useDemo } from '../../state/DemoContext.js'
import { getQuizResult } from '../../services/api.js'
import CoinOng from '../../components/brand/CoinOng.jsx'
import backgroundTop from '../../assets/auth/login-background-large.svg'
import backgroundLarge from '../../assets/reward/background-large.svg'
import backgroundSmall from '../../assets/reward/background-small.svg'
import backgroundRight from '../../assets/reward/background-right.svg'
import correctCircle from '../../assets/reward/correct-circle.svg'
import correctCheck from '../../assets/reward/correct-check.svg'
import balanceCoin from '../../assets/reward/balance-coin.svg'
import shopArrow from '../../assets/reward/shop-arrow.svg'
import './CoinRewardPage.css'

export default function CoinRewardPage() {
  const { sessionId } = useParams()
  const { state, refreshShop } = useDemo()
  const [result, setResult] = useState(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    getQuizResult(sessionId).then(data => { if (active) { setResult(data); refreshShop().catch(() => {}) } }).catch(() => active && setFailed(true))
    return () => { active = false }
  }, [sessionId, refreshShop])
  if (failed) return <EmptyState title="보상받을 완료 학습이 없습니다" to="/study/setup" linkLabel="새 학습 시작">학습 결과를 확인할 수 없습니다.</EmptyState>
  if (!result) return <p className="service-page" role="status">보상을 확인하는 중…</p>
  const claimed = true
  const amount = result.coins_awarded
  const allCorrect = result.correct_count === result.total_questions
  return <section className="coin-reward" aria-labelledby="coin-reward-title">
    <div className="coin-reward-background" aria-hidden="true">
      <img className="coin-reward-background__top" src={backgroundTop} alt="" />
      <img className="coin-reward-background__small" src={backgroundSmall} alt="" />
      <img className="coin-reward-background__large" src={backgroundLarge} alt="" />
      <img className="coin-reward-background__right" src={backgroundRight} alt="" />
    </div>
    <h1 id="coin-reward-title" className="coin-reward__heading"><span className="coin-reward__check" aria-hidden="true"><img src={correctCircle} alt="" /><img src={correctCheck} alt="" /></span>{allCorrect ? '정답이에요!' : '학습을 완료했어요!'}</h1>
    <p className="coin-reward__subtitle">{amount ? claimed ? '문제를 맞히고 코인을 획득했어요.' : '' : '이번 학습에서는 지급할 코인이 없습니다.'}</p>
    <CoinOng />
    <p className="coin-reward__amount" aria-label={`이번 학습 보상 ${amount} 코인`}><strong>+{amount}</strong><span>COIN</span></p>
    <p className="coin-reward__encouragement">꾸준히 공부할수록 더 많은 코인을 모을 수 있어요!</p>
    <div className="coin-reward__balance"><span className="coin-reward__balance-icon" aria-hidden="true"><img src={balanceCoin} alt="" /><span>c</span></span><span>현재 보유 코인</span><strong data-testid="coin-balance">{state.economy.coinBalance} COIN</strong></div>
    <p className="sr-only" role="status">{claimed ? '보상 지급 완료. 같은 학습의 보상은 한 번만 받을 수 있습니다.' : ''}</p>
    <Button className="coin-reward__primary" to="/study/setup">다음 학습하기</Button>
    <Link className="coin-reward__shop" to="/shop">코인샵 가기<img src={shopArrow} alt="" /></Link>
    {state.storageFailed && <p className="service-error coin-reward__storage-error" role="alert">브라우저 저장소에 접근할 수 없어 새로고침 후 보존을 보장할 수 없습니다.</p>}
  </section>
}
