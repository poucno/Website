import { Link } from 'react-router-dom'
import { Balloons } from '../components/Decorations'

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="welcome-title">
        <div className="hero-copy">
          <h1 id="welcome-title">Znanje poleti<br />visoko!</h1>
          <p>Uči se skozi igro.</p>
          <Link className="button hero-button" to="/preview">Razišči otok <span aria-hidden="true">→</span></Link>
        </div>
        <Balloons />
      </section>
      <section className="game-card" aria-labelledby="game-title">
        <span className="game-icon" aria-hidden="true">6 × 4</span>
        <div>
          <h2 id="game-title">Lovljenje balonov</h2>
          <p>Predogled je v pripravi.</p>
        </div>
        <Link className="button" to="/preview">Oglej si <span aria-hidden="true">→</span></Link>
      </section>
    </>
  )
}
