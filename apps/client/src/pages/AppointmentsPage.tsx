import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/Button";
import { useGetAppointments } from "@/hooks/useGetAppointments";
import { useUpdateAppointment } from "@/hooks/useUpdateAppointment";
import { AppointmentStatus, AppointmentResponse } from "@/types";

export const AppointmentsPage = () => {
  const { data: appointments, isLoading, error } = useGetAppointments();
  const updateAppointmentMutation = useUpdateAppointment();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingAppointment, setEditingAppointment] = useState<string | null>(
    null
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Filter appointments based on selected status
  const filteredAppointments = appointments?.filter((appointment) => {
    if (statusFilter === "all") return true;
    return appointment.status === statusFilter;
  });

  // Count appointments by status
  const getStatusCounts = (appointments: AppointmentResponse[] | undefined) => {
    if (!appointments)
      return { pending: 0, confirmed: 0, canceled: 0, completed: 0 };

    return appointments.reduce(
      (counts, appointment) => {
        counts[appointment.status] = (counts[appointment.status] || 0) + 1;
        return counts;
      },
      { pending: 0, confirmed: 0, canceled: 0, completed: 0 } as Record<
        string,
        number
      >
    );
  };

  const statusCounts = getStatusCounts(appointments);

  // Handle status change
  const handleStatusChange = (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    updateAppointmentMutation.mutate(
      {
        appointmentId,
        updateData: { status: newStatus },
      },
      {
        onSuccess: () => {
          setEditingAppointment(null);
        },
      }
    );
  };

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case AppointmentStatus.CONFIRMED:
        return "bg-green-100 text-green-800";
      case AppointmentStatus.CANCELED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your upcoming and past appointments
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Status filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              statusFilter === "all"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({appointments?.length || 0})
          </button>
          <button
            onClick={() => setStatusFilter(AppointmentStatus.PENDING)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              statusFilter === AppointmentStatus.PENDING
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending ({statusCounts.pending})
          </button>
          <button
            onClick={() => setStatusFilter(AppointmentStatus.CONFIRMED)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              statusFilter === AppointmentStatus.CONFIRMED
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Confirmed ({statusCounts.confirmed})
          </button>
          <button
            onClick={() => setStatusFilter(AppointmentStatus.CANCELED)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              statusFilter === AppointmentStatus.CANCELED
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Canceled ({statusCounts.canceled})
          </button>
        </div>
      </div>

      {/* Appointments list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            Error loading appointments. Please try again.
          </div>
        ) : filteredAppointments && filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Appointment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.title}
                      </div>
                      {appointment.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {appointment.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(appointment.startDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(appointment.startDate)} -{" "}
                        {formatTime(appointment.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.inviteeName || "No name provided"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.inviteeEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingAppointment === appointment.id ? (
                        <div className="relative">
                          <select
                            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={appointment.status}
                            onChange={(e) =>
                              handleStatusChange(
                                appointment.id,
                                e.target.value as AppointmentStatus
                              )
                            }
                            disabled={updateAppointmentMutation.isPending}
                          >
                            <option value={AppointmentStatus.PENDING}>
                              Pending
                            </option>
                            <option value={AppointmentStatus.CONFIRMED}>
                              Confirmed
                            </option>
                            <option value={AppointmentStatus.CANCELED}>
                              Canceled
                            </option>
                          </select>
                          {updateAppointmentMutation.isPending && (
                            <div className="absolute right-2 top-1">
                              <div className="animate-spin h-4 w-4 border-t-2 border-indigo-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingAppointment === appointment.id ? (
                        <button
                          onClick={() => setEditingAppointment(null)}
                          className="text-gray-500 hover:text-gray-700 ml-2"
                        >
                          Stop Editing
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingAppointment(appointment.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Change Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No appointments found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === "all"
                ? "You don't have any appointments yet."
                : `You don't have any ${statusFilter} appointments.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
