import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCollection } from '../data/collectionsStorage'
import { validateMetadata } from '../data/collectionValidation'
import type { MetadataErrors } from '../data/collectionValidation'
import type { CollectionMetadata } from '../types/collection'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import CollectionMetadataFields from '../components/CollectionMetadataFields'
import { SubjectTile } from '../components/Decorations'
import { pluralSl, QUESTION_FORMS } from '../data/plural'
import UnsavedChangesDialog from '../components/UnsavedChangesDialog'

export default function CreateCollectionPage() {
  const navigate = useNavigate()
  const [metadata, setMetadata] = useState<CollectionMetadata>({ title: '', subject: '', grade: 3 })
  const [errors, setErrors] = useState<MetadataErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const hasChanges = metadata.title !== '' || metadata.subject !== '' || metadata.grade !== 3
  const { blocker, allowNavigation } = useUnsavedChanges(hasChanges)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateMetadata(metadata)
    setErrors(nextErrors)
    setSaveError(null)
    if (Object.keys(nextErrors).length > 0) {
      const field = nextErrors.title ? '#collection-title' : nextErrors.subject ? '#collection-subject' : '#collection-grade'
      event.currentTarget.querySelector<HTMLElement>(field)?.focus()
      return
    }
    try {
      const id = createCollection(metadata)
      allowNavigation()
      navigate('/teachers', { state: { notice: `Zbirka »${metadata.title.trim()}« je ustvarjena. Dodaj ji vprašanja z gumbom Uredi.`, highlightId: id } })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Zbirke ni mogoče shraniti.')
    }
  }

  return (
    <section className="create-collection-page" aria-labelledby="create-title">
      <Link className="back-link" to="/teachers"><span aria-hidden="true">←</span> Moje zbirke</Link>
      <h1 id="create-title">Nova zbirka</h1>
      <p className="local-mode">Lokalni način · Zbirke so shranjene samo v tem brskalniku.</p>
      <div className="create-layout">
      <form className="collection-form" onSubmit={handleSubmit} noValidate>
        <CollectionMetadataFields metadata={metadata} errors={errors} onChange={next => { setMetadata(next); setSaveError(null) }} />
        <p className="form-note">Shrani osnutek, nato z gumbom Uredi dodaj vprašanja.</p>
        {Object.keys(errors).length > 0 && <p className="field-error" role="alert">Preveri označena polja.</p>}
        {saveError && <p className="error-message" role="alert">{saveError}</p>}
        <div className="form-actions">
          <button className="button" type="submit">Shrani zbirko</button>
          <Link className="button secondary-button" to="/teachers">Prekliči</Link>
        </div>
      </form>
      <aside className="live-preview" aria-hidden="true">
        <p className="live-preview-label">Tako bo videti na seznamu</p>
        <div className="collection-card collection-card--preview">
          <SubjectTile subject={metadata.subject} grade={metadata.grade} />
          <div className="collection-details">
            <h2 className={metadata.title.trim() ? '' : 'is-placeholder'}>{metadata.title.trim() || 'Naslov zbirke'}</h2>
            <p className="collection-meta"><span className={metadata.subject.trim() ? '' : 'is-placeholder'}>{metadata.subject.trim() || 'Predmet'}</span><span>{metadata.grade}. razred</span><span>0 {pluralSl(0, QUESTION_FORMS)}</span></p>
          </div>
        </div>
      </aside>
      </div>
      {blocker.state === 'blocked' && <UnsavedChangesDialog onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />}
    </section>
  )
}
