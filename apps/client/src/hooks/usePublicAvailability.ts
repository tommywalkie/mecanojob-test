import { useQuery } from "@tanstack/react-query";
import { AvailabilityResponse } from "@/types";

const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

/**
 * Fetches public availability for a specific user
 */
const getPublicAvailability = async (
  userId: string
): Promise<AvailabilityResponse[]> => {
  const response = await fetch(`${API_URL}/${userId}/availabilities`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch availability");
  }

  return response.json();
};

/**
 * Hook to get a user's public availability data
 */
export const usePublicAvailability = (userId: string) => {
  return useQuery({
    queryKey: ["public-availability", userId],
    queryFn: () => getPublicAvailability(userId),
    enabled: !!userId,
  });
};
