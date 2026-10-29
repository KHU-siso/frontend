import ring from '../../assets/navigation/ring.svg'
import pencil from '../../assets/navigation/pencil.svg'
import pencilTip from '../../assets/navigation/pencil-tip.svg'
import coinLine from '../../assets/navigation/coin-line.svg'
import materialLine from '../../assets/navigation/material-line.svg'
import door from '../../assets/navigation/door.svg'
import logoutArrow from '../../assets/navigation/logout-arrow.svg'
import gear from '../../assets/navigation/gear.svg'
import gearCenter from '../../assets/navigation/gear-center.svg'
import aiChat from '../../assets/navigation/ai-chat.svg'

// Figma 683:464 uses separate vectors and text for these icons.
export default function NavigationIcon({ name }) {
  return <span className={`navigation-icon navigation-icon--${name}`} aria-hidden="true">
    {name === 'dashboard' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" /></svg>}
    {name === 'quiz' && <><img src={ring} alt="" /><span>?</span></>}
    {name === 'review' && <><img src={pencil} alt="" /><img className="navigation-icon__pencil-tip" src={pencilTip} alt="" /></>}
    {name === 'materials' && <span className="navigation-icon__document"><img src={materialLine} alt="" /><img src={materialLine} alt="" /></span>}
    {name === 'shop' && <><img src={ring} alt="" /><span>S</span><img className="navigation-icon__coin-line" src={coinLine} alt="" /></>}
    {name === 'chat' && <img src={aiChat} alt="" />}
    {name === 'profile' && <span>M</span>}
    {name === 'settings' && <><img src={gear} alt="" /><img className="navigation-icon__gear-center" src={gearCenter} alt="" /></>}
    {name === 'logout' && <><img className="navigation-icon__door" src={door} alt="" /><img className="navigation-icon__logout-arrow" src={logoutArrow} alt="" /></>}
  </span>
}
