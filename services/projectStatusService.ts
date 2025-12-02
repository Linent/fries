import api from "@/services/axiosInstance";
import { BACKEND_URL } from "@/config";
import { getAuthHeaders } from "@/helpers/authHelper";
const projectsPath = "project";
export const changeProjectStatus = async (
  projectId: string,
  nextStatus: string
) => {
  const { data } = await api.put(
    `${BACKEND_URL}/${projectsPath}/${projectId}/change-status`,
    { nextStatus },
    { headers: getAuthHeaders() }
  );

  return data;
};
