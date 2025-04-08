import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBookAppointment, BookAppointmentData } from '@/hooks/useBookAppointment'
import { Button } from '@/components/Button'

const bookingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  inviteeName: z.string().min(1, 'Your name is required'),
  inviteeEmail: z.string().email('Please enter a valid email'),
  description: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

function BookingForm() {
  const { userId } = useParams<{ userId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { startTime, endTime } = location.state || {}

  const bookAppointmentMutation = useBookAppointment()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const onSubmit = (data: BookingFormData) => {
    if (!userId || !startTime || !endTime) {
      console.error('Missing required data')
      return
    }

    const bookingData: BookAppointmentData = {
      userId,
      title: data.title,
      inviteeEmail: data.inviteeEmail,
      inviteeName: data.inviteeName,
      startDate: new Date(startTime),
      endDate: new Date(endTime),
      description: data.description,
    }

    bookAppointmentMutation.mutate(bookingData, {
      onSuccess: () => {
        navigate(`/booking-confirmation/${userId}`)
      },
    })
  }

  if (!startTime || !endTime) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Booking Request</h1>
        <p className="mb-6">No time slot was selected. Please go back and select a time slot.</p>
        <Button onClick={() => navigate(`/availability/${userId}`)}>Go Back</Button>
      </div>
    )
  }

  const startDate = new Date(startTime)
  const endDate = new Date(endTime)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Selected Time Slot</h2>
        <p className="text-gray-700">
          <span className="font-medium">Date: </span>
          {startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Time: </span>
          {startDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}{' '}
          -
          {endDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Your Information</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Initial Consultation"
              {...register('title')}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="inviteeName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="inviteeName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              {...register('inviteeName')}
            />
            {errors.inviteeName && <p className="mt-1 text-sm text-red-600">{errors.inviteeName.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="inviteeEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              id="inviteeEmail"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              {...register('inviteeEmail')}
            />
            {errors.inviteeEmail && <p className="mt-1 text-sm text-red-600">{errors.inviteeEmail.message}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any details you'd like to share"
              {...register('description')}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => navigate(`/availability/${userId}`)}
              className="mr-3 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={bookAppointmentMutation.isPending}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {bookAppointmentMutation.isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>

          {bookAppointmentMutation.isError && (
            <p className="mt-4 text-sm text-red-600">
              {bookAppointmentMutation.error instanceof Error
                ? bookAppointmentMutation.error.message
                : 'Failed to book appointment. Please try again.'}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default BookingForm
