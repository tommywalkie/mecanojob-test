import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'

function BookingConfirmation() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled.</p>
      </div>

      <Link to="/">
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Return to Homepage</Button>
      </Link>
    </div>
  )
}

export default BookingConfirmation
