import { useMutation } from "@tanstack/react-query";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Signup hook - handles user registration
 */
export const useSignup = () => {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => register(name, email, password),
    onSuccess: (data) => {
      setAuth(data.access_token || data.token, data.user || data);
      navigate("/dashboard");
    },
  });
};
