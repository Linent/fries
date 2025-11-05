"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutDashboard from "@/components/LayoutDashboard";

export default function DashboardView() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.replace("/");
    } else {
      setIsAuthenticated(true);
      setUserRole(role);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Verificando autenticación...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <LayoutDashboard>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Proyectos formulados
        </h1>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600">
            Aquí irá la tabla de proyectos o las estadísticas de los proyectos
            formulados...
          </p>
        </div>
      </div>
    </LayoutDashboard>
  );
}
