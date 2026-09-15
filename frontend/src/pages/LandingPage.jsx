import { Link } from 'react-router-dom'
import { MoveRight } from "lucide-react";

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
          <Link className="button button-ghost" to="/login">
            Sign in
          </Link>

          <Link className="button button-primary" to="/register">
            Get started
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            Project communication, made actionable
          </p>

          <h1>
            Turn project conversations into <em>clear next steps.</em>
          </h1>

          <p className="hero-description">
            ArchFlow AI analyzes meetings, notes, and project communication to
            surface summaries, decisions, action items, deadlines, and people
            involved.
          </p>

          <p className="hero-tagline">
            Less catching up. More moving forward.
          </p>

          <div className="hero-actions">
            <Link
              className="button button-primary button-large"
              to="/register"
            >
              Get started <MoveRight size={18} strokeWidth={1.8} />
            </Link>

            <Link className="quiet-link" to="/login">
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <div
          className="hero-visual"
          aria-label="Example of extracted project intelligence"
        >
          <div className="signal-card signal-source">
            <span className="signal-label">INPUT</span>
            <strong>Client alignment call</strong>
            <p>
              “Let's revise the living room layout and have the updated design
              ready by Friday.”
            </p>
            <span className="signal-tag">Meeting transcript</span>
          </div>

          <div className="signal-line" aria-hidden="true">
            <span>AI</span>
          </div>

          <div className="signal-card signal-result">
            <span className="signal-label">PROJECT INTELLIGENCE</span>
            <strong>One clear next step</strong>

            <div className="result-row">
              <span className="result-check">✓</span>

              <span>
                Prepare revised living room design
                <br />
                <small>Architect · Due Friday</small>
              </span>
            </div>

            <div className="result-footer">
              <span>1 decision</span>
              <span>3 people involved</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-proof">
        <span>Capture</span>
        <MoveRight size={18} strokeWidth={1.8} />
        <span>Analyze</span>
        <MoveRight size={18} strokeWidth={1.8} />
        <span>Act</span>
      </section>
    </main>
  )
}