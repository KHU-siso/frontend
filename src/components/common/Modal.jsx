import { useEffect, useId, useRef } from 'react'
import './Modal.css'

export default function Modal({ title, onClose, children, className = '', preventClose = false, canClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal()
  }, [])
  const allowed = () => !preventClose && (!canClose || canClose())
  return (
    <dialog
      ref={dialogRef}
      className={`moram-modal ${className}`.trim()}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={event => { if (!allowed()) event.preventDefault() }}
      onClick={event => { if (event.target === event.currentTarget && allowed()) dialogRef.current.close() }}
    >
      <div className="moram-modal__content">
        <header>
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="modal-close" aria-label="닫기" disabled={preventClose} onClick={() => { if (allowed()) dialogRef.current.close() }}>×</button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
