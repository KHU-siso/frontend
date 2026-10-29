import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../../components/brand/BrandLogo.jsx'
import Button from '../../components/common/Button.jsx'
import { LearningBackground, OngPeek } from '../../components/service/ServiceUI.jsx'
import { useDemo } from '../../state/DemoContext.js'
import menuIcon from '../../assets/dashboard/dashboard-menu.svg'
import './ChatPage.css'

function fallbackReply(text) {
  if (/퀴즈|문제/.test(text)) return '안내: 아래 간단퀴즈에서 과목과 문제 유형을 선택해 학습을 시작할 수 있어요. 실제 AI가 생성한 답변은 아닙니다.'
  if (/계획|목표|공부/.test(text)) return '안내: 오늘의 학습 목표를 작은 단위로 나눠보세요. 30분 동안 개념을 읽고 퀴즈 3문제로 확인하는 예시 계획을 추천해요.'
  if (/자료|출결/.test(text)) return '안내: 자료실에서 과목별 예시 학습 자료와 출결 현황을 확인할 수 있어요.'
  return '안내: 질문을 확인했어요. 이 화면은 미리 정한 예시 답변을 표시합니다. 실제 AI 연결이나 문서 분석은 제공하지 않아요. 학습 목표, 퀴즈 또는 자료에 대해 질문해보세요.'
}

export default function ChatPage() {
  const { state, dispatch } = useDemo()
  const [activeId, setActiveId] = useState(state.chats[0].id)
  const [menuOpen, setMenuOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const chat = state.chats.find(item => item.id === activeId) || state.chats[0]
  function newChat() { const id = crypto.randomUUID(); dispatch({ type: 'CHAT_CREATE', id }); setActiveId(id); setMenuOpen(false); setDraft('') }
  function send(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    dispatch({ type: 'CHAT_MESSAGE', id: chat.id, messageId: crypto.randomUUID(), text, reply: fallbackReply(text) })
    setDraft('')
  }
  return (
    <div className="chat-page">
      <header className="chat-header"><BrandLogo to="/dashboard" /><button className="app-icon-button" aria-label={menuOpen ? '채팅 메뉴 닫기' : '채팅 메뉴 열기'} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}><img src={menuIcon} alt="" /></button><span>AI chat</span><Link to="/dashboard">학습 돌아가기</Link></header>
      <div className={`chat-workspace ${menuOpen ? 'has-menu' : ''}`}>
        {menuOpen && <aside className="chat-sidebar" aria-label="채팅 메뉴"><label className="service-field">채팅 검색<input value={search} onChange={event => setSearch(event.target.value)} placeholder="채팅 제목 검색" /></label><button className="service-plain-button" onClick={newChat}>새 채팅</button><Link to="/materials">자료실</Link><p>최근</p><nav>{state.chats.filter(item => item.title.includes(search)).map(item => <button key={item.id} aria-current={item.id === chat.id ? 'page' : undefined} onClick={() => { setActiveId(item.id); setMenuOpen(false) }}>{item.title}</button>)}</nav></aside>}
        <main className={`chat-main ${chat.messages.length ? 'has-messages' : ''}`}>
          <LearningBackground />
          <h1 className="sr-only">AI 채팅</h1>
          {chat.messages.length > 0 && <div className="chat-messages" role="log" aria-live="polite" aria-label="대화 내용">{chat.messages.map(message => <article key={message.id} className={`chat-message chat-message--${message.role}`}><strong>{message.role === 'user' ? '나' : '옹이'}</strong><p>{message.text}</p></article>)}</div>}
          <div className="chat-composer-area"><OngPeek /><form className="chat-composer" onSubmit={send}><button type="button" aria-label="파일 첨부 안내" onClick={() => setNotice('파일 업로드와 문서 분석은 아직 연결되지 않았습니다.')}>+</button><input aria-label="메시지" placeholder="옹이에게 물어보세요!" value={draft} maxLength={2000} onChange={event => setDraft(event.target.value)} /><Button type="submit" disabled={!draft.trim()}>보내기</Button></form><div className="chat-shortcuts"><Link to="/study/setup">간단퀴즈</Link><Link to="/wrong-answers">퀴즈 오답기록</Link></div><p className="service-muted">AI 서비스 연결 전에는 안내 답변을 표시합니다.</p>{notice && <p className="service-muted" role="status">{notice}</p>}</div>
        </main>
      </div>
    </div>
  )
}
