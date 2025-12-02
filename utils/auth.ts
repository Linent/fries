import { jwtDecode } from "jwt-decode";

export interface TokenPayload {
  id: string;
  roles: string[]; 
  exp: number;
  name: string;
}

export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const { exp } = jwtDecode<TokenPayload>(token);
    return exp * 1000 < Date.now();
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
