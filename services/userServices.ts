import api from "@/services/axiosInstance";
import { BACKEND_URL } from "@/config";
import { IUser, UserDocente } from "@/types/";
import { getAuthHeaders } from "@/helpers/authHelper"; // Se mantiene la importación correcta

const UserPath = "user";

export const fetchUsers = async () => {
  const response = await api.get(`${BACKEND_URL}/${UserPath}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};
export const getUsers = async (q?: string, role?: string) => {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (role) params.append("role", role);

  const url = `${BACKEND_URL}/${UserPath}?${params.toString()}`;

  const response = await api.get(url, { headers: getAuthHeaders() });
  return response.data; // <== Esto devuelve el array directamente
};


export const loginUser = async (email: string, password: string) => {
  const response = await api.post(`${BACKEND_URL}/${UserPath}/login`, {
    email,
    password,
  });
  return response.data; // debe incluir { token, user }
};

export const registerUser = async (userData: IUser) => {
  const response = await api.post(
    `${BACKEND_URL}/${UserPath}/register`,
    userData,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};

export const registerDocente = async (userData: UserDocente) => {
  const response = await api.post(
    `${BACKEND_URL}/${UserPath}/register`,
    userData,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};
export const getUserById = async (userId: string) => {
  const response = await api.get(`${BACKEND_URL}/${UserPath}/${userId}`, {
    headers: getAuthHeaders(),  
  });

  return response.data;
  }
export const updateUser = async (userId: string, userData: Partial<IUser>) => {
  const response = await api.put(
    `${BACKEND_URL}/${UserPath}/${userId}`,
    userData,
    {
      headers: getAuthHeaders(),
    },
  ); 
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`${BACKEND_URL}/${UserPath}/${userId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};