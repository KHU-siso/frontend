import loginSymbol from '../../assets/auth/login-ong-symbol.svg'
import loginEye from '../../assets/auth/login-ong-eye.svg'
import completeOng from '../../assets/auth/signup-ong-complete.svg'
import completeCheck from '../../assets/auth/signup-check-complete.svg'
import edit from '../../assets/auth/signup-edit.svg'
import mutedCheck from '../../assets/auth/signup-check-muted.svg'

export function LoginSymbol() {
  return (
    <div className="login-symbol" role="img" aria-label="모람 옹이">
      <img className="login-symbol__base" src={loginSymbol} alt="" />
      <img className="login-symbol__eye login-symbol__eye--left" src={loginEye} alt="" />
      <img className="login-symbol__eye login-symbol__eye--right" src={loginEye} alt="" />
    </div>
  )
}

export function SignupProgress({ complete = false }) {
  return (
    <ol className="signup-progress" aria-label="회원가입 진행 단계">
      <li aria-current={complete ? undefined : 'step'}><img src={edit} alt="" /><span>정보입력</span></li>
      <li aria-hidden="true" className="signup-progress__dots">···</li>
      <li aria-current={complete ? 'step' : undefined}><img src={complete ? completeCheck : mutedCheck} alt="" /><span>가입완료</span></li>
    </ol>
  )
}

export function SignupCompleteArtwork() {
  return (
    <picture className="signup-complete-art">
      <source media="(max-width: 47.99rem)" srcSet={completeCheck} />
      <img src={completeOng} alt="회원가입 화면 완료 표시" />
    </picture>
  )
}
