import api from "@/services/axiosInstance";
import { BACKEND_URL } from "@/config";
import { getAuthHeaders } from "@/helpers/authHelper";
import { ProjectEntityDTO } from "@/types";

const base = `${BACKEND_URL}/project-entity`;

// Lista de entidades vinculadas a un proyecto
export const getProjectEntities = async (projectId: string): Promise<ProjectEntityDTO[]> => {
  const { data } = await api.get(`${base}/${projectId}`, { headers: getAuthHeaders() });
  return data;
};

// Crear vínculo (⚠️ backend espera { project, entity, ... })
export const createProjectEntity = async (payload: {
  project: string;
  entity: string;
  aporteEspecie?: number;
  aporteEfectivo?: number;
}): Promise<ProjectEntityDTO> => {
  const body = {
    ...payload,
    aporteEspecie: Number(payload.aporteEspecie || 0),
    aporteEfectivo: Number(payload.aporteEfectivo || 0),
  };
  const { data } = await api.post(base, body, { headers: getAuthHeaders() });
  return data;
};

export const updateProjectEntity = async (
  id: string,
  payload: Partial<Pick<ProjectEntityDTO, "aporteEspecie" | "aporteEfectivo">>
): Promise<ProjectEntityDTO> => {
  const body = {
    ...payload,
    ...(payload.aporteEspecie !== undefined ? { aporteEspecie: Number(payload.aporteEspecie) } : {}),
    ...(payload.aporteEfectivo !== undefined ? { aporteEfectivo: Number(payload.aporteEfectivo) } : {}),
  };
  const { data } = await api.put(`${base}/${id}`, body, { headers: getAuthHeaders() });
  return data;
};

export const deleteProjectEntity = async (id: string): Promise<{ ok: boolean }> => {
  const { data } = await api.delete(`${base}/${id}`, { headers: getAuthHeaders() });
  return data;
};