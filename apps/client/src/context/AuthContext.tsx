import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: any
  token: string | null
  login: (token: string, user: any) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper function to extract user ID from JWT token
const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.id || payload.sub || null
  } catch (e) {
    console.error('Failed to parse JWT token:', e)
    return null
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        // Parse stored user data
        const userData = JSON.parse(storedUser)

        // Ensure user has an ID
        if (!userData.id && storedToken) {
          const userId = getUserIdFromToken(storedToken)
          if (userId) {
            userData.id = userId
          }
        }

        setToken(storedToken)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (e) {
        // Clean up invalid data
        console.error('Auth initialization failed:', e)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  // Store token and user data in localStorage
  const login = (newToken: string, userData: any) => {
    // Ensure user has an ID
    if (!userData.id) {
      const userId = getUserIdFromToken(newToken)
      if (userId) {
        userData.id = userId
      }
    }

    // Store data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))

    // Update state
    setToken(newToken)
    setUser(userData)
    setIsAuthenticated(true)
  }

  // Clear token and user data
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  return <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>{children}</AuthContext.Provider>
}

export default AuthProvider
