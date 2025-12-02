// services/ programService.ts
import api from "@/services/axiosInstance";
import { BACKEND_URL } from "@/config";
import { getAuthHeaders } from "@/helpers/authHelper";

const programsPath = "programs";
// ===============================
// Obtener todos los programas
// ===============================
export const getPrograms = async () => {
  const res = await api.get(`${BACKEND_URL}/${programsPath}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
export const getProgramsByFaculty = async (facultyId: string) => {
  const { data } = await api.get(
    `${BACKEND_URL}/${programsPath}/faculty/${facultyId}`,
    { headers: getAuthHeaders() }
  );
  return data;
};
// ===============================
// Obtener uno por ID
// ===============================
export const getProgramById = async (id: string) => {
  const res = await api.get(`${BACKEND_URL}/${programsPath}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ===============================
// Crear programa
// ===============================
export const createProgram = async (data: any) => {
  const res = await api.post(`${BACKEND_URL}/${programsPath}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ===============================
// Actualizar programa
// ===============================
export const updateProgram = async (id: string, data: any) => {
  const res = await api.put(`${BACKEND_URL}/${programsPath}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ===============================
// Eliminar programa
// ===============================
export const deleteProgram = async (id: string) => {
  const res = await api.delete(`${BACKEND_URL}/${programsPath}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ===============================
// Asignar director
// ===============================
export const assignDirector = async (programId: string, directorId: string) => {
  const res = await api.put(
    `${BACKEND_URL}/${programsPath}/${programId}/director`,
    { directorId },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// ===============================
// Asignar programa a un proyecto
// ===============================
export const assignProgramToProject = async (
  programId: string,
  projectId: string
) => {
  const res = await api.put(
    `${BACKEND_URL}/${programsPath}/${programId}/project/${projectId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
};
