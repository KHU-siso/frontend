import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function Landing() {
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`landingPage ${intro ? "landingIntro" : "landingReady"}`}>
      <nav className="nav landingNav">
        <Logo />
        <div>
          <a>소개</a>
          <a>고객센터</a>
          <a>자주 묻는 질문(FAQ)</a>
        </div>
        <div>
          <Link to="/login">로그인</Link>
          <Link to="/signup">회원가입</Link>
        </div>
      </nav>

      <section className="landingStage">
        <div className="landingWord" aria-hidden="true">MORAM</div>

        <div className="landingMascot" aria-label="모람 캐릭터">
          <div className="landingBody"></div>
          <div className="landingHead">
            <span className="landingEye left"></span>
            <span className="landingEye right"></span>
          </div>
          <div className="landingFoot left"></div>
          <div className="landingFoot right"></div>
          <div className="landingShadow"></div>
        </div>

        <div className="landingCta">
          <h2>작은 배움이 모여 커다란 성장이 되는 공간</h2>
          <Link to="/login" className="primary big">공부 시작하기</Link>
          <p>학생 전용 무료 플랜　·　신용카드 불필요　·　모든 대학교 지원</p>
        </div>
      </section>
    </div>
  );
}
