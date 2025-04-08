import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'

const API_URL = `${import.meta.env.VITE_API_URL}/api/availabilities`

/**
 * Deletes an availability schedule
 */
const deleteUserAvailability = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to delete availability')
  }
}

/**
 * Hook to delete user's availability
 */
export const useDeleteAvailability = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUserAvailability(token as string, id),
    onSuccess: () => {
      // Invalidate and refetch the availability query after deletion
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}
