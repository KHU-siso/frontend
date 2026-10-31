import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import searchIcon from '../../assets/dashboard/dashboard-search.svg'
import { searchTargets } from '../../data/searchTargets.js'

// 상단 검색창: 입력하면 이동할 수 있는 페이지·내 과목을 드롭다운으로 보여 준다.
export default function GlobalSearch({ subjects, isOpen, onNavigate }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const listId = useId()
  const results = searchTargets(query, subjects)
  const showList = expanded && query.trim() !== ''
  useEffect(() => {
    const close = event => { if (!rootRef.current?.contains(event.target)) setExpanded(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  function go(target) {
    setQuery(''); setExpanded(false); setActive(0)
    onNavigate?.()
    navigate(target.to)
  }
  function onKeyDown(event) {
    if (event.key === 'Escape') { setExpanded(false); return }
    if (!results.length || event.nativeEvent.isComposing) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setExpanded(true); setActive(current => (current + 1) % results.length) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setExpanded(true); setActive(current => (current - 1 + results.length) % results.length) }
    else if (event.key === 'Enter' && showList) { event.preventDefault(); go(results[active] || results[0]) }
  }
  return (
    <form ref={rootRef} className={`app-search ${isOpen ? 'is-open' : ''}`} role="search" onSubmit={event => event.preventDefault()}>
      <img src={searchIcon} alt="" />
      <input type="text" role="combobox" aria-label="페이지·과목 검색" aria-expanded={showList} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={showList && results.length ? `${listId}-${active}` : undefined} autoComplete="off" placeholder="페이지나 과목 검색" value={query}
        onChange={event => { setQuery(event.target.value); setActive(0); setExpanded(true) }} onFocus={() => setExpanded(true)} onKeyDown={onKeyDown} />
      {showList && <ul className="app-search__results" id={listId} role="listbox" aria-label="검색 결과">
        {results.length ? results.map((target, index) => <li key={`${target.to}-${target.label}`} id={`${listId}-${index}`} role="option" aria-selected={index === active} className={index === active ? 'is-active' : ''} onMouseEnter={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => go(target)}>
          <span className="app-search__kind">{target.kind}</span><strong>{target.label}</strong>{target.detail && <small>{target.detail}</small>}
        </li>) : <li className="app-search__empty" role="presentation">검색 결과가 없어요</li>}
      </ul>}
    </form>
  )
}
