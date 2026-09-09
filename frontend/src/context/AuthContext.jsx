import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('archflow_user'))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('archflow_token'))
  const [user, setUser] = useState(readStoredUser)

  function signIn(authData) {
    localStorage.setItem('archflow_token', authData.token)
    localStorage.setItem('archflow_user', JSON.stringify(authData.user))
    setToken(authData.token)
    setUser(authData.user)
  }

  function signOut() {
    localStorage.removeItem('archflow_token')
    localStorage.removeItem('archflow_user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    signIn,
    signOut,
  }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
