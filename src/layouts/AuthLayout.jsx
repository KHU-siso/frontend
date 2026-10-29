import { Link, Outlet, useLocation } from 'react-router-dom'
import BrandLogo from '../components/brand/BrandLogo.jsx'
import loginLarge from '../assets/auth/login-background-large.svg'
import loginMedium from '../assets/auth/login-background-medium.svg'
import loginSmall from '../assets/auth/login-background-small.svg'
import signupLarge from '../assets/auth/signup-background-large.svg'
import signupTop from '../assets/auth/signup-background-top.svg'
import signupSmall from '../assets/auth/signup-background-small.svg'
import './AuthLayout.css'

export default function AuthLayout() {
  const signup = useLocation().pathname.startsWith('/signup')
  return (
    <div className={`auth-shell auth-shell--${signup ? 'signup' : 'login'}`}>
      <div className="auth-background" aria-hidden="true">
        <img className="auth-background__top" src={signup ? signupTop : loginLarge} alt="" />
        <img className="auth-background__right" src={signup ? signupSmall : loginMedium} alt="" />
        <img className="auth-background__bottom" src={signup ? signupLarge : loginMedium} alt="" />
        <img className="auth-background__small" src={signup ? signupLarge : loginSmall} alt="" />
      </div>
      <a className="skip-link" href="#auth-content">본문으로 건너뛰기</a>
      <header className="auth-header">
        <BrandLogo />
        {!signup && <p>계정이 없으신가요? <Link to="/signup">회원가입</Link></p>}
      </header>
      <main className="auth-main" id="auth-content"><Outlet /></main>
    </div>
  )
}
