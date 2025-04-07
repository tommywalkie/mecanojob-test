import { useMutation } from "@tanstack/react-query";

const API_URL = `${import.meta.env.VITE_API_URL}/api/appointments/book`;

export interface BookAppointmentData {
  userId: string;
  title: string;
  inviteeEmail: string;
  inviteeName?: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}

/**
 * Books an appointment with a user
 */
const bookAppointment = async (data: BookAppointmentData): Promise<any> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to book appointment");
  }

  return response.json();
};

/**
 * Hook to book an appointment with a user
 */
export const useBookAppointment = () => {
  return useMutation({
    mutationFn: bookAppointment,
  });
};
