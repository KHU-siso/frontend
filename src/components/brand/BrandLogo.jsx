import { Link } from 'react-router-dom'
import logo from '../../assets/moram/moram-logo.svg'
import mobileLogo from '../../assets/moram/mobile-moram-logo.svg'
import lightLogo from '../../assets/moram/moram-logo-light.svg'
import './BrandLogo.css'

// Public/auth screens omit `to`. App screens supply their home destination;
// this presentation option does not assert an authenticated server session.
export default function BrandLogo({ to = null }) {
  const artwork = (
    <>
      <picture className="brand-logo__dark">
        <source media="(max-width: 47.99rem)" srcSet={mobileLogo} />
        <img src={logo} alt="" width="452" height="122" />
      </picture>
      <img className="brand-logo__light" src={lightLogo} alt="" width="322" height="87" />
    </>
  )
  return to
    ? <Link className="brand-logo" to={to} aria-label="MORAM 대시보드">{artwork}</Link>
    : <span className="brand-logo" role="img" aria-label="MORAM">{artwork}</span>
}
