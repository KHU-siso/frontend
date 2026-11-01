import { NavLink } from 'react-router-dom'
import BrandLogo from '../brand/BrandLogo.jsx'

const secondaryLinks = [
  ['/support', '고객센터'],
  ['/faq', '자주 묻는 질문(FAQ)'],
]

export default function PublicHeader() {
  return (
    <header className="public-header">
      <BrandLogo to="/dashboard" />
      <nav className="public-header__navigation" aria-label="주 메뉴">
        <NavLink to="/about">소개</NavLink>
        {secondaryLinks.map(([to, label]) => (
          <NavLink key={to} className="public-header__secondary" to={to}>{label}</NavLink>
        ))}
      </nav>
      <nav className="public-header__account" aria-label="계정 메뉴">
        <NavLink to="/login">로그인</NavLink>
        <NavLink to="/signup">회원가입</NavLink>
      </nav>
    </header>
  )
}
