"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import LayoutDashboard from "@/components/LayoutDashboard";
import { getProjects } from "@/services/proyectServices";
import ProjectsTableAdvanced from "@/components/ProyectExtension/TableExtensio";

export default function ProjectPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Ref para evitar el doble fetch causado por React Strict Mode en desarrollo
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return; // evita ejecutar 2 veces
    didRun.current = true;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    setIsAuthenticated(true);

    const fetchProjects = async () => {
      try {
        const data = await getProjects(token);
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando proyectos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <LayoutDashboard>
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Proyectos de Extensión</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <ProjectsTableAdvanced projects={projects} loading={loading} />
      </div>
    </LayoutDashboard>
  );
}
