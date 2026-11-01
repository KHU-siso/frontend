import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Button from '../common/Button.jsx'
import { clearAiKey, getAiKey, listMessages, listSubjectChats, openSubjectChat, saveAiKey, sendMessage } from '../../services/api.js'
import { useSubjects } from '../../state/SubjectsContext.js'

const PROVIDERS = {
  claude: { label: 'Claude (Anthropic)', url: 'https://console.anthropic.com/settings/keys' },
  openai: { label: 'GPT (OpenAI)', url: 'https://platform.openai.com/api-keys' },
}
// 서버가 돌려주는 error_code → 쉬운 안내 문구. (서버 메시지 대신 쓰므로 키 관련 내용이 화면에 섞일 일이 없다.)
const AI_ERRORS = {
  AI_KEY_INVALID: '키를 확인해주세요. 입력한 API 키가 올바르지 않거나 만료됐어요.',
  AI_QUOTA_EXCEEDED: '사용 한도를 확인해주세요. 잔액이 부족하거나 요청 한도를 넘었어요.',
  AI_MODEL_ERROR: 'AI 모델을 사용할 수 없어요. 잠시 후 다시 시도해주세요.',
  AI_UNAVAILABLE: 'AI 응답을 일시적으로 만들 수 없어요. 잠시 후 다시 시도해주세요.',
}

