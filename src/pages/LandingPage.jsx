import { useEffect, useState } from 'react'
import OngIllustration from '../components/brand/OngIllustration.jsx'
import Button from '../components/common/Button.jsx'
import separator from '../assets/moram/benefit-separator.svg'
import './LandingPage.css'

const INTRO_DURATION_MS = 5000
const benefits = ['학생 전용 무료 플랜', '신용카드 불필요', '모든 대학교 지원']

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    if (!showIntro) return undefined
    const timer = window.setTimeout(() => setShowIntro(false), INTRO_DURATION_MS)
    // Cleanup on leaving / and when the intro changes to the welcome state.
    return () => window.clearTimeout(timer)
  }, [showIntro])

  return (
    <div className="landing" data-stage={showIntro ? 'intro' : 'welcome'}>
      <section
        className={`landing-stage intro-stage ${showIntro ? 'is-active' : ''}`}
        aria-label="MORAM 첫 화면"
        aria-hidden={!showIntro}
        inert={!showIntro}
      >
        <div className="hero-art">
          <h1 className="wordmark intro-wordmark">MORAM</h1>
          <OngIllustration />
        </div>
      </section>
      <section
        className={`landing-stage welcome-stage ${!showIntro ? 'is-active' : ''}`}
        aria-label="MORAM 서비스 소개"
        aria-hidden={showIntro}
        inert={showIntro}
      >
        <h1 className="wordmark welcome-wordmark">MORAM</h1>
        <div className="welcome-content">
          <p className="welcome-description">작은 배움이 모여 커다란 성장이 되는 공간</p>
          <Button className="study-button" to="/login">공부 시작하기</Button>
          <ul className="welcome-benefits" aria-label="서비스 이용 안내">
            {benefits.map((benefit, index) => (
              <li key={benefit}>
                {index > 0 && <img src={separator} alt="" className="benefit-separator" width="27" height="27" />}
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
