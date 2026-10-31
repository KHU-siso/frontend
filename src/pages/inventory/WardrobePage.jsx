import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import OngAvatar from '../../components/brand/OngAvatar.jsx'
import ItemArtwork from '../../components/brand/ItemArtwork.jsx'
import { equipmentOccupant, itemCatalog, itemById, itemCategories, slotNames } from '../../data/itemCatalog.js'
import { useDemo } from '../../state/DemoContext.js'
import './WardrobePage.css'

export default function WardrobePage() {
  const [params] = useSearchParams()
  const shop = params.get('tab') !== 'inventory'
  // Only the tab's preview/filter resets. Economy stays in the shared provider.
  return <WardrobeContent key={shop ? 'shop' : 'inventory'} shop={shop} />
}

function WardrobeContent({ shop }) {
  const { state, dispatch } = useDemo()
  const { coinBalance, ownedItemIds, equippedItems } = state.economy
  const [category, setCategory] = useState('전체')
  const [selectedId, setSelectedId] = useState(shop ? 'cream-scarf' : null)
  const [preview, setPreview] = useState(false)
  const selected = selectedId && itemById[selectedId]
  const visible = itemCatalog.filter(item => (shop || ownedItemIds.includes(item.id)) && (category === '전체' || item.category === category || item.tags?.includes(category)))
  const owned = selected && ownedItemIds.includes(selected.id)
  const isEquipped = item => item.id === 'color-white' ? !equippedItems.bodyColor : equippedItems[item.slot] === item.id
  const equipped = selected && isEquipped(selected)
  function pick(item) {
    setSelectedId(item.id)
    setPreview(item.available)
    dispatch({ type: 'CLEAR_TRANSACTION' })
  }
  function filter(value) {
    setCategory(value)
    setSelectedId(null)
    setPreview(false)
    dispatch({ type: 'CLEAR_TRANSACTION' })
  }
  return (
    <div className="wardrobe-page">
      <section className="wardrobe-preview" aria-labelledby="wardrobe-preview-title">
        <div className="wardrobe-preview__content">
          <div className="wardrobe-preview__heading"><h2 id="wardrobe-preview-title">나의 옹이</h2><span>{preview && selected ? `${selected.name} 미리보기` : '현재 착용 상태'}</span></div>
          <OngAvatar previewItem={preview ? selected : null} />
          <button className="service-plain-button" type="button" onClick={() => setPreview(false)}>현재 착용 모습 보기</button>
          <p>아이템을 골라 나만의 옹이를 꾸며보세요.</p>
        </div>
      </section>
      <section className="wardrobe-panel">
        <header><h1>코인샵</h1><strong className="wardrobe-balance" data-testid="coin-balance">{coinBalance} COIN</strong></header>
        <nav className="wardrobe-route-tabs" aria-label="코인샵 화면"><Link aria-current={shop ? 'page' : undefined} to="/shop">상점</Link><Link aria-current={!shop ? 'page' : undefined} to="/shop?tab=inventory">내 보관함 ({ownedItemIds.length})</Link></nav>
        <div className="wardrobe-categories" aria-label="아이템 카테고리">{itemCategories.map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => filter(value)}>{value}</button>)}</div>
        <p className="wardrobe-item-count">{shop ? `전체 ${itemCatalog.length}종 · 기본 흰색 무료 제공` : `보유 ${ownedItemIds.length}종`} · 현재 {visible.length}종 표시</p>
        {selected && <section className="wardrobe-selection" aria-labelledby="selected-item-title">
          <h2 id="selected-item-title">{selected.name}</h2>
          <p>{slotNames[selected.slot]} · {selected.defaultOwned ? '무료 · 기본 제공' : `${selected.price} COIN`}</p>
          {selected.combinationNote && <p className="service-muted">{selected.combinationNote}</p>}
          {equipmentOccupant(equippedItems, selected.slot)?.slot !== selected.slot && equipmentOccupant(equippedItems, selected.slot) && <p className="service-muted">착용하면 {equipmentOccupant(equippedItems, selected.slot).name} 전체가 해제됩니다.</p>}
          {!selected.available ? <><p className="service-error">{selected.unavailableReason}</p><Button disabled>판매 준비 중</Button></> : shop ? <Button disabled={owned} onClick={() => dispatch({ type: 'BUY', id: selected.id })}>{selected.defaultOwned ? '무료 · 기본 제공' : owned ? '구매 완료 · 보유 중' : '구매하기'}</Button> : <div className="service-action-row">
            <Button disabled={!owned || equipped} onClick={() => { dispatch({ type: 'EQUIP', id: selected.id }); setPreview(false) }}>{equipped ? '착용 중' : '착용하기'}</Button>
            <button className="service-plain-button" disabled={!equipped || selected.defaultOwned} type="button" onClick={() => { dispatch({ type: 'UNEQUIP', slot: selected.slot }); setPreview(false) }}>해제하기</button>
          </div>}
          {((selected.slot === 'outfit' && equippedItems.bodyDecoration) || (selected.slot === 'bodyDecoration' && equippedItems.outfit)) && <p className="service-muted">의상과 몸체 단추 장식은 함께 착용할 수 없습니다. 착용하면 기존 항목이 해제됩니다.</p>}
          {state.transaction?.id === selected.id && <p role="status" className={state.transaction.ok ? 'service-muted' : 'service-error'}>{state.transaction.message}</p>}
          {shop && owned && <Link className="wardrobe-to-inventory" to="/shop?tab=inventory">보관함에서 착용하기 →</Link>}
        </section>}
        <div className="wardrobe-items">{visible.map(item => <button type="button" className={`wardrobe-item ${selectedId === item.id ? 'is-selected' : ''}`} data-product-id={item.id} key={item.id} aria-pressed={selectedId === item.id} onClick={() => pick(item)}>
          <div className="wardrobe-thumbnail"><ItemArtwork item={item} /></div><strong>{item.name}</strong>
          <span>{!item.available ? '판매 준비 중' : item.defaultOwned ? '기본 제공' : isEquipped(item) ? '착용 중' : ownedItemIds.includes(item.id) ? '보유 중' : `${item.price} COIN`}</span>
        </button>)}</div>
        {!visible.length && <p className="wardrobe-empty">{shop ? '이 카테고리의 아이템은 준비 중입니다.' : '보유한 아이템이 없습니다. 상점에서 구매해보세요.'}</p>}
        <section className="wardrobe-equipped"><h2>현재 착용 중</h2><ul>{Object.entries(slotNames).map(([slot, label]) => {
          const occupant = equipmentOccupant(equippedItems, slot)
          return <li key={slot}><span>{label}</span><strong>{occupant ? `${occupant.name}${occupant.slot !== slot ? '에 포함' : ''}` : slot === 'bodyColor' ? '기본 흰색' : '기본 모습'}</strong>{equippedItems[slot] && <button type="button" aria-label={`${label} 해제`} onClick={() => { dispatch({ type: 'UNEQUIP', slot }); setPreview(false) }}>해제</button>}</li>
        })}</ul><button className="service-plain-button" disabled={!Object.keys(equippedItems).length} type="button" onClick={() => { dispatch({ type: 'UNEQUIP_ALL' }); setPreview(false) }}>모두 해제</button></section>

        {state.storageFailed && <p className="service-error" role="alert">서버와 통신하지 못했습니다. 변경 내용이 저장되지 않았을 수 있습니다.</p>}
      </section>
    </div>
  )
}
