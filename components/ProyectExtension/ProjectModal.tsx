"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Select,
  SelectItem,
  Skeleton,
  Card,
  Alert,
  Textarea,
  DateInput,
} from "@heroui/react";
import { useEffect, useState } from "react";

import { getFaculties } from "@/services/facultyService";
import { getProgramsByFaculty } from "@/services/programService";
import { createProject } from "@/services/proyectServices";

import { Faculty, Program, Project } from "@/types";
import { getTokenPayload } from "@/utils/auth";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (project: Project) => void;
}

const typeProjects = ["Remunerado", "Solidarío"];
const semesters = ["Primero", "Segundo"];

export default function ProjectModal({
  isOpen,
  onClose,
  onCreate,
}: ProjectModalProps) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yearError, setYearError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 🔐 Roles — permitir crear si es administrador, fries o formulador
  const user = getTokenPayload();
  const roles: string[] = user?.roles || [];

  const canCreate =
    roles.includes("administrador") ||
    roles.includes("fries") ||
    roles.includes("formulador");

  if (!canCreate) return null;

  // 🧩 Datos del formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    typeProject: "",
    year: "",
    semester: "",
    faculty: "",
    program: "",
  });

  // 🔄 Cargar facultades al abrir
  useEffect(() => {
    const loadFaculties = async () => {
      try {
        setLoadingFaculties(true);
        const data = await getFaculties();
        setFaculties(data);
      } catch {
        setErrorMessage("Error al cargar las facultades.");
      } finally {
        setLoadingFaculties(false);
      }
    };

    if (isOpen) {
      setSuccessMessage(null);
      setErrorMessage(null);
      loadFaculties();
    }
  }, [isOpen]);

  // 🔁 Cargar programas cuando se selecciona facultad
  useEffect(() => {
    if (!formData.faculty) {
      setPrograms([]);
      return;
    }

    const loadPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const data = await getProgramsByFaculty(formData.faculty);
        setPrograms(data);
      } catch {
        setErrorMessage("No se pudieron cargar los programas.");
      } finally {
        setLoadingPrograms(false);
      }
    };

    loadPrograms();
  }, [formData.faculty]);

  const handleChange = (field: string, value: string) => {
    if (field === "semester") value = value.toLowerCase();

    // Si cambia la facultad, limpiar programa
    if (field === "faculty") {
      setFormData((prev) => ({ ...prev, faculty: value, program: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateYear = (year: string) => {
    const num = parseInt(year);
    return num >= 1990 && year.length === 4;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (
      !formData.title ||
      !formData.description ||
      !formData.typeProject ||
      !formData.year ||
      !formData.semester ||
      !formData.faculty ||
      !formData.program
    ) {
      setErrorMessage("Completa todos los campos obligatorios.");
      return;
    }

    if (!validateYear(formData.year)) {
      setYearError("El año debe ser >= 1990 y tener 4 dígitos.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        typeProject: formData.typeProject,
        year: parseInt(formData.year),
        semester: formData.semester,
        faculty: formData.faculty,
        program: formData.program,
      };

      const createdProject = await createProject(payload);
      onCreate?.(createdProject);

      setSuccessMessage("Proyecto registrado exitosamente 🎉");

      // Resetear formulario
      setFormData({
        title: "",
        description: "",
        typeProject: "",
        year: "",
        semester: "",
        faculty: "",
        program: "",
      });

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "No se pudo crear el proyecto. Intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} backdrop="blur" size="lg">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="text-xl font-semibold">
              Registrar nuevo proyecto de extensión
            </ModalHeader>

            <ModalBody className="space-y-4">
              {isSubmitting ? (
                <Card className="w-full space-y-5 p-4" radius="lg">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg bg-default-300" />
                  ))}
                </Card>
              ) : (
                <>
                  <Input
                    label="Título del proyecto"
                    placeholder="Ingrese el título..."
                    value={formData.title}
                    onValueChange={(v) => handleChange("title", v)}
                    required
                  />

                  <Textarea
                    label="Problema del proyecto"
                    placeholder="Describe el problema del proyecto..."
                    value={formData.description}
                    onValueChange={(v) => handleChange("description", v)}
                    minRows={3}
                  />

                  <Select required
                    label="Tipo de proyecto"
                    selectedKeys={
                      formData.typeProject ? new Set([formData.typeProject]) : new Set()
                    }
                    onChange={(e) => handleChange("typeProject", e.target.value)}
                  >
                    {typeProjects.map((t) => (
                      <SelectItem  key={t}>{t}</SelectItem>
                    ))}
                  </Select>

                  <div className="flex gap-3">
                    <Input
                      required
                      type="number"
                      label="Año"
                      placeholder="Ej: 2025"
                      value={formData.year}
                      onValueChange={(v) => {
                        handleChange("year", v);
                        if (validateYear(v)) setYearError("");
                      }}
                      isInvalid={!!yearError}
                      errorMessage={yearError}
                      className="flex-1"
                    />

                    <Select
                      label="Semestre"
                      selectedKeys={
                        formData.semester
                          ? new Set([
                              formData.semester.charAt(0).toUpperCase() +
                                formData.semester.slice(1),
                            ])
                          : new Set()
                      }
                      onChange={(e) => handleChange("semester", e.target.value)}
                      className="flex-1"
                    >
                      {semesters.map((s) => (
                        <SelectItem key={s}>{s}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* FACULTADES */}
                  {loadingFaculties ? (
                    <Skeleton className="h-10 rounded-lg bg-default-300" />
                  ) : (
                    <Select
                      label="Facultad"
                      selectedKeys={
                        formData.faculty ? new Set([formData.faculty]) : new Set()
                      }
                      onChange={(e) => handleChange("faculty", e.target.value)}
                    >
                      {faculties.map((f) => (
                        <SelectItem key={f._id}>{f.name}</SelectItem>
                      ))}
                    </Select>
                  )}

                  {/* PROGRAMAS */}
                  <Select
                    label="Programa académico"
                    isDisabled={!formData.faculty || loadingPrograms}
                    selectedKeys={
                      formData.program ? new Set([formData.program]) : new Set()
                    }
                    isLoading={loadingPrograms}
                    onChange={(e) => handleChange("program", e.target.value)}
                  >
                    {programs.map((p) => (
                      <SelectItem key={p._id}>{p.name}</SelectItem>
                    ))}
                  </Select>

                  {errorMessage && (
                    <Alert color="danger" variant="solid">
                      {errorMessage}
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert color="success" variant="solid">
                      {successMessage}
                    </Alert>
                  )}
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" color="danger" onPress={close}>
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
                Guardar proyecto
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
