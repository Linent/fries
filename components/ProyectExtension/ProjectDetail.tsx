"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Tabs,
  Tab,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Alert,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import {
  getProjectById,
  updateProject,
  updateProjectStatus,
} from "@/services/proyectServices";
import { getTokenPayload } from "@/utils/auth";
import { Project } from "@/types";

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  const user = getTokenPayload();
  const role = user?.role || "";
  const userId = user?.id;

  type StatusKey =
    | "en_formulacion"
    | "en_revision_director"
    | "en_revision_decano"
    | "en_revision_fries"
    | "aprobado"
    | "rechazado";

  const STATUS_LABEL: Record<StatusKey, string> = {
    en_formulacion: "En formulación",
    en_revision_director: "En revisión (Director)",
    en_revision_decano: "En revisión (Decano)",
    en_revision_fries: "En revisión (FRIES)",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
  };

  const NEXT_STATUS_BY_ROLE: Record<string, Record<string, string[]>> = {
    formulador: { en_formulacion: ["en_revision_director"] },
    director_programa: {
      en_revision_director: ["en_revision_decano", "en_formulacion"],
    },
    decano: {
      en_revision_decano: ["en_revision_fries", "en_revision_director"],
    },
    fries: { en_revision_fries: ["aprobado", "rechazado", "en_formulacion"] },
    vicerrector: { en_revision_fries: ["aprobado", "rechazado"] },
    admin: {
      en_formulacion: [
        "en_revision_director",
        "en_revision_decano",
        "en_revision_fries",
        "aprobado",
        "rechazado",
      ],
    },
  };

  const canEdit = (project: Project, role: string, userId?: string) => {
    if (role === "administrador") return true;
    if (role === "fries") return project.status === "en_formulacion";
    if (role === "formulador")
      return (
        project.status === "en_formulacion" &&
        ((typeof project.createdBy === "object" &&
          project.createdBy !== null &&
          " _id" in project.createdBy &&
          (project.createdBy as { _id: string })._id === userId) ||
          (typeof project.createdBy === "string" &&
            project.createdBy === userId))
      );
    return false;
  };

  // 🔹 Cargar el proyecto
  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      try {
        const data = await getProjectById(projectId);
        setProject(data);
        setForm({
          title: data.title,
          code: data.code,
          description: data.description || "",
          typeProject: (data as any).typeProject || "",
          year: (data as any).year || new Date().getFullYear(),
          semester: (data as any).semester || "",
        });
      } catch (error) {
        console.error("Error al cargar proyecto:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const editable = useMemo(
    () => (project ? canEdit(project, role, userId) : false),
    [project, role, userId]
  );
  const statusOptions = useMemo(
    () => (project ? NEXT_STATUS_BY_ROLE[role]?.[project.status] || [] : []),
    [project, role]
  );

  const handleChange = (key: keyof Project, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleChangeStatus = async (status: string) => {
    if (!project) return;
    setSaving(true);
    try {
      const updated = await updateProjectStatus(project._id!, status);
      setProject(updated);
      setMessage({
        type: "success",
        text: "Estado actualizado correctamente.",
      });
    } catch {
      setMessage({ type: "danger", text: "Error al cambiar el estado." });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      const updated = await updateProject(project._id!, form);
      setProject(updated);
      setMessage({
        type: "success",
        text: "Proyecto actualizado correctamente.",
      });
    } catch {
      setMessage({ type: "danger", text: "Error al guardar los cambios." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner color="primary" label="Cargando proyecto..." />
      </div>
    );
  }

  if (!project) {
    return <Alert color="danger">No se encontró el proyecto solicitado.</Alert>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">{project.title}</h1>
        <div className="flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" disabled={!statusOptions.length}>
                Cambiar estado
              </Button>
            </DropdownTrigger>
            <DropdownMenu onAction={(key) => handleChangeStatus(String(key))}>
              {statusOptions.map((status) => (
                <DropdownItem key={status}>
                  {STATUS_LABEL[status as StatusKey]}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button variant="bordered" onClick={() => router.push("/extension")}>
            Volver
          </Button>
        </div>
      </div>

      {message && <Alert color={message.type}>{message.text}</Alert>}

      <Tabs aria-label="Detalles del proyecto" color="primary">
        <Tab key="general" title="General">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Título"
              value={form.title || ""}
              onValueChange={(v) => handleChange("title", v)}
              disabled={!editable}
            />
            <Input label="Código" value={form.code || ""} disabled />
            <Select
              label="Tipo de proyecto"
              selectedKeys={
                form.typeProject ? new Set([form.typeProject]) : new Set()
              }
              onChange={(e) =>
                handleChange("typeProject" as any, e.target.value)
              }
              disabled={!editable}
            >
              <SelectItem key="Remunerado">Remunerado</SelectItem>
              <SelectItem key="Solidario">Solidario</SelectItem>
            </Select>
            <Input
              label="Año"
              type="number"
              value={String(form.year || "")}
              onValueChange={(v) => handleChange("year" as any, v)}
              disabled={!editable}
            />
            <Select
              label="Semestre"
              selectedKeys={
                form.semester ? new Set([form.semester]) : new Set()
              }
              onChange={(e) => handleChange("semester" as any, e.target.value)}
              disabled={!editable}
            >
              <SelectItem key="Primero">Primero</SelectItem>
              <SelectItem key="Segundo">Segundo</SelectItem>
            </Select>
            <Textarea
              label="Descripción"
              value={form.description || ""}
              onValueChange={(v) => handleChange("description", v)}
              minRows={4}
              disabled={!editable}
              className="md:col-span-2"
            />
          </div>

          {editable && (
            <div className="mt-6 flex justify-end">
              <Button color="primary" isLoading={saving} onPress={handleSave}>
                Guardar cambios
              </Button>
            </div>
          )}
        </Tab>

        <Tab key="documentos" title="Documentos">
          <p className="p-4 text-gray-600">
            Gestión de documentos (pendiente de implementación)
          </p>
        </Tab>

        <Tab key="comentarios" title="Comentarios">
          <p className="p-4 text-gray-600">
            Sección de comentarios (pendiente de implementación)
          </p>
        </Tab>
      </Tabs>
    </div>
  );
}
