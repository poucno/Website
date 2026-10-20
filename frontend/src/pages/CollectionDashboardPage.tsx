import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Balloons, SubjectTile } from '../components/Decorations'
import { COLLECTIONS_STORAGE_KEY, deleteCollection, readCollections } from '../data/collectionsStorage'
import { canExportCollection, downloadCollectionJson } from '../data/collectionExport'
import { COLLECTION_FORMS, DRAFT_FORMS, QUESTION_FORMS, pluralSl } from '../data/plural'
import { useCountUp } from '../hooks/useCountUp'
import { useMotion } from '../hooks/useMotion'
import type { Collection } from '../types/collection'

type NoticeState = { notice?: string; highlightId?: string } | null

function loadDashboard(): { collections: Collection[]; loadError: string | null } {
  try {
    return { collections: readCollections(), loadError: null }
  } catch (error) {
    return { collections: [], loadError: error instanceof Error ? error.message : 'Zbirk ni mogoče prebrati.' }
  }
}

function StatChip({ value, forms, tone, enabled }: { value: number; forms: [string, string, string, string]; tone: string; enabled: boolean }) {
  const shown = useCountUp(value, enabled)
  return (
    <li className={`stat-chip stat-chip--${tone}`}>
      <strong>{shown}</strong> <span>{pluralSl(value, forms)}</span>
    </li>
  )
}

export default function CollectionDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { motionEnabled } = useMotion()
  const navState = location.state as NoticeState
  const [dashboard, setDashboard] = useState(loadDashboard)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [notice, setNotice] = useState(navState?.notice ?? null)
  const [highlightId] = useState(navState?.highlightId ?? null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const removeTimer = useRef(0)
  const newCollectionLink = useRef<HTMLAnchorElement>(null)
  const { collections, loadError } = dashboard

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === COLLECTIONS_STORAGE_KEY || event.key === null) {
        const loaded = loadDashboard()
        setDashboard(previous => loaded.loadError ? { ...previous, loadError: loaded.loadError } : loaded)
        setSaveError(null)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // The notice comes with the navigation; clear it so Back or a reload does not show it again.
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => () => window.clearTimeout(removeTimer.current), [])

  function retryLoad() {
    const loaded = loadDashboard()
    setDashboard(previous => loaded.loadError ? { ...previous, loadError: loaded.loadError } : loaded)
    setSaveError(null)
  }

  function performDelete(collection: Collection) {
    try {
      const remaining = deleteCollection(collection.id)
      setDashboard({ collections: remaining, loadError: null })
      setSaveError(null)
      setNotice(`Zbirka »${collection.title}« je izbrisana.`)
      newCollectionLink.current?.focus()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Zbirke ni mogoče izbrisati.')
    }
  }

  function handleDelete(collection: Collection) {
    if (removingId) return
    if (!window.confirm(`Izbrišem zbirko »${collection.title}«? Izbrisane zbirke ni mogoče obnoviti.`)) return
    if (!motionEnabled) {
      performDelete(collection)
      return
    }
    // Let the card shrink away before it is removed.
    setRemovingId(collection.id)
    removeTimer.current = window.setTimeout(() => {
      setRemovingId(null)
      performDelete(collection)
    }, 320)
  }

  const questionTotal = collections.reduce((sum, collection) => sum + collection.questions.length, 0)
  const draftTotal = collections.filter(collection => collection.questions.length === 0).length

  return (
    <section className="dashboard-page" aria-labelledby="dashboard-title">
      <div className="page-heading">
        <h1 id="dashboard-title">Moje zbirke</h1>
        {!loadError && <Link ref={newCollectionLink} className="button" to="/teachers/collections/new"><span aria-hidden="true">＋</span> Nova zbirka</Link>}
      </div>
      <p className="local-mode">Lokalni način · Zbirke so shranjene samo v tem brskalniku.</p>
      <div className="toast-region" role="status">
        {notice && (
          <p className="toast">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="m7 12.5 3.5 3.5 6.5-7.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {notice}
          </p>
        )}
      </div>
      {loadError && <div className="error-message" role="alert"><p>{loadError}</p><button className="button secondary-button" onClick={retryLoad}>Poskusi znova</button></div>}
      {saveError && <p className="error-message" role="alert">{saveError}</p>}
      {!loadError && collections.length === 0 && (
        <div className="empty-state">
          <div className="empty-balloons"><Balloons animated interactive /></div>
          <h2>Pripravi prvo zbirko</h2>
          <p>Izberi naslov, predmet in razred.</p>
          <Link className="button" to="/teachers/collections/new">Ustvari zbirko <span aria-hidden="true">→</span></Link>
        </div>
      )}
      {collections.length > 0 && (
        <>
          <ul className="stat-chips" aria-label="Povzetek">
            <StatChip value={collections.length} forms={COLLECTION_FORMS} tone="sky" enabled={motionEnabled} />
            <StatChip value={questionTotal} forms={QUESTION_FORMS} tone="sun" enabled={motionEnabled} />
            {draftTotal > 0 && <StatChip value={draftTotal} forms={DRAFT_FORMS} tone="lilac" enabled={motionEnabled} />}
          </ul>
          <ul className="collection-list">
            {collections.map((collection, index) => {
              const count = collection.questions.length
              const exportable = canExportCollection(collection)
              return (
                <li key={collection.id} className={`collection-card ${removingId === collection.id ? 'is-removing' : ''} ${highlightId === collection.id ? 'collection-card--highlight' : ''}`} style={{ '--i': Math.min(index, 8) } as CSSProperties}>
                  <SubjectTile subject={collection.subject} grade={collection.grade} />
                  <div className="collection-details">
                    <h2>{collection.title}</h2>
                    <p className="collection-meta"><span>{collection.subject}</span><span>{collection.grade}. razred</span><span>{count} {pluralSl(count, QUESTION_FORMS)}</span></p>
                    {count === 0 && <span className="draft-label">Osnutek brez vprašanj</span>}
                  </div>
                  <div className="collection-actions">
                    {!loadError && (
                      <Link className="button secondary-button" to={`/teachers/collections/${encodeURIComponent(collection.id)}/edit`} aria-label={`Uredi zbirko ${collection.title}`}>
                        <svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m4 20 1-4.5L16.5 4a2.1 2.1 0 0 1 3 3L8 18.5z" /><path d="m14.5 6 3.5 3.5" /></svg>
                        Uredi
                      </Link>
                    )}
                    <button className="button secondary-button" type="button" disabled={!exportable} title={exportable ? undefined : 'Za izvoz dodaj vsaj eno vprašanje.'} onClick={() => downloadCollectionJson(collection)} aria-label={`Izvozi zbirko ${collection.title} kot JSON`}>
                      <svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" /></svg>
                      Izvozi JSON
                    </button>
                    <button className="button secondary-button delete-button" type="button" disabled={!!loadError || removingId !== null} onClick={() => handleDelete(collection)} aria-label={`Izbriši zbirko ${collection.title}`}>
                      <svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 7h14M10 7V5h4v2m-7 0 1 12h8l1-12M10.5 11v5m3-5v5" /></svg>
                      Izbriši
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
