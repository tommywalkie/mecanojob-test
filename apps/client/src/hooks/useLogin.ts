import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Login hook - handles user authentication
 */
export const useLogin = () => {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAuth(data.access_token || data.token, data.user || data);
      navigate("/dashboard");
    },
  });
};
