import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useGetAvailability } from '@/hooks/useGetAvailability'
import { DayOfWeek } from '@/types'
import { useGetAppointments } from '@/hooks/useGetAppointments'
import { DAY_NAMES, formatTime, groupAvailabilitiesByDay, sortDays } from '@/utils/date-utils'

const Dashboard = () => {
  const { user } = useAuth()
  const { data: availabilities, isLoading: isLoadingAvailability } = useGetAvailability()
  const { data: appointments, isLoading: isLoadingAppointments } = useGetAppointments()
  const [copied, setCopied] = useState(false)

  // Group availabilities by day
  const availabilityByDay = groupAvailabilitiesByDay(availabilities || [])

  // Get sorted days
  const sortedDays = sortDays(Object.keys(availabilityByDay))

  // Get the public booking URL
  const getPublicUrl = () => {
    if (!user || !user.id) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/availability/${user.id}`
  }

  const publicUrl = getPublicUrl()

  const copyToClipboard = () => {
    if (!publicUrl) return

    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  // Get pending appointments count
  const pendingAppointments = appointments?.filter((appointment) => appointment.status === 'pending') || []

  const confirmedAppointments = appointments?.filter((appointment) => appointment.status === 'confirmed') || []

  const possibleAppointments =
    appointments?.filter((appointment) => appointment.status === 'pending' || appointment.status === 'confirmed') || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Welcome back, {user?.email}</h2>
              <p className="text-indigo-100 mt-1">Manage your availabilities and appointments</p>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="bg-indigo-50 rounded-lg p-4 flex-1 min-w-[150px]">
                  <div className="text-indigo-500 text-sm font-medium mb-1">Availabilities</div>
                  <div className="text-2xl font-bold">{availabilities?.length || 0}</div>
                  <div className="text-gray-500 text-xs mt-1">Total time slots</div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 flex-1 min-w-[150px]">
                  <div className="text-yellow-600 text-sm font-medium mb-1">Pending</div>
                  <div className="text-2xl font-bold">{pendingAppointments.length}</div>
                  <div className="text-gray-500 text-xs mt-1">Appointments to review</div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4 flex-1 min-w-[150px]">
                  <div className="text-emerald-600 text-sm font-medium mb-1">Upcoming</div>
                  <div className="text-2xl font-bold">{confirmedAppointments?.length || 0}</div>
                  <div className="text-gray-500 text-xs mt-1">Future appointments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Public URL Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Your Public Booking URL</h3>
            {publicUrl ? (
              <>
                <div className="flex items-center mb-3">
                  <div className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 rounded-l-md truncate text-sm">
                    {publicUrl}
                  </div>
                  <button
                    className={`px-4 py-2 rounded-r-md text-sm font-medium ${
                      copied ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    onClick={copyToClipboard}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View your public booking page
                </a>
              </>
            ) : (
              <p className="text-sm text-gray-500">Loading your public URL...</p>
            )}
          </div>

          {/* Availabilities Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Your Availabilities</h3>
              <Link to="/availability">
                <Button className="bg-indigo-600 text-white text-sm">Manage Availability</Button>
              </Link>
            </div>

            {isLoadingAvailability ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : availabilities && availabilities.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedDays.map((day) => (
                  <div key={day} className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{DAY_NAMES[day as DayOfWeek]}</h3>
                    <ul className="space-y-1">
                      {availabilityByDay[day]
                        .sort((a, b) => {
                          if (a.startHour !== b.startHour) {
                            return a.startHour - b.startHour
                          }
                          return a.startMinute - b.startMinute
                        })
                        .map((slot, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            {formatTime(slot.startHour, slot.startMinute)} - {formatTime(slot.endHour, slot.endMinute)}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 mx-auto text-gray-300 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500 mt-1">No availabilities set up yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add available time slots to let people book appointments with you.
                </p>
                <Link to="/availability" className="mt-4 inline-block">
                  <Button className="bg-indigo-600 text-white">Add Availability</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:w-96">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Appointments</h3>

            {isLoadingAppointments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : possibleAppointments && possibleAppointments.length > 0 ? (
              <div className="space-y-3">
                {possibleAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(appointment.startDate).toLocaleDateString()} •{' '}
                      {new Date(appointment.startDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(appointment.endDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{appointment.inviteeName || appointment.inviteeEmail}</p>
                  </div>
                ))}

                <Link
                  to="/appointments"
                  className="block text-center text-sm text-indigo-600 hover:text-indigo-800 mt-4"
                >
                  View all appointments
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 mx-auto text-gray-300 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500 mt-1">No upcoming appointments</p>
                <p className="text-sm text-gray-400 mt-1">When people book time with you, it will appear here.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/availability" className="block">
                <Button className="w-full">Manage Availability</Button>
              </Link>
              <Link to="/appointments" className="block">
                <Button className="w-full">View Appointments</Button>
              </Link>
              <Button
                onClick={() => {
                  localStorage.removeItem('token')
                  window.location.href = '/login'
                }}
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
