import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import FormField from '../../components/common/FormField.jsx'
import { LoginSymbol } from '../../components/auth/AuthArtwork.jsx'
import AuthDemoNotice from '../../components/auth/AuthDemoNotice.jsx'
import googleContinue from '../../assets/auth/google-continue.png'
import './LoginPage.css'

export default function LoginPage() {
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  function submit(event) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const nextErrors = {}
    if (!values.get('username').trim()) nextErrors.username = '아이디를 입력해주세요.'
    if (!values.get('password')) nextErrors.password = '비밀번호를 입력해주세요.'
    setErrors(nextErrors)
    setStatus(Object.keys(nextErrors).length ? '' : '로그인할 수 없습니다. 다시 시도해주세요.')
  }
  return (
    <section className="login-page" aria-labelledby="login-title">
      <div className="login-panel">
        <LoginSymbol />
        <h1 id="login-title">환영합니다</h1>
        <p className="login-subtitle">모람과 함께 더 스마트한 학습을 시작하세요.</p>
        <button className="google-continue" type="button" onClick={() => setStatus('Google로 계속할 수 없습니다. 다시 시도해주세요.')} aria-label="Google로 계속하기">
          <span className="google-continue__crop" aria-hidden="true"><img src={googleContinue} alt="" /></span>
        </button>
        <form className="login-form" onSubmit={submit} noValidate>
          <FormField id="login-username" name="username" label="아이디" autoComplete="username" placeholder="아이디를 입력하세요." error={errors.username} />
          <FormField id="login-password" name="password" label="비밀번호" type="password" autoComplete="current-password" placeholder="비밀번호를 입력하세요." error={errors.password}
            action={<button className="auth-link-button" type="button" onClick={() => setStatus('비밀번호 찾기를 진행할 수 없습니다. 다시 시도해주세요.')}>비밀번호 찾기</button>} />
          <Button type="submit" className="login-submit">로그인 하기</Button>
        </form>
        <p className="auth-status" role="status">{status}</p>
        <Link className="login-signup" to="/signup">회원가입</Link>
        <div className="auth-preview-note">
          <AuthDemoNotice><p><strong>화면 미리보기</strong> · 실제 로그인은 지원하지 않습니다.</p></AuthDemoNotice>
          <Link to="/dashboard">대시보드 미리보기</Link>
        </div>
        <AuthDemoNotice>
          <p className="login-legal">이용약관 및 개인정보 처리방침은 서비스 연결 시 제공됩니다.</p>
        </AuthDemoNotice>
      </div>
    </section>
  )
}
