"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProjectById } from "@/services/proyectServices";
import TabsProject from "@/components/ProyectExtension/ProjectTabs";
import { Spinner } from "@heroui/react";
import LayoutDashboard from "@/components/LayoutDashboard";

export default function ProjectDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  // 🧠 Controla que el useEffect de carga solo se ejecute una vez
  const didRun = useRef(false);

  // 🧭 Obtener ID del proyecto desde la URL
  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = window.location.pathname;
    const idFromPath = path.split("/").pop();
    if (idFromPath) setProjectId(idFromPath);

    const modeParam = searchParams?.get("mode");
    setMode(modeParam === "edit" ? "edit" : "view");
  }, [searchParams]);

  // 🔄 Cargar los datos del proyecto una sola vez
  useEffect(() => {
    if (!projectId) return;
    if (didRun.current) return; // ⛔ evita que se ejecute 2 veces
    didRun.current = true;

    const fetchProject = async () => {
      setLoading(true);
      try {
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

  // 💡 Mostrar spinner mientras carga
  if (loading)
    return (
      <LayoutDashboard>
        <div className="flex justify-center items-center h-96">
          <Spinner color="danger" label="Cargando proyecto..." />
        </div>
      </LayoutDashboard>
    );

  // ❌ Si no existe el proyecto
  if (!project)
    return (
      <LayoutDashboard>
        <div className="p-8 text-center text-gray-600">
          No se encontró el proyecto solicitado.
        </div>
      </LayoutDashboard>
    );

  // ✅ Render del contenido principal
  return (
    <LayoutDashboard>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          {mode === "edit" ? "Editar proyecto" : "Detalle del proyecto"}
        </h1>

        {/* 👇 Tus pestañas principales */}
        <TabsProject project={project} editable={mode === "edit"} />
      </div>
    </LayoutDashboard>
  );
}
