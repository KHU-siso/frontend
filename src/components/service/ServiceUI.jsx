import { Link } from 'react-router-dom'
import head from '../../assets/dashboard/dashboard-ong-head.svg'
import leftEye from '../../assets/dashboard/dashboard-ong-eye-left.svg'
import rightEye from '../../assets/dashboard/dashboard-ong-eye-right.svg'
import circle from '../../assets/auth/login-background-large.svg'
import smallCircle from '../../assets/auth/login-background-small.svg'
import '../../styles/service.css'

export function PageTitle({ title, description, children }) { return <header className="service-title"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</header> }
export function EmptyState({ title, children, to = '/dashboard', linkLabel = '대시보드로' }) { return <section className="service-empty"><h2>{title}</h2>{children && <p>{children}</p>}<Link to={to}>{linkLabel}</Link></section> }
export function OngPeek({ className = '' }) { return <div className={`ong-peek ${className}`} role="img" aria-label="모람 옹이"><img src={head} alt="" /><img className="ong-peek__left" src={leftEye} alt="" /><img className="ong-peek__right" src={rightEye} alt="" /></div> }
export function LearningBackground() { return <div className="learning-background" aria-hidden="true"><img src={circle} alt="" /><img src={smallCircle} alt="" /></div> }
