import small from '../../assets/reward/coin-ong-small.svg'
import smallEye from '../../assets/reward/coin-ong-small-eye.svg'
import body from '../../assets/reward/coin-ong-body.svg'
import leftEye from '../../assets/reward/coin-ong-eye-left.svg'
import rightEye from '../../assets/reward/coin-ong-eye-right.svg'
import currency from '../../assets/reward/coin-ong-currency.png'

// Figma 528:7/10, 770:9, 529:73/76/77/78, including the exported glow.
// The composition spans x=2608..3464, y=604..1676.171 in the source frame.
export default function CoinOng() {
  return <div className="coin-ong" role="img" aria-label="머리 위 작은 금색 옹이와 코인 옹이">
    <img className="coin-ong__small" src={small} alt="" />
    <img className="coin-ong__small-eye coin-ong__small-eye--left" src={smallEye} alt="" />
    <img className="coin-ong__small-eye coin-ong__small-eye--right" src={smallEye} alt="" />
    <img className="coin-ong__body" src={body} alt="" />
    <img className="coin-ong__eye coin-ong__eye--left" src={leftEye} alt="" />
    <img className="coin-ong__eye coin-ong__eye--right" src={rightEye} alt="" />
    <img className="coin-ong__currency" src={currency} alt="" />
  </div>
}
