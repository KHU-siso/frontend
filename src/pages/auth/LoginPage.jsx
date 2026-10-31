import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext.js'
import Button from '../../components/common/Button.jsx'
import FormField from '../../components/common/FormField.jsx'
import { LoginSymbol } from '../../components/auth/AuthArtwork.jsx'
import AuthDemoNotice from '../../components/auth/AuthDemoNotice.jsx'
import { login } from '../../services/api.js'
import './LoginPage.css'

export default function LoginPage() {
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useAuth()
  async function submit(event) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const nextErrors = {}
    if (!values.get('email').trim()) nextErrors.email = '이메일을 입력해주세요.'
    if (!values.get('password')) nextErrors.password = '비밀번호를 입력해주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { setStatus(''); return }
    setStatus('로그인 중…')
    try {
      await login(values.get('email').trim(), values.get('password'))
      await refresh()
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setStatus(error.status === 401 ? '이메일 또는 비밀번호가 올바르지 않습니다.' : error.message)
    }
  }
  return (
    <section className="login-page" aria-labelledby="login-title">
      <div className="login-panel">
        <LoginSymbol />
        <h1 id="login-title">환영합니다</h1>
        <p className="login-subtitle">모람과 함께 더 스마트한 학습을 시작하세요.</p>
        <p className="login-khu-note">khu.ac.kr 경희대 이메일로만 회원가입과 로그인이 가능합니다.</p>
        <form className="login-form" onSubmit={submit} noValidate>
          <FormField id="login-email" name="email" type="email" label="이메일" autoComplete="email" placeholder="이메일을 입력하세요." error={errors.email} />
          <FormField id="login-password" name="password" label="비밀번호" type="password" autoComplete="current-password" placeholder="비밀번호를 입력하세요." error={errors.password}
            action={<button className="auth-link-button" type="button" onClick={() => setStatus('비밀번호 찾기를 진행할 수 없습니다. 다시 시도해주세요.')}>비밀번호 찾기</button>} />
          <Button type="submit" className="login-submit">로그인 하기</Button>
        </form>
        <p className="auth-status" role="status">{status}</p>
        <Link className="login-signup" to="/signup">회원가입</Link>
        <AuthDemoNotice>
          <p className="login-legal">이용약관 및 개인정보 처리방침은 서비스 연결 시 제공됩니다.</p>
        </AuthDemoNotice>
      </div>
    </section>
  )
}
