import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCollection } from '../data/collectionsStorage'

export default function CreateCollectionPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState(3)
  const [errors, setErrors] = useState<{ title?: string; subject?: string }>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: { title?: string; subject?: string } = {}
    if (!title.trim()) nextErrors.title = 'Vnesi naslov zbirke.'
    else if (title.trim().length > 80) nextErrors.title = 'Naslov je lahko dolg največ 80 znakov.'
    if (!subject.trim()) nextErrors.subject = 'Vnesi predmet.'
    setErrors(nextErrors)
    setSaveError(null)
    if (Object.keys(nextErrors).length > 0) {
      event.currentTarget.querySelector<HTMLInputElement>(!title.trim() || title.trim().length > 80 ? '#collection-title' : '#collection-subject')?.focus()
      return
    }
    try {
      createCollection({ title, subject, grade })
      navigate('/teachers')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Zbirke ni mogoče shraniti.')
    }
  }

  return (
    <section className="create-collection-page" aria-labelledby="create-title">
      <Link className="back-link" to="/teachers"><span aria-hidden="true">←</span> Moje zbirke</Link>
      <h1 id="create-title">Nova zbirka</h1>
      <p className="local-mode">Lokalni način · Zbirke so shranjene samo v tem brskalniku.</p>
      <form className="collection-form" onSubmit={handleSubmit} noValidate>
        <div className="metadata-fields">
          <div className="form-field title-field">
            <label htmlFor="collection-title">Naslov</label>
            <input id="collection-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={80} required placeholder="Poštevanka števila 6" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} />
            {errors.title && <p id="title-error" className="field-error">{errors.title}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="collection-subject">Predmet</label>
            <input id="collection-subject" value={subject} onChange={event => setSubject(event.target.value)} required placeholder="Matematika" aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'subject-error' : undefined} />
            {errors.subject && <p id="subject-error" className="field-error">{errors.subject}</p>}
          </div>
          <div className="form-field grade-field">
            <label htmlFor="collection-grade">Razred</label>
            <select id="collection-grade" value={grade} onChange={event => setGrade(Number(event.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => <option key={value} value={value}>{value}. razred</option>)}
            </select>
          </div>
        </div>
        <p className="form-note">Shrani osnutek zbirke. Urejevalnik vprašanj je v pripravi.</p>
        {Object.keys(errors).length > 0 && <p className="field-error" role="alert">Preveri označena polja.</p>}
        {saveError && <p className="error-message" role="alert">{saveError}</p>}
        <div className="form-actions">
          <button className="button" type="submit">Shrani zbirko</button>
          <Link className="button secondary-button" to="/teachers">Prekliči</Link>
        </div>
      </form>
    </section>
  )
}
