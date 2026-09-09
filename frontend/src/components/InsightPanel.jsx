import { capitalize, formatDate } from '../utils/formatters'

export default function InsightPanel({ insight }) {
  if (!insight) return null

  return (
    <section className="insight-panel">
      <div className="insight-heading"><div><p className="eyebrow">AI project intelligence</p><h2>What matters from this conversation</h2></div><span className="ai-badge">AI analyzed</span></div>
      <div className="insight-summary"><span className="insight-number">01</span><div><h3>Summary</h3><p>{insight.summary || 'No summary was returned.'}</p></div></div>
      <div className="insight-grid">
        <div className="insight-section"><h3>Decisions</h3>{insight.decisions?.length ? <ul className="clean-list">{insight.decisions.map((decision, index) => <li key={`${decision}-${index}`}>{decision}</li>)}</ul> : <p className="muted-copy">No decisions detected.</p>}</div>
        <div className="insight-section"><h3>People involved</h3>{insight.peopleInvolved?.length ? <div className="person-list">{insight.peopleInvolved.map((person) => <span className="person-chip" key={person}>{person}</span>)}</div> : <p className="muted-copy">No people detected.</p>}</div>
      </div>
      <div className="insight-section action-section"><div className="section-heading-row"><h3>Action items</h3><span className="section-count">{insight.actionItems?.length || 0}</span></div>{insight.actionItems?.length ? <div className="action-list">{insight.actionItems.map((item, index) => <div className="action-item" key={`${item.task}-${index}`}><span className={`action-status status-${item.status || 'pending'}`}>{item.status === 'completed' ? '✓' : '!'}</span><div className="action-content"><strong>{item.task}</strong><div className="action-meta"><span>Assignee: {item.assignee || 'Unassigned'}</span><span>Deadline: {item.deadline || 'Not set'}</span><span className={`status-text status-text-${item.status || 'pending'}`}>{capitalize(item.status || 'pending')}</span></div></div></div>)}</div> : <p className="muted-copy">No action items detected.</p>}</div>
      <div className="insight-section deadlines-section"><div className="section-heading-row"><h3>Deadlines</h3><span className="section-count">{insight.deadlines?.length || 0}</span></div>{insight.deadlines?.length ? <div className="deadline-list">{insight.deadlines.map((deadline, index) => <div className="deadline-item" key={`${deadline.description}-${index}`}><span className="calendar-icon">□</span><div><strong>{deadline.description}</strong><span>{formatDate(deadline.date)}</span></div></div>)}</div> : <p className="muted-copy">No deadlines detected.</p>}</div>
    </section>
  )
}
