import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { AvailabilityResponse } from "@/types";

const API_URL = `${import.meta.env.VITE_API_URL}/api/availabilities`;

/**
 * Fetches the user's availability settings
 */
const getUserAvailability = async (
  token: string
): Promise<AvailabilityResponse[]> => {
  const response = await fetch(`${API_URL}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch availability");
  }

  return response.json();
};

/**
 * Hook to get user's availability data
 */
export const useGetAvailability = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["availability"],
    queryFn: () => getUserAvailability(token as string),
    enabled: !!token, // Only run query if user is authenticated
  });
};
