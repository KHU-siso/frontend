import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../../components/brand/BrandLogo.jsx'
import Button from '../../components/common/Button.jsx'
import { LearningBackground, OngPeek } from '../../components/service/ServiceUI.jsx'
import { createConversation, listConversations, listDocuments, listMessages, sendMessage } from '../../services/api.js'
import menuIcon from '../../assets/dashboard/dashboard-menu.svg'
import './ChatPage.css'

export default function ChatPage() {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [documents, setDocuments] = useState([])
  const [documentId, setDocumentId] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)
  useEffect(() => {
    listConversations().then(setConversations).catch(failure => setNotice(failure.message))
    listDocuments().then(setDocuments).catch(() => {})
  }, [])
  const chat = conversations.find(item => item.id === activeId)
  async function open(id) {
    setActiveId(id); setMenuOpen(false); setNotice('')
    const conversation = conversations.find(item => item.id === id)
    setDocumentId(conversation?.document_id ? String(conversation.document_id) : '')
    try { setMessages(await listMessages(id)) } catch (failure) { setNotice(failure.message) }
  }
  function newChat() { setActiveId(null); setMessages([]); setMenuOpen(false); setDraft(''); setNotice('') }
  async function send(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sending) return
    setSending(true); setNotice('')
    try {
      let id = activeId
      if (!id) {
        const created = await createConversation(documentId ? Number(documentId) : null, text.slice(0, 24))
        setConversations(current => [created, ...current])
        setActiveId(created.id)
        id = created.id
      }
      setMessages(current => [...current, { id: `local-${Date.now()}`, role: 'user', content: text }])
      setDraft('')
      const reply = await sendMessage(id, text)
      setMessages(current => [...current, reply])
    } catch (failure) {
      setNotice(failure.message)
    } finally {
      setSending(false)
    }
  }
  return (
    <div className="chat-page">
      <header className="chat-header"><BrandLogo to="/dashboard" /><button className="app-icon-button" aria-label={menuOpen ? '채팅 메뉴 닫기' : '채팅 메뉴 열기'} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}><img src={menuIcon} alt="" /></button><span>AI chat</span><Link to="/dashboard">학습 돌아가기</Link></header>
      <div className={`chat-workspace ${menuOpen ? 'has-menu' : ''}`}>
        {menuOpen && <aside className="chat-sidebar" aria-label="채팅 메뉴"><label className="service-field">채팅 검색<input value={search} onChange={event => setSearch(event.target.value)} placeholder="채팅 제목 검색" /></label><button className="service-plain-button" onClick={newChat}>새 채팅</button><Link to="/materials">자료실</Link><p>최근</p><nav>{conversations.filter(item => item.title.includes(search)).map(item => <button key={item.id} aria-current={item.id === chat?.id ? 'page' : undefined} onClick={() => open(item.id)}>{item.title}</button>)}</nav></aside>}
        <main className={`chat-main ${messages.length ? 'has-messages' : ''}`}>
          <LearningBackground />
          <h1 className="sr-only">AI 채팅</h1>
          {messages.length > 0 && <div className="chat-messages" role="log" aria-live="polite" aria-label="대화 내용">{messages.map(message => <article key={message.id} className={`chat-message chat-message--${message.role}`}><strong>{message.role === 'user' ? '나' : '옹이'}</strong><p>{message.content}</p></article>)}{sending && <article className="chat-message chat-message--assistant"><strong>옹이</strong><p>답변을 작성하는 중…</p></article>}</div>}
          <div className="chat-composer-area"><OngPeek /><form className="chat-composer" onSubmit={send}><select aria-label="질문할 자료" value={documentId} disabled={Boolean(activeId)} onChange={event => setDocumentId(event.target.value)}><option value="">자료 없이 대화</option>{documents.map(doc => <option key={doc.id} value={doc.id}>{doc.filename}</option>)}</select><input aria-label="메시지" placeholder="옹이에게 물어보세요!" value={draft} maxLength={2000} onChange={event => setDraft(event.target.value)} /><Button type="submit" disabled={!draft.trim() || sending}>{sending ? '전송 중…' : '보내기'}</Button></form><div className="chat-shortcuts"><Link to="/study/setup">간단퀴즈</Link><Link to="/wrong-answers">퀴즈 오답기록</Link></div><p className="service-muted">{activeId ? (chat?.document_id ? '연결된 자료를 바탕으로 답변해요.' : '자료 없이 대화 중이에요.') : '새 대화를 시작할 때 질문할 PDF 자료를 고를 수 있어요.'}</p>{notice && <p className="service-muted" role="status">{notice}</p>}</div>
        </main>
      </div>
    </div>
  )
}
