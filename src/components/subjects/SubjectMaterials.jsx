import { useEffect, useId, useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import { useSubjects } from '../../state/SubjectsContext.js'
import { ALLOWED_EXTENSIONS, formatBytes } from '../../services/subjectFiles.js'
import { ConfirmDelete } from './SubjectForms.jsx'
import { formatStamp } from '../../data/subjectDates.js'

export default function SubjectMaterials({ subjectId, notify }) {
  const { materials, filesStatus, addFile, removeFile, readMaterial } = useSubjects()
  const inputRef = useRef(null)
  const inputId = useId()
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const files = materials.filter(item => item.subjectId === subjectId).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  useEffect(() => () => { if (preview?.url) URL.revokeObjectURL(preview.url) }, [preview?.url])
  async function upload(list) {
    if (uploading || !list.length) return
    setUploading(true); setError('')
    const failures = []
    let count = 0
    for (const file of list) { try { await addFile(subjectId, file); count++ } catch (failure) { failures.push(failure.message) } }
    setUploading(false)
    if (count) notify(`${count}개 파일을 저장했습니다. PDF는 서버에 올라가 AI 채팅·퀴즈에 사용됩니다.`)
    setError(failures.join('\n'))
    if (inputRef.current) inputRef.current.value = ''
  }
  async function readFile(item) {
    const blob = await readMaterial(item)
    if (!blob) throw new Error('파일 본문을 찾을 수 없습니다. 브라우저 저장소가 정리되었는지 확인해주세요.')
    return blob
  }
  async function download(item) {
    try {
      const blob = await readFile(item)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a'); link.href = url; link.download = item.name; document.body.append(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (failure) { setError(failure.message) }
  }
  async function open(item) {
    try {
      const blob = await readFile(item)
      if (item.extension === 'txt') {
        if (blob.size > 1048576) throw new Error('1MB를 넘는 텍스트 자료는 다운로드해서 열어주세요.')
        setPreview({ item, text: await blob.text() })
      } else if (item.extension === 'pdf') setPreview({ item, url: URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })) })
    } catch (failure) { setError(failure.message) }
  }
  return <section className="service-card subject-panel subject-panel--materials" id="materials" aria-labelledby="subject-materials-title">
    <header className="subject-panel__heading"><div><span className="subject-eyebrow">LECTURE MATERIALS</span><h2 id="subject-materials-title">강의자료 <small>{files.length}</small></h2></div><button className="subject-add-button" type="button" disabled={uploading} onClick={() => inputRef.current.click()}>＋ 자료 추가</button></header>
    <div className={`subject-file-drop ${dragging ? 'is-dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); upload([...event.dataTransfer.files]) }}>
      <input className="sr-only" ref={inputRef} id={inputId} type="file" tabIndex={-1} multiple accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')} onChange={event => upload([...event.target.files])} disabled={uploading} aria-label="강의자료 파일 선택" />
      <strong>{uploading ? '파일 저장 중…' : '파일을 여기에 놓거나 선택해주세요'}</strong><button type="button" className="service-plain-button" disabled={uploading} onClick={() => inputRef.current.click()}>파일 선택</button><p>PDF · PPT/PPTX · DOC/DOCX · TXT · 파일당 최대 25MB</p>
    </div>
    <p className="subject-muted">PDF는 서버에 저장되어 AI 채팅과 퀴즈 생성에 사용됩니다. PDF 외 파일은 이 브라우저에만 저장됩니다.</p>
    {(error || filesStatus.error) && <p className="service-error subject-file-error" role="alert">{error || filesStatus.error}</p>}
    {filesStatus.loading && <p className="subject-muted" role="status">저장된 파일을 불러오는 중…</p>}
    <div className="subject-file-list">{files.map(item => <article className="subject-file" key={item.id}>
      <span className="subject-file__type">{item.extension.toUpperCase()}</span><div className="subject-file__info"><h3>{item.name}</h3><p>{item.server ? `${item.pages}쪽 · AI 학습 가능` : formatBytes(item.size)} · {formatStamp(item.uploadedAt)}</p>{!['pdf', 'txt'].includes(item.extension) && <span className="subject-muted">브라우저 미리보기 미지원 · 다운로드해서 열어주세요.</span>}</div>
      <div className="subject-item-actions">{['pdf', 'txt'].includes(item.extension) && <button type="button" aria-label={`${item.name} 미리보기`} onClick={() => open(item)}>미리보기</button>}<button type="button" aria-label={`${item.name} 다운로드`} onClick={() => download(item)}>다운로드</button><button type="button" className="is-danger" aria-label={`${item.name} 파일 삭제`} onClick={() => setDeleting(item)}>삭제</button></div>
    </article>)}</div>
    {!filesStatus.loading && !files.length && <div className="subject-empty"><strong>첫 강의자료를 보관해보세요</strong><p>강의 슬라이드와 읽기 자료를 과목별로 모아둘 수 있어요.</p></div>}
    {preview && <Modal title={preview.item.name} className="subject-preview-dialog" onClose={() => setPreview(null)}>{preview.url ? <><iframe className="subject-pdf-preview" src={preview.url} title={`${preview.item.name} PDF 미리보기`} /><p className="subject-muted">브라우저 PDF 뷰어가 표시되지 않으면 아래에서 다운로드해주세요.</p></> : <pre className="subject-text-preview">{preview.text}</pre>}<button type="button" className="service-plain-button" onClick={() => download(preview.item)}>파일 다운로드</button></Modal>}
    {deleting && <ConfirmDelete title="강의자료 삭제" description={`‘${deleting.name}’ 파일과 메타데이터를 이 브라우저에서 삭제합니다.`} onClose={() => setDeleting(null)} onConfirm={async () => { await removeFile(deleting.id); setDeleting(null); notify('강의자료를 삭제했습니다.') }} />}
  </section>
}
