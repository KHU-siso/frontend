import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, PageTitle } from '../../components/service/ServiceUI.jsx'
import { listSubjectChats } from '../../services/api.js'
import { useSubjects } from '../../state/SubjectsContext.js'
import { formatStamp } from '../../data/subjectDates.js'
import './SubjectChatsPage.css'

// 사이드바 "AI 채팅": 과목별 대화 목록. 과목을 누르면 그 과목 홈의 채팅창으로 이동한다.
export default function SubjectChatsPage() {
  const { data } = useSubjects()
  const [chats, setChats] = useState({})
  const [status, setStatus] = useState({ loading: true, error: '' })
  useEffect(() => {
    let active = true
    listSubjectChats().then(rows => { if (active) { setChats(Object.fromEntries(rows.map(row => [row.subject_ref, row]))); setStatus({ loading: false, error: '' }) } })
      .catch(failure => active && setStatus({ loading: false, error: failure.message }))
    return () => { active = false }
  }, [])
  return <div className="service-page subject-chats">
    <PageTitle title="AI 채팅" description="과목별로 대화가 따로 저장되고, 그 과목에 올린 자료를 바탕으로 답해요." />
    {status.error && <p className="service-error" role="alert">{status.error}</p>}
    {data.subjects.length ? <ul className="subject-chats__list">{data.subjects.map(subject => {
      const chat = chats[subject.id]
      return <li key={subject.id}><Link to={`/materials/${subject.id}#chat`}>
        <span className="subject-chats__name"><strong>{subject.name}</strong><small>{subject.teacher}</small></span>
        <span className="subject-chats__last">{status.loading ? '불러오는 중…' : chat?.message_count ? chat.last_message : '아직 대화가 없어요. 눌러서 시작해 보세요.'}</span>
        <span className="subject-chats__meta">{chat?.message_count ? `메시지 ${chat.message_count}개 · ${formatStamp(chat.last_at)}` : ''}</span>
      </Link></li>
    })}</ul> : <EmptyState title="과목을 먼저 추가해 주세요" to="/materials?add=1" linkLabel="과목 추가하기">AI 채팅은 과목마다 따로 열려요. 과목을 추가하면 여기에 대화 목록이 나타나요.</EmptyState>}
  </div>
}
