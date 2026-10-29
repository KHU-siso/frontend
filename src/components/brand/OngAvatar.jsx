import head from '../../assets/dashboard/dashboard-ong-head.svg'
import body from '../../assets/dashboard/dashboard-ong-body.svg'
import leftEye from '../../assets/dashboard/dashboard-ong-eye-left.svg'
import rightEye from '../../assets/dashboard/dashboard-ong-eye-right.svg'
import shadow from '../../assets/dashboard/dashboard-ong-shadow.svg'
import { equippedWithItem, itemById, slotOrder } from '../../data/itemCatalog.js'
import { useDemo } from '../../state/DemoContext.js'
import ItemArtwork from './ItemArtwork.jsx'
import './OngAvatar.css'

export default function OngAvatar({ previewItem = null, className = '' }) {
  const { state } = useDemo()
  const equipped = previewItem ? equippedWithItem(state.economy.equippedItems, previewItem) : state.economy.equippedItems
  const items = Object.values(equipped).map(id => itemById[id]).filter(Boolean)
  const color = items.find(item => item.slot === 'bodyColor')
  const eyeStyle = items.some(item => item.eyesAbove) ? { zIndex: 70 } : undefined
  const partStyle = (placement, zIndex) => ({ left: `${placement.left}%`, top: `${placement.top}%`, width: `${placement.width}%`, zIndex })
  const placementFor = item => items.reduce((placement, other) => ({ ...placement, ...other.attachmentAnchors?.[item.slot] }), item.placement)
  const renderItem = item => item.renderParts
    ? <div key={item.id} className="ong-avatar__wearable ong-avatar__wearable--split" data-item-id={item.id} data-slot={item.slot}>{item.renderParts.map((part, i) => <div key={i} className="ong-avatar__wearable-part" data-render-plane={part.zIndex < 20 ? 'behind-body' : 'front'} style={partStyle(part.placement, part.zIndex)}><ItemArtwork item={item} layerIndex={part.layer} ratio={part.ratio} /></div>)}</div>
    : <div key={item.id} className="ong-avatar__wearable" data-item-id={item.id} data-slot={item.slot} style={partStyle(placementFor(item), slotOrder[item.slot])}><ItemArtwork item={item} /></div>
  return <div className={`ong-avatar ${className}`} role="img" aria-label={`옹이 ${items.length ? items.map(item => item.name).join(', ') + (previewItem ? ' 미리보기' : ' 착용') : '기본 모습, 착용 아이템 없음'}`}>
    <img className="ong-avatar__shadow" src={shadow} alt="" />
    <img className="ong-avatar__head" src={head} alt="" />
    <img className="ong-avatar__body" src={body} alt="" />
    {color && <>
      <span className="ong-avatar__color-layer ong-avatar__color-head" data-color-item={color.id} style={{ maskImage: `url("${head}")` }}><img src={color.colorSources.head} alt="" /></span>
      <span className="ong-avatar__color-layer ong-avatar__color-body" data-color-item={color.id} style={{ maskImage: `url("${body}")` }}><img src={color.colorSources.body} alt="" /></span>
    </>}
    <img className="ong-avatar__eye-left" src={leftEye} style={eyeStyle} alt="" />
    <img className="ong-avatar__eye-right" src={rightEye} style={eyeStyle} alt="" />
    {items.filter(item => item.slot !== 'bodyColor').map(renderItem)}
  </div>
}
