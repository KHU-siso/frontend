/* eslint-disable react-refresh/only-export-components -- Browser-only visual audit entry. */
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/latin-600.css'
import '@fontsource/noto-sans-kr/600.css'
import '../../src/index.css'
import OngAvatar from '../../src/components/brand/OngAvatar.jsx'
import { DemoContext } from '../../src/state/DemoContext.js'
import { itemCatalog, itemById, equippedWithItem } from '../../src/data/itemCatalog.js'

function Audit() {
  const [entries, setEntries] = useState([])
  useEffect(() => {
    window.showAudit = ids => setEntries(ids.map(id => ({ id, name: itemById[id].name, preview: itemById[id], equipment: {} })))
    window.showCombinations = combinations => setEntries(combinations.map(({ name, ids }, i) => ({ id: `combination-${i}`, name, equipment: ids.reduce((state, id) => equippedWithItem(state, itemById[id]), {}) })))
    return () => { delete window.showAudit; delete window.showCombinations }
  }, [])
  return <><style>{`body{background:#eef2f8;font-family:'Noto Sans KR',sans-serif} .audit-grid{display:grid;grid-template-columns:repeat(4,280px);gap:12px;padding:16px;width:max-content}.audit-card{margin:0;background:white;border-radius:12px;padding:10px;overflow:hidden}.audit-stage{width:260px;height:400px;display:grid;place-items:end center;padding-top:38px;background:#1e4275;border-radius:8px}.audit-stage .ong-avatar{width:240px;flex-shrink:0}figcaption{padding-top:8px;color:#123263;line-height:1.5;font-size:13px;max-width:260px}figcaption small{display:block;font:10px Inter,sans-serif;color:#647a96}`}</style><div className="audit-grid">{entries.map(entry => <figure className="audit-card" data-audit-id={entry.id} key={entry.id}><DemoContext.Provider value={{ state: { economy: { equippedItems: entry.equipment } } }}><div className="audit-stage"><OngAvatar previewItem={entry.preview} /></div></DemoContext.Provider><figcaption>{entry.name}<small>{entry.id}</small></figcaption></figure>)}</div></>
}
window.auditCatalog = itemCatalog.map(item => ({ id: item.id, name: item.name, slot: item.slot, price: item.price, placement: item.placement, ratio: item.ratio, files: item.layers.map(layer => layer.src) }))
createRoot(document.getElementById('root')).render(<Audit />)
