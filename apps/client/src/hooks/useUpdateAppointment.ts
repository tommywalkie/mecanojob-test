import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppointmentStatus } from '@/types'

interface UpdateAppointmentParams {
  appointmentId: string
  updateData: Partial<{
    status: AppointmentStatus
    title: string
    description: string
    startDate: string
    endDate: string
    inviteeName: string
    inviteeEmail: string
  }>
}

/**
 * Updates an appointment with the provided data
 */
const updateAppointment = async ({ appointmentId, updateData }: UpdateAppointmentParams): Promise<void> => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  })

  if (!response.ok) {
    throw new Error(`Failed to update appointment: ${response.status}`)
  }

  return
}

/**
 * Hook to update appointment data
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      // Invalidate and refetch appointments query to update UI
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
