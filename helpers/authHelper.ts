import { jwtDecode } from "jwt-decode";

export const isTokenExpired = () => {
  const token = localStorage.getItem("token");

  if (!token) return true;

  try {
    const decoded: { exp: number } = jwtDecode(token);

    return decoded.exp < Date.now() / 1000; // Verifica si ya expiró
  } catch (error) {
    return true; // Si el token no es válido, considerarlo expirado
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
};
