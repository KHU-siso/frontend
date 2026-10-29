import ground from '../../assets/moram/hero-ground-shadow.svg'
import nearStep from '../../assets/moram/hero-step-near.svg'
import farStep from '../../assets/moram/hero-step-far.svg'
import head from '../../assets/moram/ong-head.svg'
import backFoot from '../../assets/moram/ong-back-foot.svg'
import body from '../../assets/moram/ong-body.svg'
import eye from '../../assets/moram/ong-eye.svg'
import frontFoot from '../../assets/moram/ong-front-foot.svg'
import mobileGround from '../../assets/moram/mobile-ground-shadow.svg'
import mobileNearStep from '../../assets/moram/mobile-step-near.svg'
import mobileFarStep from '../../assets/moram/mobile-step-far.svg'
import mobileHead from '../../assets/moram/mobile-ong-head.svg'
import mobileBackFoot from '../../assets/moram/mobile-ong-back-foot.svg'
import mobileBody from '../../assets/moram/mobile-ong-body.svg'
import mobileEye from '../../assets/moram/mobile-ong-eye.svg'
import mobileFrontFoot from '../../assets/moram/mobile-ong-front-foot.svg'

// Percentage slots preserve illustration geometry, not a scaled page canvas.
const layers = [
  ['ground', ground, mobileGround],
  ['head', head, mobileHead],
  ['back-foot', backFoot, mobileBackFoot],
  ['body', body, mobileBody],
  ['eye-left', eye, mobileEye],
  ['eye-right', eye, mobileEye],
  ['front-foot', frontFoot, mobileFrontFoot],
  ['step-near', nearStep, mobileNearStep],
  ['step-far', farStep, mobileFarStep],
]

export default function OngIllustration() {
  return (
    <div className="ong-illustration" role="img" aria-label="흰 몸과 검은 발을 가진 모람 캐릭터 옹이">
      {layers.map(([name, desktop, mobile]) => (
        <picture key={name} className={`ong-layer ong-layer--${name}`}>
          <source media="(max-width: 47.99rem)" srcSet={mobile} />
          <img src={desktop} alt="" />
        </picture>
      ))}
    </div>
  )
}
