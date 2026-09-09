import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    signOut()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <header className="topbar">
        <NavLink className="brand" to="/dashboard">
          <span className="brand-symbol">AF</span>
          <span>ArchFlow <strong>AI</strong></span>
        </NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/dashboard">Overview</NavLink>
          <NavLink to="/projects">Projects</NavLink>
        </nav>
        <div className="user-menu">
          <div className="avatar" aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="user-copy">
            <strong>{user?.name || 'Workspace member'}</strong>
            <span>{user?.email || ''}</span>
          </div>
          <button className="button button-ghost button-small" type="button" onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
    </div>
  )
}
