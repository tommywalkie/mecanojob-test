import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

/**
 * Signup hook - handles user registration
 */
export const useSignup = () => {
  const { login: setAuth } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw error
      }

      return response.json()
    },
    onSuccess: (data) => {
      setAuth(data.access_token || data.token, data.user || data)
      navigate('/dashboard')
    },
  })
}