// 과목 홈의 전용 AI 채팅. 대화 기록은 과목별로 서버에 저장되고, 답변은 이 과목에 올린 PDF 자료와 직접 쓴 학습 노트를 참고한다.
export default function SubjectChat({ subject }) {
  const { materials, data } = useSubjects()
  const { hash } = useLocation()
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [aiProvider, setAiProvider] = useState(() => getAiKey()?.provider ?? null)
  const [editingKey, setEditingKey] = useState(false)
  const [pickProvider, setPickProvider] = useState('claude')
  const [keyDraft, setKeyDraft] = useState('')
  const inputRef = useRef(null)
  const logRef = useRef(null)
  // 서버가 검색할 수 있는 자료는 업로드된 PDF뿐이다.
  const searchable = materials.filter(item => item.subjectId === subject.id && item.server).length
  // 같은 과목에 직접 쓴 학습 노트(본문이 있는 것)도 서버가 채팅 근거로 함께 쓴다.
  const noteCount = data.notes.filter(item => item.subjectId === subject.id && item.body?.trim()).length
  const basis = searchable && noteCount ? `이 과목에 올린 자료 ${searchable}개와 내 노트 ${noteCount}개를 바탕으로 답해요.` : searchable ? `이 과목에 올린 자료 ${searchable}개를 바탕으로 답해요.` : noteCount ? `내 노트 ${noteCount}개를 바탕으로 답해요. 강의자료 PDF를 올리면 자료도 함께 참고해요.` : '이 과목에 올린 PDF 자료와 노트가 없어 일반적인 지식으로 답해요. 강의자료를 올리거나 노트를 쓰면 그 내용을 바탕으로 답해요.'

  useEffect(() => {
    let active = true
    listSubjectChats().then(async chats => {
      const found = chats.find(chat => chat.subject_ref === subject.id)
      if (!found) return active && setLoading(false)
      const history = await listMessages(found.conversation_id)
      if (active) { setConversationId(found.conversation_id); setMessages(history); setLoading(false) }
    }).catch(failure => { if (active) { setError(failure.message); setLoading(false) } })
    return () => { active = false }
  }, [subject.id])
  // 빠른 실행·AI 채팅 메뉴에서 #chat으로 들어오면 입력창에 바로 포커스를 준다. (스크롤은 과목 홈이 처리)
  useEffect(() => { if (hash === '#chat' && !loading && aiProvider && !editingKey) inputRef.current?.focus({ preventScroll: true }) }, [hash, loading, aiProvider, editingKey])
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [messages, sending])

  function saveKey(event) {
    event.preventDefault()
    const key = keyDraft.trim()
    if (!key || !saveAiKey(pickProvider, key)) return setError(key ? '이 브라우저에 키를 저장할 수 없어요. 브라우저 저장소 설정을 확인해주세요.' : 'API 키를 입력해주세요.')
    setAiProvider(pickProvider); setKeyDraft(''); setEditingKey(false); setError('')
  }
  function removeKey() { clearAiKey(); setAiProvider(null); setKeyDraft(''); setEditingKey(false); setError('') }

  async function send(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sending) return
    setSending(true); setError('')
    try {
      let id = conversationId
      if (!id) { id = (await openSubjectChat(subject.id, `${subject.name} 채팅`)).id; setConversationId(id) }
      const localId = `local-${Date.now()}`
      setMessages(current => [...current, { id: localId, role: 'user', content: text }])
      setDraft('')
      try {
        const reply = await sendMessage(id, text)
        setMessages(current => [...current, reply])
      } catch (failure) {
        // 서버는 실패한 질문을 저장하지 않으므로 화면에서도 되돌리고 입력창에 다시 채운다.
        setMessages(current => current.filter(message => message.id !== localId))
        setDraft(text)
        throw failure
      }
    } catch (failure) {
      if (failure.code === 'AI_KEY_REQUIRED') { clearAiKey(); setAiProvider(null); setError('API 키를 입력해주세요.') }
      else setError(AI_ERRORS[failure.code] ?? failure.message)
    }
    finally { setSending(false) }
  }

  return (
    <section className="subject-chat" id="chat" aria-labelledby="subject-chat-heading">
      <header><h2 id="subject-chat-heading">모르는 것을 물어보세요! 옹이 AI가 도와드립니다~</h2><p>{basis}</p></header>
      <div className="subject-chat__log" ref={logRef} role="log" aria-live="polite" aria-label={`${subject.name} 대화 내용`}>
        {loading ? <p className="subject-chat__empty">대화를 불러오는 중…</p> : !messages.length && <p className="subject-chat__empty">{subject.name}에 대해 궁금한 점을 물어보세요.</p>}
        {messages.map(message => <article key={message.id} className={`subject-chat__message subject-chat__message--${message.role}`}><strong>{message.role === 'user' ? '나' : '옹이'}</strong><p>{message.content}</p></article>)}
        {sending && <article className="subject-chat__message subject-chat__message--assistant"><strong>옹이</strong><p>답변을 작성하는 중…</p></article>}
      </div>
      {error && <p className="service-error" role="alert">{error}</p>}
      {aiProvider && !editingKey ? <>
        <form className="subject-chat__form" onSubmit={send}>
          <input ref={inputRef} aria-label={`${subject.name} AI 채팅 메시지`} placeholder="옹이에게 물어보세요!" value={draft} maxLength={2000} onChange={event => setDraft(event.target.value)} />
          <Button type="submit" disabled={!draft.trim() || sending}>{sending ? '전송 중…' : '보내기'}</Button>
        </form>
        <p className="subject-chat__keynote">{PROVIDERS[aiProvider].label} 키를 사용 중이에요. 내 키는 이 브라우저에만 저장되고 요청할 때만 서버를 거쳐 AI 회사로 전달돼요. <button type="button" onClick={() => setEditingKey(true)}>키 변경</button> <button type="button" onClick={removeKey}>키 삭제</button></p>
      </> : (
        <form className="subject-chat__keypanel" onSubmit={saveKey}>
          <h3>API 키를 발급받아 입력해주세요</h3>
          <div className="subject-chat__providers" role="radiogroup" aria-label="AI 선택">
            {Object.entries(PROVIDERS).map(([key, item]) => <button key={key} type="button" role="radio" aria-checked={pickProvider === key} className={pickProvider === key ? 'is-active' : ''} onClick={() => setPickProvider(key)}>{item.label}</button>)}
          </div>
          <a className="subject-chat__keylink" href={PROVIDERS[pickProvider].url} target="_blank" rel="noopener noreferrer">{PROVIDERS[pickProvider].label} API 키 발급받기</a>
          <p className="subject-chat__keynote">키 발급 후 크레딧 충전이 필요할 수 있어요.</p>
          <div className="subject-chat__keyrow">
            <input type="password" autoComplete="off" spellCheck="false" aria-label="API 키" placeholder="발급받은 API 키를 붙여넣어 주세요" value={keyDraft} onChange={event => setKeyDraft(event.target.value)} />
            <Button type="submit" disabled={!keyDraft.trim()}>저장</Button>
          </div>
          <p className="subject-chat__keynote">내 키는 이 브라우저에만 저장되고 요청할 때만 서버를 거쳐 AI 회사로 전달돼요.{aiProvider && <> <button type="button" onClick={() => { setEditingKey(false); setKeyDraft('') }}>취소</button> <button type="button" onClick={removeKey}>키 삭제</button></>}</p>
        </form>
      )}
    </section>
  )
}
