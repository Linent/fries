import api from "@/services/axiosInstance";
import { BACKEND_URL } from "@/config";
import { getAuthHeaders } from "@/helpers/authHelper";

const projectsPath = "project";
export const getProjects = async (token: string) => {
  try {
    const response = await api.get(`${BACKEND_URL}/${projectsPath}`, {
      headers: getAuthHeaders()
      ,
    });
    return response.data; // Asegúrate de que el backend devuelve un array de proyectos
  } catch (error: any) {
    console.error("Error al obtener los proyectos:", error);
    throw new Error(error.response?.data?.message || "Error al obtener proyectos");
  }
};

export const createProject = async (projectData: any) => {
  try {
    const response = await api.post(`${BACKEND_URL}/${projectsPath}`, projectData, {
      headers: getAuthHeaders()
      ,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error al crear el proyecto:", error);
    throw new Error(error.response?.data?.message || "Error al crear proyecto");
  } 
};

export const getProjectById = async (id: string) => {
  try {
    const response = await api.get(`${BACKEND_URL}/${projectsPath}/${id}`, {
      headers: getAuthHeaders()
      ,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener el proyecto:", error);
    throw new Error(error.response?.data?.message || "Error al obtener proyecto");
  }
};

export const updateProject = async (id: string, projectData: any) => {
  try {
    const response = await api.put(`${BACKEND_URL}/${projectsPath}/${id}`, projectData, {
      headers: getAuthHeaders()
      ,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error al actualizar el proyecto:", error);
    throw new Error(error.response?.data?.message || "Error al actualizar proyecto");
  }
};

export const updateProjectStatus = async (id: string, status: string) => {
  try {
    const response = await api.patch(`${BACKEND_URL}/${projectsPath}/${id}/status`, { status }, {
      headers: getAuthHeaders()
      ,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error al actualizar el estado del proyecto:", error);
    throw new Error(error.response?.data?.message || "Error al actualizar estado del proyecto");
  }
};