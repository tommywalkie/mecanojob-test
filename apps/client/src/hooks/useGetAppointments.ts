import { useQuery } from "@tanstack/react-query";
import { AppointmentResponse } from "@/types";

const API_URL = `${import.meta.env.VITE_API_URL}/api/appointments`;

/**
 * Fetches all appointments for the current user
 */
const getAppointments = async (): Promise<AppointmentResponse[]> => {
  const token = localStorage.getItem("token");

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return response.json();
};

/**
 * Hook to get the current user's appointments
 */
export const useGetAppointments = () => {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  });
};
