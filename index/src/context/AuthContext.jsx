import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('hotel_user') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)

  const login = (userData, token) => {
    localStorage.setItem('hotel_user', JSON.stringify(userData))
    localStorage.setItem('hotel_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('hotel_user')
    localStorage.removeItem('hotel_token')
    setUser(null)
  }

  const token = localStorage.getItem('hotel_token')

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
