import api from "@/services/axiosInstance";
import { BACKEND_URL } from "@/config";
import { getAuthHeaders } from "@/helpers/authHelper";
import { EntityDTO } from "@/types";
const base = `${BACKEND_URL}/entity`;



export const getEntities = async (q?: string): Promise<EntityDTO[]> => {
  const url = q ? `${base}?q=${encodeURIComponent(q)}` : base;
  const { data } = await api.get(url, { headers: getAuthHeaders() });
  return data;
};

export async function toggleEntityActive(id: string, current: boolean) {
  const { data } = await api.post(`${base}/toggle/${id}`, {}, { headers: getAuthHeaders() });
  return data;
}

export async function getAllEntities() {
  const { data } = await api.get(`${base}/all`, { headers: getAuthHeaders() });
  return data;
}

export const createEntity = async (payload: {
  name: string;
  nit: string;
  typeEntity: string;
  sector?: string;
  representative?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
}) => {
  const { data } = await api.post(base, payload, { headers: getAuthHeaders() });
  return data;
};

export const updateEntity = async (id: string, payload: Partial<EntityDTO>): Promise<EntityDTO> => {
  const { data } = await api.put(`${base}/${id}`, payload, { headers: getAuthHeaders() });
  return data;
};

export const deleteEntity = async (id: string): Promise<{ ok: boolean }> => {
  const { data } = await api.delete(`${base}/${id}`, { headers: getAuthHeaders() });
  return data;
};
