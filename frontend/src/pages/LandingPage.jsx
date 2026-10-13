import { Link } from 'react-router-dom'
import { MoveRight } from 'lucide-react'
import { BlurFade } from '../components/ui/blur-fade'
import { ShimmerButton } from '../components/ui/shimmer-button'

/*
 * The extraction list is the product, stated plainly. It replaces the
 * floating mock-product card that every generated landing page reaches
 * for — an inventory of what the software returns is both more honest
 * and more useful than a picture of it.
 */
const EXTRACTIONS = [
  { n: '01', label: 'Summary', note: 'What actually happened' },
  { n: '02', label: 'Decisions', note: 'Agreed, and by whom' },
  { n: '03', label: 'Action items', note: 'Owner and date, or flagged as missing' },
  { n: '04', label: 'Deadlines', note: 'Dates pulled from the conversation' },
  { n: '05', label: 'People involved', note: 'Who owes what' },
]

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="brand" to="/">
          <span className="brand-symbol">AF</span>
          <span>
            ArchFlow <strong>AI</strong>
          </span>
        </Link>

        <div className="landing-actions">
          <Link className="landing-nav-link" to="/login">
            Sign in
          </Link>

          <ShimmerButton
            className="button button-primary"
            as={Link}
            to="/register"
          >
            Start a project
          </ShimmerButton>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <BlurFade delay={0}>
            <p className="eyebrow">Project communication intelligence</p>
          </BlurFade>

          <BlurFade delay={80}>
            <h1>Your site meetings stop being write&#8209;offs.</h1>
          </BlurFade>

          <BlurFade delay={160}>
            <p className="hero-description">
              ArchFlow reads the call notes, emails and messages on a live
              project, then tells you what was decided, who owes what, and
              which dates actually matter — before the Friday hand-over, not
              after it.
            </p>
          </BlurFade>

          <BlurFade delay={240}>
            <div className="hero-actions">
              <ShimmerButton
                className="button button-primary button-large"
                as={Link}
                to="/register"
              >
                Start a project <MoveRight size={18} strokeWidth={1.8} />
              </ShimmerButton>

              <Link className="quiet-link" to="/login">
                Sign in
              </Link>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={120} className="hero-aside">
          <p className="extract-heading">Pulled out of every conversation</p>

          <ol className="extract-list">
            {EXTRACTIONS.map((item) => (
              <li className="extract-row" key={item.n}>
                <span className="extract-num">{item.n}</span>

                <span className="extract-body">
                  <strong>{item.label}</strong>
                  <span>{item.note}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="extract-footnote">
            Nothing is invented. If it was not said, it does not appear.
          </p>
        </BlurFade>
      </section>

      <footer className="landing-foot">
        <div className="landing-foot-inner">
          <span className="landing-foot-brand">
            ArchFlow <strong>AI</strong>
          </span>

          <nav className="landing-foot-links" aria-label="Footer">
            <Link to="/register">Start a project</Link>
            <Link to="/login">Sign in</Link>
          </nav>

          <span className="landing-foot-note">
            Built for architectural practices and their projects
          </span>
        </div>
      </footer>
    </main>
  )
}