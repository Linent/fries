import { Faculty } from "../types/types";
import api from "@/services/axiosInstance";

import { BACKEND_URL } from "@/config";
import { getAuthHeaders } from "@/helpers/authHelper";

const facultyPath = "faculty";

export const getFaculties = async (): Promise<Faculty[]> => {
  try {
    const response = await api.get(`${BACKEND_URL}/${facultyPath}`, {
      headers: getAuthHeaders(),
    });
    return response.data; // Asegúrate de que el backend devuelve un array de facultades
  } catch (error: any) {
    console.error("Error al obtener las facultades:", error);
    throw new Error(
      error.response?.data?.message || "Error al obtener facultades"
    );
  }
};

export const createFaculty = async (
  facultyData: Partial<Faculty>
): Promise<Faculty> => {
  try {
    const response = await api.post(
      `${BACKEND_URL}/${facultyPath}`,
      facultyData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al crear la facultad:", error);
    throw new Error(error.response?.data?.message || "Error al crear facultad");
  }
};
export const updateFaculty = async (
  id: string,
  facultyData: Partial<Faculty>
): Promise<Faculty> => {
  try {
    const response = await api.put(
      `${BACKEND_URL}/${facultyPath}/${id}`,
      facultyData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al actualizar la facultad:", error);
    throw new Error(
      error.response?.data?.message || "Error al actualizar facultad"
    );
  }
};

export const deleteFaculty = async (id: string) => {
  const response = await api.delete(`${BACKEND_URL}/${facultyPath}/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const toggleFacultyActive = async (id: string): Promise<any> => {
  try {
    const response = await api.post(
      `${BACKEND_URL}/${facultyPath}/toggle/${id}`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al cambiar estado de la facultad:", error);
    throw new Error(error.response?.data?.message || "Error al cambiar estado");
  }
};
