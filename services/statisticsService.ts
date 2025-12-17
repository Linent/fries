// src/services/statisticsService.ts
import api from "@/services/axiosInstance";// o donde tengas tu instancia axios
import { BACKEND_URL } from "@/config";
import { getAuthHeaders } from "@/helpers/authHelper";

export interface ProjectByFaculty {
  facultyId: string;
  facultyName: string;
  total: number;
}

export interface ProjectStats {
  totalProjects: number;
  byType: Record<string, number>;
  byStatus: { status: string; total: number }[];
  byYear: { year: number; total: number }[];
  byFaculty: ProjectByFaculty[];
  byPopulation: { population: string; total: number }[];
}

export interface UserStats {
  totalUsers: number;
  byRole: Record<string, number>;
}

export interface ParticipantStats {
  totalParticipantsUnique: number;
  studentsUnique: number;
  teachersUnique: number;
  participationRate: number; // 0–1
}

export interface DashboardStats {
  projects: ProjectStats;
  users: UserStats;
  participants: ParticipantStats;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get(
    `${BACKEND_URL}/statistics/overview`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
