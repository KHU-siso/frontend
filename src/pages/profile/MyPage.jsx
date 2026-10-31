import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import FormField from '../../components/common/FormField.jsx'
import Modal from '../../components/common/Modal.jsx'
import { OngPeek, PageTitle } from '../../components/service/ServiceUI.jsx'
import { useSubjects } from '../../state/SubjectsContext.js'
import { useDemo } from '../../state/DemoContext.js'
import { useAuth } from '../../state/AuthContext.js'
import { changePassword } from '../../services/api.js'
import SemesterSelect from '../../components/subjects/SemesterSelect.jsx'
import { semesterLabel } from '../../data/subjectDates.js'
import './MyPage.css'

function ProfileEditor({ profile, onSave, onClose }) {
  const [values, setValues] = useState(profile)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (!values.nickname.trim()) return setError('이름을 입력해주세요.')
    try { await onSave({ nickname: values.nickname.trim(), email: values.email.trim(), department: values.department.trim(), year: values.year }) } catch (failure) { setError(failure.message) }
  }
  const update = key => event => setValues(current => ({ ...current, [key]: event.target.value }))
  return <Modal title="프로필 수정" onClose={onClose}><form className="service-form profile-editor" onSubmit={submit}><FormField id="profile-nickname" label="이름" value={values.nickname} onChange={update('nickname')} required maxLength={30} /><FormField id="profile-email" label="이메일" value={values.email} type="email" readOnly hint="이메일은 변경할 수 없습니다." /><FormField id="profile-department" label="학과" value={values.department} onChange={update('department')} maxLength={80} /><label className="service-field">학년<select value={values.year} onChange={update('year')}>{['1학년', '2학년', '3학년', '4학년', '기타'].map(year => <option key={year}>{year}</option>)}</select></label>{error && <p className="service-error" role="alert">{error}</p>}<Button type="submit">프로필 저장</Button></form></Modal>
}

function PasswordModal({ onClose, onDone }) {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = key => event => setValues(current => ({ ...current, [key]: event.target.value }))
  async function submit(event) {
    event.preventDefault()
    if (values.next.length < 5) return setError('새 비밀번호를 5자리 이상 입력해주세요.')
    if (values.next !== values.confirm) return setError('새 비밀번호가 일치하지 않습니다.')
    setBusy(true); setError('')
    try { await changePassword(values.current, values.next); onDone() }
    catch (failure) { setError(failure.message); setBusy(false) }
  }
  return <Modal title="비밀번호 변경" onClose={onClose}><form className="service-form" onSubmit={submit}>
    <FormField id="pw-current" label="현재 비밀번호" type="password" value={values.current} onChange={update('current')} autoComplete="current-password" required />
    <FormField id="pw-next" label="새 비밀번호" type="password" value={values.next} onChange={update('next')} autoComplete="new-password" hint="5자리 이상" required />
    <FormField id="pw-confirm" label="새 비밀번호 확인" type="password" value={values.confirm} onChange={update('confirm')} autoComplete="new-password" required />
    {error && <p className="service-error" role="alert">{error}</p>}
    <Button type="submit" disabled={busy}>{busy ? '변경 중…' : '비밀번호 변경'}</Button>
  </form></Modal>
}

export default function MyPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { data: subjectData, semester, error: subjectError } = useSubjects()
  const courses = subjectData.subjects.filter(course => semester === 'all' || course.semester === semester)
  const { state, dispatch } = useDemo()
  const [modal, setModal] = useState(null)
  const [goal, setGoal] = useState(state.profile.goalMinutes)
  const [notice, setNotice] = useState('')
  const settings = [['deadline', '과제 마감 알림', '마감 24시간 전에 이메일로 알려드릴게요.'], ['study', '학습 시간 알림', '설정한 학습 목표 시간에 알림을 보내드려요.'], ['materials', '새로운 학습 자료 알림', '새 강의 자료가 업로드되면 알려드릴게요.']]
  return <div className="service-page mypage">
    <PageTitle title="마이페이지" description="계정 정보와 학습 설정을 관리하세요." />
    <section className="service-card profile-card"><OngPeek /><div className="profile-initial" aria-hidden="true">{state.profile.nickname.slice(0, 1)}</div><div><h2>{state.profile.nickname}</h2><p>{state.profile.email}</p><span className="service-badge">{state.profile.department || '학과 미설정'}</span> <span className="service-badge">{state.profile.year}</span></div><button className="service-plain-button" type="button" onClick={() => setModal('profile')}>프로필 수정</button></section>
    <h2 className="profile-section-title">나의 학습 정보</h2><section className="service-card"><div className="profile-learning-row"><h3 id="profile-subjects-title">현재 학습 과목</h3><div className="profile-subjects" aria-labelledby="profile-subjects-title">
      <SemesterSelect className="profile-semester-field" />
      {subjectError && <p className="service-error" role="alert">{subjectError}</p>}
      {courses.length ? <div className="profile-subject-list">{courses.map(course => <Link className="profile-subject-card" key={course.id} to={`/materials/${course.id}`}><span><strong>{course.name}</strong><small>{semesterLabel(course.semester)} · {course.teacher}</small></span><span className="profile-subject-arrow" aria-hidden="true">→</span></Link>)}</div> : <div className="profile-subject-empty"><p>등록된 과목이 없습니다</p><Link className="service-plain-button" to="/materials">과목 추가하기</Link></div>}
    </div></div><div className="profile-learning-row"><h3>학습 목표</h3><div className="profile-learning-goal"><p>하루 {state.profile.goalMinutes}분 학습</p><button className="service-plain-button" type="button" onClick={() => { setGoal(state.profile.goalMinutes); setModal('goal') }}>학습 목표 수정</button></div></div></section>
    <h2 className="profile-section-title">이메일 알림 설정</h2><section className="service-card profile-settings">{settings.map(([key, title, description]) => <label className="profile-setting" key={key}><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" role="switch" aria-label={title} checked={state.notifications[key]} onChange={event => dispatch({ type: 'NOTIFICATION', key, value: event.target.checked })} /></label>)}</section>
    <h2 className="profile-section-title" id="account-settings">계정 설정</h2><section className="service-card profile-account"><button type="button" onClick={() => setModal('password')}>비밀번호 변경 <span aria-hidden="true">›</span></button><button type="button" onClick={() => { logout(); navigate('/login') }}>로그아웃 <span aria-hidden="true">›</span></button></section>

    {notice && <p role="status" className="service-muted">{notice}</p>}
    {modal === 'profile' && <ProfileEditor profile={state.profile} onClose={() => setModal(null)} onSave={async values => { const { email: _email, ...rest } = values; await dispatch({ type: 'PROFILE', values: rest }); setModal(null); setNotice('프로필을 변경했습니다.') }} />}
    {modal === 'goal' && <Modal title="학습 목표 수정" onClose={() => setModal(null)}><form className="service-form" onSubmit={event => { event.preventDefault(); dispatch({ type: 'PROFILE', values: { goalMinutes: Number(goal) } }); setModal(null); setNotice('학습 목표를 변경했습니다.') }}><label className="service-field">하루 학습 시간 (분)<input type="number" required min="5" max="480" value={goal} onChange={event => setGoal(event.target.value)} /></label><Button type="submit">목표 저장</Button></form></Modal>}
    {modal === 'password' && <PasswordModal onClose={() => setModal(null)} onDone={() => { setModal(null); setNotice('비밀번호를 변경했습니다.') }} />}
  </div>
}
