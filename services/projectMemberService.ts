import api from "@/services/axiosInstance";
import { BACKEND_URL } from "@/config";
import { getAuthHeaders } from "@/helpers/authHelper";

const base = `${BACKEND_URL}/project-members`;

export const getProjectMembers = async (projectId: string) => {
  const url = `${base}/${projectId}`;
  const response = await api.get(url, { headers: getAuthHeaders() });
  console.log("🔵 getProjectMembers() response:", response.data);
  return response.data;
};

export const addProjectMember = async (payload: {
  project: string;
  user: string;
  roleInProject: "director" | "coautor" | "estudiante";
}) => {
  const { data } = await api.post(base, payload, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const deleteProjectMember = async (
  projectId: string,
  role: string,
  userId: string
) => {
  const { data } = await api.delete(`${base}/${projectId}/${role}/${userId}`, {
    headers: getAuthHeaders(),
  });
  return data;
};
