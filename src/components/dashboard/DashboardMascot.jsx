import { Link } from 'react-router-dom'
import OngAvatar from '../brand/OngAvatar.jsx'
import background from '../../assets/dashboard/dashboard-mascot-background.svg'
import homeRoof from '../../assets/dashboard/dashboard-home-roof.svg'
import homeDoor from '../../assets/dashboard/dashboard-home-door.svg'

export default function DashboardMascot() {
  return (
    <figure className="dashboard-mascot">
      <img className="dashboard-mascot__background" src={background} alt="" />
      <Link className="dashboard-mascot__home" to="/shop?tab=inventory" aria-label="아이템 보관함으로 이동" title="아이템 보관함"><img src={homeRoof} alt="" /><img src={homeDoor} alt="" /></Link>
      <OngAvatar className="standing-ong" />
      <figcaption className="sr-only">조금씩 꾸준하게, MORAM과 함께해요.</figcaption>
    </figure>
  )
}
