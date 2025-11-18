"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getProjectById } from "@/services/proyectServices";
import TabsProject from "@/components/ProyectExtension/ProjectTabs";
import { Spinner } from "@heroui/react";
import LayoutDashboard from "@/components/LayoutDashboard";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams(); // 👈 MUCHÍSIMO MEJOR
  const searchParams = useSearchParams();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  const didRun = useRef(false);

  const projectId = typeof params?.id === "string" ? params.id : null;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const modeParam = searchParams?.get("mode");
    setMode(modeParam === "edit" ? "edit" : "view");
  }, [searchParams]);

  // 🔄 Obtener proyecto
  useEffect(() => {
    if (!projectId) return;
    if (didRun.current) return;
    didRun.current = true;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getProjectById(projectId);
        setProject(data);
      } catch (error) {
        console.error("Error cargando proyecto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading)
    return (
      <LayoutDashboard>
        <div className="flex justify-center items-center h-96">
          <Spinner color="danger" label="Cargando proyecto..." />
        </div>
      </LayoutDashboard>
    );

  if (!project)
    return (
      <LayoutDashboard>
        <div className="p-8 text-center text-gray-600">
          No se encontró el proyecto solicitado.
        </div>
      </LayoutDashboard>
    );

  return (
  <LayoutDashboard headerTitle={project.title}>
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {mode === "edit" ? "Editar proyecto" : "Detalle del proyecto"}
      </h1>

      <TabsProject project={project} editable={mode === "edit"} />
    </div>
  </LayoutDashboard>
);
}
