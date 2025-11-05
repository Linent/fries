// utils/auth.ts
import { jwtDecode } from "jwt-decode";


interface TokenPayload {
  _id: string;
  role: string;
  exp: number;
  name: string;
}

export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false; // No está logueado, pero no consideramos el token expirado

  try {
    const { exp } = jwtDecode<TokenPayload>(token);
    return exp * 1000 < Date.now(); // true si expiró
  } catch (error) {
    console.error("Token inválido o malformado", error);
    return true;
  }
};

export function getTokenPayload(): TokenPayload | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}
