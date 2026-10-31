import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext.js'
import { checkNickname, sendCode, signup, verifyCode } from '../../services/api.js'
import Button from '../../components/common/Button.jsx'
import FormField from '../../components/common/FormField.jsx'
import { SignupCompleteArtwork, SignupProgress } from '../../components/auth/AuthArtwork.jsx'
import AuthDemoNotice from '../../components/auth/AuthDemoNotice.jsx'
import lock from '../../assets/auth/signup-lock.svg'
import './SignupPage.css'

const CODE_SECONDS = 300
const RESEND_SECONDS = 60
const emptyDetails = { email: '', code: '', nickname: '', password: '', confirmation: '', school: '', department: '' }

export default function SignupPage() {
  const [step, setStep] = useState('details')
  const [submitting, setSubmitting] = useState(false)
  const [details, setDetails] = useState(emptyDetails)
  const [errors, setErrors] = useState({})
  const [codeSentAt, setCodeSentAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [codeStatus, setCodeStatus] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [nicknameStatus, setNicknameStatus] = useState('')
  const headingRef = useRef(null)
  const { refresh } = useAuth()
  useEffect(() => {
    if (!codeSentAt) return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [codeSentAt])
  const elapsed = codeSentAt ? Math.floor((now - codeSentAt) / 1000) : 0
  const remaining = Math.max(0, CODE_SECONDS - elapsed)
  const resendWait = codeSentAt ? Math.max(0, RESEND_SECONDS - elapsed) : 0
  const khuEmail = /^\S+@khu\.ac\.kr$/i.test(details.email.trim())
  const expired = Boolean(codeSentAt) && remaining === 0
  async function requestCode() {
    const email = details.email.trim()
    if (!/^\S+@khu\.ac\.kr$/i.test(email)) {
      setErrors(current => ({ ...current, email: '경희대학교 이메일(@khu.ac.kr)만 사용할 수 있습니다.' }))
      return
    }
    setSending(true)
    setCodeStatus('')
    try {
      await sendCode(email)
      setCodeSentAt(Date.now())
      setNow(Date.now())
      setDetails(current => ({ ...current, code: '' }))
      setCodeStatus('인증 코드를 메일로 보냈습니다. 5분 안에 입력해주세요.')
    } catch (error) {
      setErrors(current => ({ ...current, email: error.message }))
    } finally {
      setSending(false)
    }
  }
  async function checkNicknameAvailable() {
    const nickname = details.nickname.trim()
    if (!nickname) { setNicknameStatus('먼저 닉네임을 입력해주세요.'); return }
    setNicknameStatus('확인 중...')
    try {
      setNicknameStatus(await checkNickname(nickname) ? '사용할 수 있는 닉네임입니다.' : '이미 사용 중인 닉네임입니다.')
    } catch (error) {
      setNicknameStatus(error.message)
    }
  }
  async function confirmCode() {
    if (!/^\d{6}$/.test(details.code.trim())) {
      setErrors(current => ({ ...current, code: '6자리 인증 코드를 입력해주세요.' }))
      return
    }
    if (expired) {
      setErrors(current => ({ ...current, code: '인증 코드가 만료되었습니다. 코드를 다시 받아주세요.' }))
      return
    }
    setVerifying(true)
    try {
      await verifyCode(details.email.trim(), details.code.trim())
      setVerified(true)
      setCodeStatus('')
    } catch (error) {
      setErrors(current => ({ ...current, code: error.message }))
    } finally {
      setVerifying(false)
    }
  }
  function update(name, value) {
    if (name === 'email') { setCodeSentAt(null); setCodeStatus(''); setVerified(false) }
    setDetails(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: undefined }))
    if (name === 'nickname') setNicknameStatus('')
  }
  async function submit(event) {
    event.preventDefault()
    if (submitting) return
    setSubmitError('')
    const nextErrors = {}
    if (!/^\S+@khu\.ac\.kr$/i.test(details.email.trim())) nextErrors.email = '경희대학교 이메일(@khu.ac.kr)만 사용할 수 있습니다.'
    else if (!verified) nextErrors.code = '이메일 인증을 완료해주세요.'
    if (!details.nickname.trim()) nextErrors.nickname = '닉네임을 입력해주세요.'
    if (details.password.length < 5) nextErrors.password = '비밀번호를 5자리 이상 입력해주세요.'
    if (!details.confirmation || details.confirmation !== details.password) nextErrors.confirmation = '비밀번호가 일치하지 않습니다.'
    if (!details.school.trim()) nextErrors.school = '소속 학교를 입력해주세요.'
    if (!details.department.trim()) nextErrors.department = '학과를 입력해주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      document.getElementById(`signup-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }
    setSubmitting(true)
    try {
      await signup(details.email.trim(), details.password, details.nickname.trim())
    } catch (error) {
      if (error.status === 409 && error.message.includes('닉네임')) {
        setErrors({ nickname: error.message })
      } else if (error.status === 409) {
        setErrors({ email: '이미 가입된 이메일입니다.' })
      } else if (error.status === 400) {
        setVerified(false)
        setCodeSentAt(null)
        setErrors({ code: error.message })
      } else {
        setSubmitError(error.message)
      }
      setSubmitting(false)
      return
    }
    try {
      await refresh()
    } finally {
      setSubmitting(false)
    }
    setDetails({ ...emptyDetails })
    setStep('complete')
    headingRef.current?.focus()
  }
  if (step === 'complete') return (
    <section className="signup-complete" aria-labelledby="signup-complete-title">
      <SignupCompleteArtwork />
      <h1 id="signup-complete-title" tabIndex={-1} ref={node => node?.focus()}>가입 완료</h1>
      <div className="auth-preview-note">
        <AuthDemoNotice>
          <p><strong>가입 완료</strong></p>
        </AuthDemoNotice>
        <Link to="/dashboard">대시보드로 이동</Link>
        <Link to="/login">로그인 화면으로 돌아가기</Link>
      </div>
    </section>
  )
  return (
    <section className="signup-page" aria-labelledby="signup-title">
      <aside className="signup-intro">
        <h1 id="signup-title" tabIndex={-1} ref={headingRef}>회원가입</h1>
        <SignupProgress />
      </aside>
      <form className="signup-form" onSubmit={submit} noValidate>
        <FormField id="signup-email" label="이메일" type="email" value={details.email} onChange={e => update('email', e.target.value)} autoComplete="email" readOnly={verified} error={errors.email} placeholder="name@khu.ac.kr"
          hint={!verified && details.email.trim() && !khuEmail ? '경희대학교 이메일(@khu.ac.kr)만 사용할 수 있습니다.' : undefined}>
          {verified ? <span className="auth-status" role="status">인증 완료 ✓</span> : (
            <Button className="nickname-check" onClick={requestCode} disabled={sending || !khuEmail || resendWait > 0}>
              {sending ? '발송 중...' : !codeSentAt ? '인증 코드 받기' : resendWait > 0 ? `재전송 (${resendWait}초)` : '재전송'}
            </Button>
          )}
        </FormField>
        {codeSentAt && !verified && (
          <FormField id="signup-code" label="인증 코드" value={details.code} onChange={e => update('code', e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6}
            hint={expired ? '인증 코드가 만료되었습니다. 재전송을 눌러주세요.' : `남은 시간 ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`} error={errors.code}>
            <Button className="nickname-check" onClick={confirmCode} disabled={verifying || expired}>{verifying ? '확인 중...' : '확인'}</Button>
          </FormField>
        )}
        {(!codeSentAt || verified) && errors.code && <p className="field-error">{errors.code}</p>}
        <p className="auth-status" role="status">{codeStatus}</p>
        <FormField id="signup-nickname" label="닉네임" value={details.nickname} onChange={e => update('nickname', e.target.value)} autoComplete="nickname" maxLength={30} error={errors.nickname}>
          <Button className="nickname-check" onClick={checkNicknameAvailable}>중복확인</Button>
        </FormField>
        <p className="auth-status nickname-status" role="status">{nicknameStatus}</p>
        <FormField id="signup-password" label="비밀번호" type="password" value={details.password} onChange={e => update('password', e.target.value)} autoComplete="new-password" hint="5자리 이상 입력해주세요." error={errors.password}><img className="signup-lock" src={lock} alt="" /></FormField>
        <FormField id="signup-confirmation" label="비밀번호 확인" type="password" value={details.confirmation} onChange={e => update('confirmation', e.target.value)} autoComplete="new-password" error={errors.confirmation} />
        <div className="signup-school-row">
          <FormField id="signup-school" label="소속 학교" value={details.school} onChange={e => update('school', e.target.value)} autoComplete="organization" maxLength={80} error={errors.school} />
          <FormField id="signup-department" label="학과" value={details.department} onChange={e => update('department', e.target.value)} maxLength={80} error={errors.department} />
        </div>
        <Button type="submit" disabled={submitting}>{submitting ? '가입 중...' : '가입하기'}</Button>
        <p className="field-error" role="alert">{submitError}</p>
      </form>
    </section>
  )
}
