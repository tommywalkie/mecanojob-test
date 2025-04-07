import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePublicAvailability } from "@/hooks/usePublicAvailability";
import { AvailabilityResponse, DayOfWeek, BookedSlot } from "@/types";
import {
  JS_DAY_TO_DAY_OF_WEEK,
  groupAvailabilitiesByDay,
} from "@/utils/date-utils";

// Day mapping helper
const DAY_MAP: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

function PublicAvailability() {
  const { userId } = useParams<{ userId: string }>();
  const {
    data: availabilities,
    isLoading,
    error,
  } = usePublicAvailability(userId || "");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<
    { start: Date; end: Date }[]
  >([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const navigate = useNavigate();

  // Group availabilities by day - memoized to prevent recalculation
  const availabilityByDay = useMemo(
    () => groupAvailabilitiesByDay(availabilities || []),
    [availabilities]
  );

  // Generate dates for next 14 days that have availability
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayString = JS_DAY_TO_DAY_OF_WEEK[date.getDay()];

      // If we have availability for this day, add it
      if (availabilityByDay[dayString]?.length > 0) {
        dates.push(date);
      }
    }

    return dates;
  }, [availabilityByDay]);

  // Fetch booked slots
  useEffect(() => {
    if (userId) {
      fetch(`${import.meta.env.VITE_API_URL}/availabilities/users/${userId}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => data && setBookedSlots(data.bookedSlots || []));
    }
  }, [userId]);

  // Update available times when date changes
  useEffect(() => {
    if (selectedDate) {
      setAvailableTimes(generateTimeSlots(selectedDate));
    }
  }, [selectedDate, availabilities]);

  // Generate available time slots for the selected date
  const generateTimeSlots = (date: Date) => {
    if (!date) return [];

    const dayString = DAY_MAP[date.getDay()];
    const dayAvailability = availabilityByDay[dayString] || [];

    return dayAvailability.map((slot: AvailabilityResponse) => {
      const { startHour, startMinute, endHour, endMinute } = slot;

      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      return { start: startTime, end: endTime };
    });
  };

  // Check if a time slot is already booked
  const isTimeSlotBooked = (start: Date, end: Date) => {
    if (!bookedSlots?.length) return false;

    return bookedSlots.some((slot) => {
      const bookedStart = new Date(slot.startDate);
      const bookedEnd = new Date(slot.endDate);

      // Check for any overlap between the slots
      return (
        (start >= bookedStart && start < bookedEnd) ||
        (end > bookedStart && end <= bookedEnd) ||
        (start <= bookedStart && end >= bookedEnd)
      );
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (start: Date, end: Date) => {
    if (!userId) return;
    navigate(`/book/${userId}`, {
      state: {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
    });
  };

  // Helper for consistent time formatting
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading)
    return <div className="text-center mt-10">Loading availability...</div>;

  if (error)
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading availability
      </div>
    );

  if (!availabilities?.length) {
    return (
      <div className="text-center mt-10">
        No availability found for this user.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select a Date</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {availableDates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className={`p-2 rounded border ${
                selectedDate?.toDateString() === date.toDateString()
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "hover:bg-gray-100 border-gray-300"
              }`}
            >
              <div className="text-sm">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="font-semibold">{date.getDate()}</div>
              <div className="text-xs">
                {date.toLocaleDateString("en-US", { month: "short" })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Available Times for{" "}
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>

          {!availableTimes.length ? (
            <p>No available times for this date.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableTimes.map((slot, index) => {
                const slotDate = `${selectedDate.toDateString()}`;
                const slotStart = new Date(
                  `${slotDate} ${formatTime(slot.start)}`
                );
                const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
                const isBooked = isTimeSlotBooked(slotStart, slotEnd);

                return (
                  <button
                    key={index}
                    onClick={() =>
                      !isBooked && handleTimeSelect(slot.start, slot.end)
                    }
                    className={`
                      p-3 border border-gray-300 rounded text-center
                      ${
                        isBooked
                          ? "bg-gray-200 hover:bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }
                    `}
                  >
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PublicAvailability;
