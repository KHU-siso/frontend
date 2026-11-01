import { useState } from 'react'
import Button from './Button.jsx'
import { PROVIDERS } from './aiKey.js'
import { clearAiKey, saveAiKey } from '../../services/api.js'
import './AiKeyPanel.css'

// 사용자 본인의 AI API 키 입력 패널 (Claude/GPT 선택, 발급 링크, 키 입력·저장). 키는 이 브라우저(localStorage)에만 저장한다.
// savedProvider: 이미 저장된 키의 종류(없으면 null). 있으면 취소·키 삭제 버튼을 보여준다.
// onSaved(provider) / onRemoved() / onCancel(): 부모 상태 갱신용. onError(message): 입력·저장 오류 표시용.
export default function AiKeyPanel({ savedProvider = null, onSaved, onRemoved, onCancel, onError }) {
  const [pickProvider, setPickProvider] = useState('claude')
  const [keyDraft, setKeyDraft] = useState('')

  function saveKey(event) {
    event.preventDefault()
    const key = keyDraft.trim()
    if (!key || !saveAiKey(pickProvider, key)) return onError?.(key ? '이 브라우저에 키를 저장할 수 없어요. 브라우저 저장소 설정을 확인해주세요.' : 'API 키를 입력해주세요.')
    setKeyDraft('')
    onSaved?.(pickProvider)
  }
  function removeKey() { clearAiKey(); setKeyDraft(''); onRemoved?.() }

  return (
    <form className="ai-key" onSubmit={saveKey}>
      <h3>API 키를 발급받아 입력해주세요</h3>
      <div className="ai-key__providers" role="radiogroup" aria-label="AI 선택">
        {Object.entries(PROVIDERS).map(([key, item]) => <button key={key} type="button" role="radio" aria-checked={pickProvider === key} className={pickProvider === key ? 'is-active' : ''} onClick={() => setPickProvider(key)}>{item.label}</button>)}
      </div>
      <a className="ai-key__link" href={PROVIDERS[pickProvider].url} target="_blank" rel="noopener noreferrer">{PROVIDERS[pickProvider].label} API 키 발급받기</a>
      <p className="ai-key__note">키 발급 후 크레딧 충전이 필요할 수 있어요.</p>
      <div className="ai-key__row">
        <input type="password" autoComplete="off" spellCheck="false" aria-label="API 키" placeholder="발급받은 API 키를 붙여넣어 주세요" value={keyDraft} onChange={event => setKeyDraft(event.target.value)} />
        <Button type="submit" disabled={!keyDraft.trim()}>저장</Button>
      </div>
      <p className="ai-key__note">내 키는 이 브라우저에만 저장되고 요청할 때만 서버를 거쳐 AI 회사로 전달돼요.{savedProvider && <> <button type="button" onClick={() => { setKeyDraft(''); onCancel?.() }}>취소</button> <button type="button" onClick={removeKey}>키 삭제</button></>}</p>
    </form>
  )
}

// "OOO 키를 사용 중이에요" 한 줄 안내 + 키 변경/삭제 버튼.
export function AiKeyInUse({ provider, onChange, onRemove }) {
  return (
    <p className="ai-key__note ai-key__note--inuse">{PROVIDERS[provider].label} 키를 사용 중이에요. 내 키는 이 브라우저에만 저장되고 요청할 때만 서버를 거쳐 AI 회사로 전달돼요. <button type="button" onClick={onChange}>키 변경</button> <button type="button" onClick={() => { clearAiKey(); onRemove?.() }}>키 삭제</button></p>
  )
}
