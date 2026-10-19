import { Link, useParams } from 'react-router-dom'
import { findGame } from '../data/games'

export default function PlayPage() {
  const { gameName = '', collectionId } = useParams()
  const game = findGame(gameName)

  if (!game) {
    return (
      <section className="play-page">
        <Link className="back-link" to="/"><span aria-hidden="true">←</span> Začetna stran</Link>
        <h1>Igra ni na voljo</h1>
        <p className="form-note">Igre »{gameName}« ni mogoče najti.</p>
      </section>
    )
  }

  const base = `/games/${game.name}/index.html`
  const src = collectionId ? `${base}?collection=${encodeURIComponent(collectionId)}` : base

  return (
    <section className="play-page" aria-labelledby="play-title">
      <div className="play-heading">
        <Link className="back-link" to="/"><span aria-hidden="true">←</span> Začetna stran</Link>
        <h1 id="play-title">{game.title}</h1>
      </div>
      <iframe
        className="game-frame"
        title={game.title}
        src={src}
        allow="autoplay; fullscreen; gamepad; xr-spatial-tracking"
      />
      {collectionId && <p className="form-note">Zbirka: {collectionId}</p>}
    </section>
  )
}
