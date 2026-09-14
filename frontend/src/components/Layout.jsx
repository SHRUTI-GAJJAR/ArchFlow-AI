import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    function handleOutsideClick(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handleLogout() {
    setIsProfileOpen(false)
    signOut()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <NavLink className="brand brand-sidebar" to="/dashboard">
          <span className="brand-symbol">AF</span>
          <span>ArchFlow <strong>AI</strong></span>
        </NavLink>
        <p className="sidebar-label">Workspace</p>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/dashboard"><span className="nav-icon">O</span>Overview</NavLink>
          <NavLink to="/projects"><span className="nav-icon">P</span>Projects</NavLink>
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-label">ArchFlow AI</span>
          <span className="sidebar-caption">Project communication, made actionable.</span>
        </div>
      </aside>
      <header className="topbar">
        <div className="mobile-brand"><NavLink className="brand" to="/dashboard"><span className="brand-symbol">AF</span><span>ArchFlow <strong>AI</strong></span></NavLink></div>
        <div className="topbar-context">Workspace overview</div>
        <div className="user-menu" ref={profileMenuRef}>
          <button className="profile-trigger" type="button" aria-expanded={isProfileOpen} aria-haspopup="menu" onClick={() => setIsProfileOpen((open) => !open)}>
          <div className="avatar" aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="user-copy">
            <strong>{user?.name || 'Workspace member'}</strong>
            <span>{user?.email || ''}</span>
          </div>
          <span className="profile-chevron" aria-hidden="true">⌄</span>
          </button>
          {isProfileOpen && (
            <div className="profile-popover" role="menu">
              <div className="profile-popover-header">
                <div className="avatar" aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div><strong>{user?.name || 'Workspace member'}</strong><span>{user?.email || ''}</span></div>
              </div>
              <div className="profile-divider" />
              <button className="profile-menu-item profile-logout" type="button" role="menuitem" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
    </div>
  )
}
