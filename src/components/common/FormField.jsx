export default function FormField({ id, label, error, hint, action, children, ...props }) {
  const descriptions = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  return (
    <div className="form-field">
      <div className="form-field__label">
        <label htmlFor={id}>{label}</label>
        {action}
      </div>
      <div className="form-field__control">
        <input id={id} aria-invalid={error ? true : undefined} aria-describedby={descriptions || undefined} {...props} />
        {children}
      </div>
      {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}
