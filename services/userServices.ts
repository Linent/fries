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
export const fetchDeans = async () => {
  const response = await api.get(`${BACKEND_URL}/${UserPath}/deans`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};
export const getUsers = async (q?: string, role?: string) => {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (role) params.append("role", role);

  const url = `${BACKEND_URL}/${UserPath}/query/?${params.toString()}`;

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
    }
  );

  return response.data;
};

export const registerDocente = async (userData: UserDocente) => {
  const response = await api.post(
    `${BACKEND_URL}/${UserPath}/register`,
    userData,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};
export const getUserById = async (userId: string) => {
  const response = await api.get(`${BACKEND_URL}/${UserPath}/${userId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};
export const updateUser = async (userId: string, userData: Partial<IUser>) => {
  const response = await api.put(
    `${BACKEND_URL}/${UserPath}/${userId}`,
    userData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.put(`${BACKEND_URL}/${UserPath}/${userId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateUserProfileImage = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.put(
    `${BACKEND_URL}/${UserPath}/${userId}/profile-image`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
