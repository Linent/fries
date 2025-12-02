"use client";

import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Alert,
  Select,
  SelectItem,
  addToast,
  Textarea,
  Skeleton,
} from "@heroui/react";

import {
  updateProject
} from "@/services/proyectServices";

import { getFaculties } from "@/services/facultyService";
import { getProgramsByFaculty } from "@/services/programService";

export default function GeneralTab({
  project,
  editable,
  onProjectUpdate,
}: {
  project: any;
  editable: boolean;
  onProjectUpdate?: (updatedProject: any) => void;
}) {
  // 🧩 Estado del formulario
  const [form, setForm] = useState({
    title: project.title ?? "",
    code: project.code ?? "",
    typeProject: project.typeProject ?? "",
    totalValue: project.totalValue ?? 0,
    year: project.year ?? "",
    semester: project.semester ?? "",
    description: project.description ?? "",
    faculty: project.faculty?._id ?? project.faculty ?? "",
    program: project.program?._id ?? project.program ?? "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [faculties, setFaculties] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  const projectTypes = ["Remunerado", "Solidarío"];
  const semesterOptions = ["primero", "segundo"];

  // 🔄 Sincronizar con proyecto si cambia desde otra tab
  useEffect(() => {
    setForm({
      title: project.title ?? "",
      code: project.code ?? "",
      typeProject: project.typeProject ?? "",
      totalValue: project.totalValue ?? 0,
      year: project.year ?? "",
      semester: project.semester ?? "",
      description: project.description ?? "",
      faculty: project.faculty?._id ?? project.faculty ?? "",
      program: project.program?._id ?? project.program ?? "",
    });
  }, [project]);

  // 📌 Cargar Facultades
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingFaculties(true);
        const data = await getFaculties();
        setFaculties(data);
      } catch {
        setError("No se pudieron cargar las facultades.");
      } finally {
        setLoadingFaculties(false);
      }
    };
    load();
  }, []);

  // 📌 Cargar Programas cuando cambia la facultad
  useEffect(() => {
    if (!form.faculty) {
      setPrograms([]);
      return;
    }

    const loadPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const data = await getProgramsByFaculty(form.faculty);
        setPrograms(data);
      } catch {
        setError("No se pudieron cargar los programas.");
      } finally {
        setLoadingPrograms(false);
      }
    };

    loadPrograms();
  }, [form.faculty]);

  // 🔄 Control de cambios
  const handleChange = (field: string, value: string | number) => {
    // Si cambia facultad → limpiar programa también
    if (field === "faculty") {
      setForm({ ...form, faculty: value, program: "" });
      return;
    }

    setForm({ ...form, [field]: value });
  };

  // 💾 Guardar
  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    if (!form.title || !form.typeProject || !form.year || !form.semester) {
      setError("Por favor completa todos los campos obligatorios marcados con *");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        totalValue: Number(form.totalValue),
      };

      const updatedProject = await updateProject(project._id, payload);

      onProjectUpdate?.(updatedProject);

      addToast({
        title: "Datos guardados",
        description: "El proyecto fue actualizado correctamente.",
        color: "success",
      });

      setMessage("Cambios actualizados");
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios");
      addToast({
        title: "Error",
        description: "No se pudieron guardar los datos.",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">

      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Información general del proyecto
      </h3>

      {error && <Alert color="danger">{error}</Alert>}
      {message && <Alert color="success">{message}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input
          label="Título *"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          readOnly={!editable}
        />

        <Input label="Código" value={form.code} readOnly />

        {/* Tipo de Proyecto */}
        <Select
          label="Tipo de proyecto *"
          selectedKeys={form.typeProject ? [form.typeProject] : []}
          onChange={(e) => handleChange("typeProject", e.target.value)}
          isDisabled={!editable}
        >
          {projectTypes.map((t) => (
            <SelectItem key={t}>{t}</SelectItem>
          ))}
        </Select>

        <Input
          label="Valor total"
          type="number"
          value={String(form.totalValue)}
          onChange={(e) => handleChange("totalValue", Number(e.target.value))}
          readOnly={!editable}
        />

        {/* Año */}
        <Input
          label="Año *"
          type="number"
          value={String(form.year)}
          onChange={(e) => handleChange("year", e.target.value)}
          readOnly={!editable}
        />

        {/* Semestre */}
        <Select
          label="Semestre *"
          selectedKeys={form.semester ? [form.semester] : []}
          onChange={(e) => handleChange("semester", e.target.value)}
          isDisabled={!editable}
        >
          {semesterOptions.map((s) => (
            <SelectItem key={s}>{s === "primero" ? "Primero" : "Segundo"}</SelectItem>
          ))}
        </Select>

        {/* ---------- FACULTAD ---------- */}
        {loadingFaculties ? (
          <Skeleton className="h-10 rounded-lg bg-default-300" />
        ) : (
          <Select
            label="Facultad *"
            selectedKeys={form.faculty ? [form.faculty] : []}
            onChange={(e) => handleChange("faculty", e.target.value)}
            isDisabled={!editable}
          >
            {faculties.map((f) => (
              <SelectItem key={f._id}>{f.name}</SelectItem>
            ))}
          </Select>
        )}

        {/* ---------- PROGRAMA ---------- */}
        <Select
          label="Programa Académico"
          selectedKeys={form.program ? [form.program] : []}
          onChange={(e) => handleChange("program", e.target.value)}
          isDisabled={!editable || !form.faculty}
          isLoading={loadingPrograms}
        >
          {programs.map((p) => (
            <SelectItem key={p._id}>{p.name}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Descripción */}
      <Textarea
        label="Descripción"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
        readOnly={!editable}
        rows={4}
      />

      {editable && (
        <div className="flex justify-end mt-4">
          <Button color="danger" onPress={handleSubmit} isLoading={saving}>
            Guardar cambios
          </Button>
        </div>
      )}
    </div>
  );
}
