import { useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { useGetAvailability } from "@/hooks/useGetAvailability";
import { useUpdateAvailability } from "@/hooks/useUpdateAvailability";
import { DayOfWeek, AvailabilityResponse, TimeSlot } from "@/types";
import { Link } from "react-router-dom";
import { DAY_NAMES, formatTime } from "@/utils/date-utils";

const timeSlotSchema = z
  .object({
    day: z.enum([
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY,
    ]),
    startHour: z.number().min(0).max(23),
    startMinute: z.number().min(0).max(59),
    endHour: z.number().min(0).max(23),
    endMinute: z.number().min(0).max(59),
  })
  .refine(
    (data) => {
      // Check if end time is after start time
      if (data.endHour < data.startHour) return false;
      if (data.endHour === data.startHour && data.endMinute <= data.startMinute)
        return false;
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endHour"],
    }
  );

const formSchema = z.object({
  timeSlots: z.array(timeSlotSchema),
});

type FormValues = z.infer<typeof formSchema>;

function AvailabilityPage() {
  const { data: existingAvailability, isLoading } = useGetAvailability();
  const updateAvailabilityMutation = useUpdateAvailability();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeSlots: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "timeSlots",
  });

  // Convert API response to form data
  useEffect(() => {
    if (existingAvailability) {
      reset({
        timeSlots: existingAvailability.map((item: AvailabilityResponse) => ({
          day: item.day,
          startHour: item.startHour,
          startMinute: item.startMinute,
          endHour: item.endHour,
          endMinute: item.endMinute,
        })),
      });
    }
  }, [existingAvailability, reset]);

  const onSubmit = (data: FormValues) => {
    updateAvailabilityMutation.mutate(data.timeSlots as TimeSlot[]);
  };

  const addTimeSlot = () => {
    append({
      day: DayOfWeek.MONDAY,
      startHour: 9,
      startMinute: 0,
      endHour: 17,
      endMinute: 0,
    });
  };

  // Group availabilities by day for better display
  const availabilityByDay =
    existingAvailability?.reduce(
      (acc, slot) => {
        if (!acc[slot.day]) {
          acc[slot.day] = [];
        }
        acc[slot.day].push(slot);
        return acc;
      },
      {} as Record<string, AvailabilityResponse[]>
    ) || {};

  // Sort days of the week
  const daysOrder: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];
  const sortedDays = Object.keys(availabilityByDay).sort(
    (a, b) =>
      daysOrder.indexOf(a as DayOfWeek) - daysOrder.indexOf(b as DayOfWeek)
  ) as DayOfWeek[];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Availability Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your availability and share your booking page with others.
          </p>
        </div>

        <Link to="/dashboard">
          <Button className="mb-8">Back to Dashboard</Button>
        </Link>

        {/* Current Availability Overview */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Current Availability
            </h2>
            <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
              {existingAvailability?.length || 0} Time Slots
            </span>
          </div>

          {existingAvailability?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {sortedDays.map((day) => (
                <div
                  key={day}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {DAY_NAMES[day]}
                  </h3>
                  <ul className="space-y-1">
                    {availabilityByDay[day]
                      .sort((a, b) => {
                        if (a.startHour !== b.startHour) {
                          return a.startHour - b.startHour;
                        }
                        return a.startMinute - b.startMinute;
                      })
                      .map((slot, idx) => (
                        <li key={idx} className="text-sm text-gray-600">
                          {formatTime(slot.startHour, slot.startMinute)} -{" "}
                          {formatTime(slot.endHour, slot.endMinute)}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You haven't set any availability yet. Add time slots below.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Availability Form */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Availability
            </h2>
            <Button
              type="button"
              onClick={addTimeSlot}
              className="bg-indigo-600 text-white"
            >
              Add Time Slot
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No time slots added yet. Click "Add Time Slot" to begin.
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">
                        Time Slot #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Day
                        </label>
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          {...register(`timeSlots.${index}.day`)}
                        >
                          {Object.entries(DAY_NAMES).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        {errors.timeSlots?.[index]?.day && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.timeSlots[index]?.day?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <div className="flex mt-1">
                          <div className="w-1/2 pr-1">
                            <select
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...register(`timeSlots.${index}.startHour`, {
                                valueAsNumber: true,
                              })}
                            >
                              {Array.from({ length: 24 }).map((_, hour) => (
                                <option key={hour} value={hour}>
                                  {hour.toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-1/2 pl-1">
                            <select
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...register(`timeSlots.${index}.startMinute`, {
                                valueAsNumber: true,
                              })}
                            >
                              {[0, 15, 30, 45].map((minute) => (
                                <option key={minute} value={minute}>
                                  {minute.toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {(errors.timeSlots?.[index]?.startHour ||
                          errors.timeSlots?.[index]?.startMinute) && (
                          <p className="mt-1 text-sm text-red-600">
                            Invalid start time
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <div className="flex mt-1">
                          <div className="w-1/2 pr-1">
                            <select
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...register(`timeSlots.${index}.endHour`, {
                                valueAsNumber: true,
                              })}
                            >
                              {Array.from({ length: 24 }).map((_, hour) => (
                                <option key={hour} value={hour}>
                                  {hour.toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-1/2 pl-1">
                            <select
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...register(`timeSlots.${index}.endMinute`, {
                                valueAsNumber: true,
                              })}
                            >
                              {[0, 15, 30, 45].map((minute) => (
                                <option key={minute} value={minute}>
                                  {minute.toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {(errors.timeSlots?.[index]?.endHour ||
                          errors.timeSlots?.[index]?.endMinute) && (
                          <p className="mt-1 text-sm text-red-600">
                            Invalid end time
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                disabled={updateAvailabilityMutation.isPending}
                className="bg-indigo-600 text-white"
              >
                {updateAvailabilityMutation.isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Availability"
                )}
              </Button>
            </div>

            {updateAvailabilityMutation.isSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Your availability has been saved successfully!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AvailabilityPage;
