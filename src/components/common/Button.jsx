import { Link } from 'react-router-dom'
import './Button.css'

export default function Button({ to, className = '', children, type = 'button', ...props }) {
  const classes = `button ${className}`.trim()
  if (to) return <Link className={classes} to={to} {...props}>{children}</Link>
  return <button className={classes} type={type} {...props}>{children}</button>
}
