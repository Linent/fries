import api from "@/services/axiosInstance";
import { BACKEND_URL } from "@/config";
import { getAuthHeaders } from "@/helpers/authHelper";

const projectsPath = "project";
export const getProjects = async (token: string) => {
  try {
    const response = await api.get(`${BACKEND_URL}/${projectsPath}`, {
      headers: getAuthHeaders(),
    });
    console.log(response);
    return response.data; // Asegúrate de que el backend devuelve un array de proyectos
  } catch (error: any) {
    console.error("Error al obtener los proyectos:", error);
    throw new Error(
      error.response?.data?.message || "Error al obtener proyectos"
    );
  }
};

export const createProject = async (projectData: any) => {
  try {
    const response = await api.post(
      `${BACKEND_URL}/${projectsPath}`,
      projectData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al crear el proyecto:", error);
    throw new Error(error.response?.data?.message || "Error al crear proyecto");
  }
};

export const getProjectById = async (id: string) => {
  try {
    const response = await api.get(`${BACKEND_URL}/${projectsPath}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener el proyecto:", error);
    throw new Error(
      error.response?.data?.message || "Error al obtener proyecto"
    );
  }
};

export const updateProject = async (id: string, projectData: any) => {
  try {
    const response = await api.put(
      `${BACKEND_URL}/${projectsPath}/${id}`,
      projectData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al actualizar el proyecto:", error);
    throw new Error(
      error.response?.data?.message || "Error al actualizar proyecto"
    );
  }
};

export const updateProjectStatus = async (id: string, status: string) => {
  try {
    const response = await api.patch(
      `${BACKEND_URL}/${projectsPath}/${id}/status`,
      { status },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al actualizar el estado del proyecto:", error);
    throw new Error(
      error.response?.data?.message || "Error al actualizar estado del proyecto"
    );
  }
};

export const uploadProjectDocument = async (
  projectId: string,
  file: File,
  name: string
): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);

  const { data } = await api.post(`${projectsPath}/${projectId}/documents/upload`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/**
 * 📂 Obtener documentos del proyecto
 */
export const getProjectDocuments = async (projectId: string): Promise<any[]> => {
  const { data } = await api.get(`${projectsPath}/${projectId}/documents`, {
    headers: getAuthHeaders(),
  });
  return data;
};

/**
 * 🗑️ Eliminar documento
 */
export const deleteProjectDocument = async (
  projectId: string,
  documentId: string
): Promise<any> => {
  const { data } = await api.delete(`${projectsPath}/${projectId}/documents/${documentId}`, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const updateProjectDocument = async (
  projectId: string,
  documentId: string,
  payload: { name?: string; file?: File }
) => {
  try {
    const formData = new FormData();

    if (payload.name) formData.append("name", payload.name);
    if (payload.file) formData.append("file", payload.file);

    const { data } = await api.put(
      `${projectsPath}/${projectId}/documents/${documentId}`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data;
  } catch (error: any) {
    console.error("Error al actualizar documento:", error);
    throw new Error(
      error.response?.data?.message || "Error al actualizar documento."
    );
  }
};

export const getProjectComments = async (projectId: string) => {
  const { data } = await api.get(
    `${BACKEND_URL}/comments/${projectId}`,
    { headers: getAuthHeaders() }
  );
  return data;
};

export const addProjectComment = async (
  projectId: string,
  text: string,
  visibleToFormulator = true
) => {
  const { data } = await api.post(
    `${BACKEND_URL}/comments/${projectId}`,
    { text, visibleToFormulator },
    { headers: getAuthHeaders() }
  );
  return data;
};

export const updateProjectComment = async (commentId: string, payload: any) => {
  const { data } = await api.put(
    `${BACKEND_URL}/comments/edit/${commentId}`,
    payload,
    { headers: getAuthHeaders() }
  );
  return data;
};

export const deleteProjectComment = async (commentId: string) => {
  const { data } = await api.delete(
    `${BACKEND_URL}/comments/delete/${commentId}`,
    { headers: getAuthHeaders() }
  );
  return data;
};
