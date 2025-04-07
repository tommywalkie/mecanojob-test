import { useMutation } from "@tanstack/react-query";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Login hook - handles user authentication
 */
export const useLogin = () => {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (data) => {
      setAuth(data.access_token || data.token, data.user || data);
      navigate("/dashboard");
    },
  });
};
