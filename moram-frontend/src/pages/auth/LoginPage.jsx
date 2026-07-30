import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isLoggedIn = localStorage.getItem("moram-auth") === "true";

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError("올바른 이메일 형식으로 입력해주세요.");
      return;
    }

    localStorage.setItem("moram-auth", "true");
    localStorage.setItem("moram-user-email", email.trim());
    navigate(location.state?.from || "/dashboard", { replace: true });
  }

  return (
    <main className="login-page">
      <section className="login-visual" aria-hidden="true">
        <div className="login-brand">
          <div className="brand-mark login-brand-mark">M</div>
          <strong>모람</strong>
        </div>
        <div className="login-copy">
          <p className="login-kicker">나만의 AI 학습 메이트</p>
          <h1>배운 내용을<br />오늘의 성취로.</h1>
          <p>강의자료, 과제, 퀴즈와 학습 일정을 한곳에서 관리하세요.</p>
        </div>
        <div className="ongi-preview">
          <div className="ongi-head">
            <span className="ongi-eye left" />
            <span className="ongi-eye right" />
            <span className="ongi-nose" />
          </div>
          <div className="ongi-body" />
          <span className="ongi-shadow" />
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-mobile-brand">
            <div className="brand-mark">M</div>
            <strong>모람</strong>
          </div>

          <div>
            <p className="eyebrow">WELCOME BACK</p>
            <h2>로그인</h2>
            <p className="muted">모람에서 오늘의 학습을 시작해보세요.</p>
          </div>

          <label className="login-field">
            이메일
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </label>

          <label className="login-field">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}

          <div className="login-options">
            <label className="remember-label">
              <input type="checkbox" defaultChecked />
              로그인 상태 유지
            </label>
            <button type="button" className="text-button">비밀번호 찾기</button>
          </div>

          <button className="primary-button login-submit" type="submit">로그인</button>

          <p className="login-help">
            목업 버전에서는 <strong>이메일 형식의 아이디와 아무 비밀번호</strong>를 입력하면 로그인됩니다.
          </p>
        </form>
      </section>
    </main>
  );
}
