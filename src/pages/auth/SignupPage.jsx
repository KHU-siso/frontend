import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import FormField from '../../components/common/FormField.jsx'
import { SignupCompleteArtwork, SignupProgress } from '../../components/auth/AuthArtwork.jsx'
import AuthDemoNotice from '../../components/auth/AuthDemoNotice.jsx'
import lock from '../../assets/auth/signup-lock.svg'
import './SignupPage.css'

const timeOptions = [
  ['steady', '꾸준형', '매일 조금씩 공부'],
  ['focused', '집중형', '한 번에 오래 집중해서 공부'],
  ['last-minute', '벼락치기형', '시험 직전에 몰아서 공부'],
]
const studyOptions = [
  ['understanding', '이해형', '개념과 원리를 이해하며 공부'],
  ['memorization', '암기형', '반복해서 외우며 공부'],
  ['problem-solving', '문제풀이형', '문제를 풀면서 익히는 방식'],
  ['organizing', '정리형', '필기·노트·요약으로 정리하며 공부'],
]
const emptyDetails = { nickname: '', password: '', confirmation: '', school: '', department: '' }

function PreferenceGroup({ title, name, value, options, onChange }) {
  return (
    <fieldset className="preference-group">
      <legend>{title} <span>(선택)</span></legend>
      <div className="preference-options">
        {options.map(([key, label, description]) => (
          <label key={key} className={value === key ? 'is-selected' : ''}>
            <input type="radio" name={name} value={key} checked={value === key} onChange={() => onChange(key)} />
            <span><strong>{label}</strong><small>{description}</small></span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function SignupPage() {
  const [step, setStep] = useState('details')
  const [details, setDetails] = useState(emptyDetails)
  const [preferences, setPreferences] = useState({ time: '', study: '' })
  const [errors, setErrors] = useState({})
  const [nicknameStatus, setNicknameStatus] = useState('')
  const headingRef = useRef(null)
  function update(name, value) {
    setDetails(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: undefined }))
    if (name === 'nickname') setNicknameStatus('')
  }
  function next(event) {
    event.preventDefault()
    const nextErrors = {}
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
    setStep('preferences')
    headingRef.current?.focus()
  }
  function complete(event) {
    event.preventDefault()
    // No account is created; secrets are never persisted or included in demo data.
    setDetails({ ...emptyDetails })
    setStep('complete')
    headingRef.current?.focus()
  }
  if (step === 'complete') return (
    <section className="signup-complete" aria-labelledby="signup-complete-title">
      <SignupCompleteArtwork />
      <h1 id="signup-complete-title" tabIndex={-1} ref={node => node?.focus()}>입력 완료</h1>
      <div className="auth-preview-note">
        <AuthDemoNotice>
          <p><strong>입력 완료</strong><br />실제 계정은 생성되지 않았습니다.</p>
        </AuthDemoNotice>
        <Link to="/dashboard">대시보드 미리보기</Link>
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
      {step === 'details' ? (
        <form className="signup-form" onSubmit={next} noValidate>
          <FormField id="signup-nickname" label="닉네임" value={details.nickname} onChange={e => update('nickname', e.target.value)} autoComplete="nickname" maxLength={30} error={errors.nickname}>
            <Button className="nickname-check" onClick={() => setNicknameStatus(details.nickname.trim() ? '닉네임을 확인할 수 없습니다. 다시 시도해주세요.' : '먼저 닉네임을 입력해주세요.')}>중복확인</Button>
          </FormField>
          <p className="auth-status nickname-status" role="status">{nicknameStatus}</p>
          <FormField id="signup-password" label="비밀번호" type="password" value={details.password} onChange={e => update('password', e.target.value)} autoComplete="new-password" hint="5자리 이상 입력해주세요." error={errors.password}><img className="signup-lock" src={lock} alt="" /></FormField>
          <FormField id="signup-confirmation" label="비밀번호 확인" type="password" value={details.confirmation} onChange={e => update('confirmation', e.target.value)} autoComplete="new-password" error={errors.confirmation} />
          <div className="signup-school-row">
            <FormField id="signup-school" label="소속 학교" value={details.school} onChange={e => update('school', e.target.value)} autoComplete="organization" maxLength={80} error={errors.school} />
            <FormField id="signup-department" label="학과" value={details.department} onChange={e => update('department', e.target.value)} maxLength={80} error={errors.department} />
          </div>
          <Button type="submit">다음: 학습 성향 선택</Button>
        </form>
      ) : (
        <form className="signup-preferences" onSubmit={complete}>
          <PreferenceGroup title="시간 관리 방식" name="time" value={preferences.time} options={timeOptions} onChange={time => setPreferences(current => ({ ...current, time }))} />
          <PreferenceGroup title="학습 방식" name="study" value={preferences.study} options={studyOptions} onChange={study => setPreferences(current => ({ ...current, study }))} />
          <div className="signup-actions">
            <button className="signup-back" type="button" onClick={() => setStep('details')}>이전</button>
            <Button type="submit">입력 완료</Button>
          </div>
          <p className="field-hint">선택한 성향을 확인한 뒤 입력을 완료해주세요.</p>
        </form>
      )}
    </section>
  )
}
