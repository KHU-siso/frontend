import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Button from '../common/Button.jsx'
import { listMessages, listSubjectChats, openSubjectChat, sendMessage } from '../../services/api.js'
import { useSubjects } from '../../state/SubjectsContext.js'

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
  useEffect(() => { if (hash === '#chat' && !loading) inputRef.current?.focus({ preventScroll: true }) }, [hash, loading])
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [messages, sending])

  async function send(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sending) return
    setSending(true); setError('')
    try {
      let id = conversationId
      if (!id) { id = (await openSubjectChat(subject.id, `${subject.name} 채팅`)).id; setConversationId(id) }
      setMessages(current => [...current, { id: `local-${Date.now()}`, role: 'user', content: text }])
      setDraft('')
      const reply = await sendMessage(id, text)
      setMessages(current => [...current, reply])
    } catch (failure) { setError(failure.message) }
    finally { setSending(false) }
  }

  return (
    <section className="subject-chat" id="chat" aria-labelledby="subject-chat-heading">
      <header><h2 id="subject-chat-heading">AI 채팅</h2><p>{basis}</p></header>
      <div className="subject-chat__log" ref={logRef} role="log" aria-live="polite" aria-label={`${subject.name} 대화 내용`}>
        {loading ? <p className="subject-chat__empty">대화를 불러오는 중…</p> : !messages.length && <p className="subject-chat__empty">{subject.name}에 대해 궁금한 점을 물어보세요.</p>}
        {messages.map(message => <article key={message.id} className={`subject-chat__message subject-chat__message--${message.role}`}><strong>{message.role === 'user' ? '나' : '옹이'}</strong><p>{message.content}</p></article>)}
        {sending && <article className="subject-chat__message subject-chat__message--assistant"><strong>옹이</strong><p>답변을 작성하는 중…</p></article>}
      </div>
      {error && <p className="service-error" role="alert">{error}</p>}
      <form className="subject-chat__form" onSubmit={send}>
        <input ref={inputRef} aria-label={`${subject.name} AI 채팅 메시지`} placeholder="옹이에게 물어보세요!" value={draft} maxLength={2000} onChange={event => setDraft(event.target.value)} />
        <Button type="submit" disabled={!draft.trim() || sending}>{sending ? '전송 중…' : '보내기'}</Button>
      </form>
    </section>
  )
}
