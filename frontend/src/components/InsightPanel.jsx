import { capitalize, formatDate } from '../utils/formatters'
import { BlurFade } from './ui/blur-fade'
import { NumberTicker } from './ui/number-ticker'

export default function InsightPanel({ insight }) {
  if (!insight) return null

  return (
    <section className="insight-panel">
      <BlurFade delay={0} className="insight-heading">
        <div>
          <p className="eyebrow">AI insights</p>
          <h2>Key insights from this conversation</h2>
        </div>

        <span className="ai-badge ai-badge-animated">
          AI analyzed
        </span>
      </BlurFade>

      <BlurFade delay={80} className="insight-summary">
        <span className="insight-number">01</span>

        <div>
          <h3>Summary</h3>
          <p>{insight.summary || 'No summary was returned.'}</p>
        </div>
      </BlurFade>

      <div className="insight-grid">
        <BlurFade delay={160} className="insight-section">
          <h3>Decisions</h3>
          {insight.decisions?.length ? (
            <ul className="clean-list">
              {insight.decisions.map((decision, index) => (
                <li key={`${decision}-${index}`}>{decision}</li>
              ))}
            </ul>
          ) : (
            <p className="muted-copy">No decisions detected.</p>
          )}
        </BlurFade>

        <BlurFade delay={240} className="insight-section">
          <h3>People involved</h3>
          {insight.peopleInvolved?.length ? (
            <div className="person-list">
              {insight.peopleInvolved.map((person) => (
                <span className="person-chip" key={person}>
                  {person}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No people detected.</p>
          )}
        </BlurFade>
      </div>

      <BlurFade delay={320} className="insight-section action-section">
        <div className="section-heading-row">
          <h3>Action items</h3>
          <span className="section-count">
            <NumberTicker
              value={insight.actionItems?.length || 0}
              duration={800}
            />
          </span>
        </div>
        {insight.actionItems?.length ? (
          <div className="action-list">
            {insight.actionItems.map((item, index) => (
              <BlurFade
                delay={380 + index * 70}
                key={`${item.task}-${index}`}
                className="action-item"
              >
                <span
                  className={`action-status status-${item.status || 'pending'}`}
                >
                  {item.status === 'completed' ? '✓' : '!'}
                </span>

                <div className="action-content">
                  <strong>{item.task}</strong>

                  <div className="action-meta">
                    <span>
                      Assignee: {item.assignee || 'Unassigned'}
                    </span>

                    <span>
                      Deadline: {item.deadline || 'Not set'}
                    </span>

                    <span
                      className={`status-text status-text-${item.status || 'pending'}`}
                    >
                      {capitalize(item.status || 'pending')}
                    </span>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        ) : (
          <p className="muted-copy">No action items detected.</p>
        )}
      </BlurFade>

      <BlurFade delay={460} className="insight-section deadlines-section">
        <div className="section-heading-row">
          <h3>Deadlines</h3>
          <span className="section-count">
            <NumberTicker
              value={insight.deadlines?.length || 0}
              duration={800}
            />
          </span>
        </div>
        {insight.deadlines?.length ? (
          <div className="deadline-list">
            {insight.deadlines.map((deadline, index) => (
              <BlurFade
                delay={520 + index * 70}
                key={`${deadline.description}-${index}`}
                className="deadline-item"
              >
                <span className="calendar-icon">□</span>

                <div>
                  <strong>{deadline.description}</strong>
                  <span>{formatDate(deadline.date)}</span>
                </div>
              </BlurFade>
            ))}
          </div>
        ) : (
          <p className="muted-copy">No deadlines detected.</p>
        )}
      </BlurFade>
    </section>
  )
}