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
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(
    null
  );

  const user = getTokenPayload();
  const roles: string[] = user?.roles || [];
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

  const NEXT_STATUS: Record<string, Record<string, string[]>> = {
    formulador: { en_formulacion: ["en_revision_director"] },
    director_programa: {
      en_revision_director: ["en_revision_decano", "en_formulacion"],
    },
    decano: {
      en_revision_decano: ["en_revision_fries", "en_revision_director"],
    },
    fries: { en_revision_fries: ["aprobado", "rechazado", "en_formulacion"] },
    vicerrector: { en_revision_fries: ["aprobado", "rechazado"] },
    administrador: {
      en_formulacion: [
        "en_revision_director",
        "en_revision_decano",
        "en_revision_fries",
        "aprobado",
        "rechazado",
      ],
    },
  };

  /** -----------------------------------------------------------
   * 🧠 NUEVO: canEdit con roles múltiples
   ----------------------------------------------------------- */
  const canEdit = (project: Project): boolean => {
    if (roles.includes("administrador")) return true;
    if (roles.includes("fries")) return project.status === "en_formulacion";

    if (roles.includes("formulador")) {
      const createdById =
        typeof project.createdBy === "object"
          ? project.createdBy?._id
          : project.createdBy;

      return project.status === "en_formulacion" && createdById === userId;
    }

    return false;
  };

  /** -----------------------------------------------------------
   * 🧠 Estados permitidos según TODOS los roles del usuario
   ----------------------------------------------------------- */
  const statusOptions = useMemo(() => {
    if (!project) return [];

    const finalStatuses = new Set<string>();

    roles.forEach((r) => {
      const next = NEXT_STATUS[r]?.[project.status] || [];
      next.forEach((opt) => finalStatuses.add(opt));
    });

    return Array.from(finalStatuses);
  }, [project, roles]);

  // 🔹 Cargar proyecto
  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      try {
        const data = await getProjectById(projectId);
        setProject(data);
        setForm({
          title: data.title,
          code: data.code,
          description: data.description,
          typeProject: (data as any).typeProject,
          year: (data as any).year,
          semester: (data as any).semester,
        });
      } catch (error) {
        console.error("Error al cargar proyecto:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  const editable = project ? canEdit(project) : false;

  const handleChange = (key: keyof Project, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleChangeStatus = async (status: string) => {
    if (!project) return;
    setSaving(true);

    try {
      const updated = await updateProjectStatus(project._id!, status);
      setProject(updated);
      setMessage({ type: "success", text: "Estado actualizado." });
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
      setMessage({ type: "success", text: "Cambios guardados." });
    } catch {
      setMessage({ type: "danger", text: "Error al guardar cambios." });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner color="primary" label="Cargando proyecto..." />
      </div>
    );

  if (!project)
    return <Alert color="danger">No se encontró el proyecto solicitado.</Alert>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{project.title}</h1>

        <div className="flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" disabled={!statusOptions.length}>
                Cambiar estado
              </Button>
            </DropdownTrigger>

            <DropdownMenu onAction={(key) => handleChangeStatus(String(key))}>
              {statusOptions.map((st) => (
                <DropdownItem key={st}>{STATUS_LABEL[st as StatusKey]}</DropdownItem>
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
              selectedKeys={form.typeProject ? new Set([form.typeProject]) : new Set()}
              onChange={(e) => handleChange("typeProject" as any, e.target.value)}
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
              selectedKeys={form.semester ? new Set([form.semester]) : new Set()}
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
          <p className="p-4 text-gray-600">Gestión de documentos (pendiente)</p>
        </Tab>

        <Tab key="comentarios" title="Comentarios">
          <p className="p-4 text-gray-600">Comentarios (pendiente)</p>
        </Tab>
      </Tabs>
    </div>
  );
}
