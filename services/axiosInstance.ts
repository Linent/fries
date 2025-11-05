// services/axiosInstance.ts
import axios from "axios";
import { BACKEND_URL } from "@/config";

const api = axios.create({
  baseURL: BACKEND_URL,
});

// Agrega el token a cada solicitud si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta para detectar token expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/"; // redirigir automáticamente
    }

    return Promise.reject(error);
  }
);

export default api;
