import { useEffect, useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import { ConfirmDelete } from './SubjectForms.jsx'
import { useSubjects } from '../../state/SubjectsContext.js'
import { formatStamp } from '../../data/subjectDates.js'

function NoteEditor({ subjectId, note, onClose, onSaved }) {
  const { data, saveRecord, saveDraft } = useSubjects()
  const key = `${subjectId}:${note?.id || 'new'}`
  const base = { title: note?.title || '', body: note?.body || '' }
  const [values, setValues] = useState(() => data.drafts[key] || base)
  const [savedSignature, setSavedSignature] = useState(() => data.drafts[key] ? JSON.stringify({ title: data.drafts[key].title, body: data.drafts[key].body }) : '')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const latest = useRef(values)
  const finished = useRef(false)
  const dirty = values.title !== base.title || values.body !== base.body
  const signature = JSON.stringify({ title: values.title, body: values.body })
  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(() => {
      const ok = saveDraft(key, { subjectId, noteId: note?.id || null, title: values.title, body: values.body })
      if (ok) { setSavedSignature(signature); setError('') } else setError('초안을 저장하지 못했습니다. 이 창을 닫기 전에 내용을 복사하거나 저장 공간을 확보해주세요.')
    }, 400)
    return () => clearTimeout(timer)
  }, [dirty, key, note?.id, saveDraft, signature, subjectId, values.title, values.body])
  useEffect(() => {
    const flush = () => {
      const draft = latest.current
      if (finished.current || (draft.title === base.title && draft.body === base.body)) return true
      return saveDraft(key, { subjectId, noteId: note?.id || null, title: draft.title, body: draft.body })
    }
    const unload = event => { if (!flush()) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', unload)
    return () => { window.removeEventListener('beforeunload', unload); flush() }
  }, [base.title, base.body, key, note?.id, saveDraft, subjectId])
  function update(name, value) { const next = { ...values, [name]: value }; latest.current = next; setValues(next) }
  function save(event) {
    event.preventDefault()
    try { const result = saveRecord('notes', subjectId, { title: values.title, body: values.body }, note?.id); if (result.errors) setErrors(result.errors); else { finished.current = true; onSaved() } }
    catch (failure) { setError(failure.message) }
  }
  function canClose() {
    if (!dirty || saveDraft(key, { subjectId, noteId: note?.id || null, title: values.title, body: values.body })) return true
    setError('초안을 저장하지 못했습니다. 창을 닫기 전에 내용을 복사하거나 저장 공간을 확보해주세요.')
    return false
  }
  return <Modal title={note ? '학습 노트 수정' : '새 학습 노트'} className="note-editor-dialog" onClose={onClose} canClose={canClose}>
    <form className="subject-form" onSubmit={save} noValidate>
      <label className="service-field">노트 제목 (필수)<input aria-label="노트 제목 (필수)" value={values.title} maxLength={120} onChange={event => update('title', event.target.value)} aria-invalid={!!errors.title} />{errors.title && <span className="field-error">{errors.title}</span>}</label>
      <label className="service-field">노트 본문<textarea aria-label="노트 본문" value={values.body} maxLength={50000} rows={12} onChange={event => update('body', event.target.value)} /></label>
      <p className="subject-muted" role="status">{dirty ? savedSignature === signature ? '초안이 이 브라우저에 보관되었습니다. 노트 목록에 반영하려면 노트 저장을 눌러주세요.' : '초안 저장 중…' : '변경된 내용이 없습니다.'} {values.body.length.toLocaleString()} / 50,000자</p>
      {error && <p className="service-error" role="alert">{error}</p>}
      <div className="subject-form__actions"><button type="button" className="service-plain-button" onClick={() => { if (canClose()) onClose() }}>닫기 · 초안 보관</button><Button type="submit">노트 저장</Button></div>
    </form>
  </Modal>
}

export default function NotesPanel({ subjectId, globalSearch = '', notify }) {
  const { data, removeRecord } = useSubjects()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [reading, setReading] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const notes = data.notes.filter(note => note.subjectId === subjectId && [query, globalSearch].every(value => `${note.title} ${note.body}`.toLocaleLowerCase().includes(value.trim().toLocaleLowerCase()))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const draftCount = Object.values(data.drafts).filter(draft => draft.subjectId === subjectId).length
  return <section className="service-card subject-panel subject-panel--notes" id="notes" aria-labelledby="subject-notes-title">
    <header className="subject-panel__heading"><div><span className="subject-eyebrow">STUDY NOTES</span><h2 id="subject-notes-title">학습 노트 <small>{data.notes.filter(note => note.subjectId === subjectId).length}</small></h2></div><button className="subject-add-button" type="button" onClick={() => setEditing({})}>＋ 새 노트</button></header>
    <label className="subject-search"><span className="sr-only">노트 제목 및 내용 검색</span><input type="search" placeholder="제목 또는 내용으로 검색" value={query} onChange={event => setQuery(event.target.value)} /></label>
    {draftCount > 0 && <p className="subject-muted">보관된 초안 {draftCount}개 · 새 노트 또는 해당 노트의 수정을 누르면 이어 쓸 수 있습니다.</p>}
    <div className="subject-record-list">{notes.map(note => <article className="subject-note" key={note.id}><button className="subject-note__open" type="button" onClick={() => setReading(note)}><h3>{note.title}</h3><p>{note.body || '본문이 없는 노트입니다.'}</p></button><p className="subject-timestamps"><span>작성 {formatStamp(note.createdAt)}</span><span>수정 {formatStamp(note.updatedAt)}</span></p><div className="subject-item-actions"><button type="button" onClick={() => setEditing(note)} aria-label={`${note.title} 노트 수정`}>수정{data.drafts[`${subjectId}:${note.id}`] ? ' · 초안 있음' : ''}</button><button type="button" className="is-danger" onClick={() => setDeleting(note)} aria-label={`${note.title} 노트 삭제`}>삭제</button></div></article>)}</div>
    {!notes.length && <div className="subject-empty"><strong>{query || globalSearch ? '검색 결과가 없습니다' : '배운 내용을 나만의 문장으로'}</strong><p>{query || globalSearch ? '제목이나 본문의 다른 단어로 검색해보세요.' : '첫 노트를 작성해 오늘 이해한 내용을 기록해보세요.'}</p></div>}
    {editing && <NoteEditor subjectId={subjectId} note={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); notify('학습 노트를 저장했습니다.') }} />}
    {reading && <Modal title={reading.title} className="note-editor-dialog" onClose={() => setReading(null)}><p className="subject-timestamps">작성 {formatStamp(reading.createdAt)} · 수정 {formatStamp(reading.updatedAt)}</p><div className="subject-note-body">{reading.body || '본문이 없습니다.'}</div></Modal>}
    {deleting && <ConfirmDelete title="노트 삭제" description={`‘${deleting.title}’ 노트와 연결 초안을 삭제합니다.`} onClose={() => setDeleting(null)} onConfirm={() => { removeRecord('notes', subjectId, deleting.id); setDeleting(null); notify('노트를 삭제했습니다.') }} />}
  </section>
}
