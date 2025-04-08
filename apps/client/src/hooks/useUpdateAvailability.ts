import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { TimeSlot } from '@/types'

const API_URL = `${import.meta.env.VITE_API_URL}/api/availabilities`

/**
 * Updates the user's availability settings
 */
const updateUserAvailability = async (token: string, timeSlots: TimeSlot[]): Promise<any> => {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ timeSlots }),
  })

  if (!response.ok) {
    throw new Error('Failed to update availability')
  }

  return response.json()
}

/**
 * Hook to update user's availability
 */
export const useUpdateAvailability = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (timeSlots: TimeSlot[]) => updateUserAvailability(token as string, timeSlots),
    onSuccess: () => {
      // Invalidate and refetch the availability query
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}
