import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

/**
 * Signup hook - handles user registration
 */
export const useSignup = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      password,
    }: {
      firstName: string
      lastName: string
      email: string
      password: string
    }) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw error
      }

      return response.json()
    },
    onSuccess: () => {
      navigate('/login')
    },
  })
}
