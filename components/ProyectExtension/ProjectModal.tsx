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
} from "@heroui/react";
import { useEffect, useState } from "react";
import { getFaculties } from "@/services/facultyService";
import { createProject } from "@/services/proyectServices";
import { Faculty } from "@/types/types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: any) => void;
}

const typeProjects = ["Remunerado", "Solidario"];
const semesters = ["Primero", "Segundo"];

export default function ProjectModal({
  isOpen,
  onClose,
  onCreate,
}: ProjectModalProps) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yearError, setYearError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    typeProject: "",
    year: "",
    semester: "",
    faculty: "", // almacena el _id de la facultad
  });

  // 🔄 Cargar facultades desde el backend
  useEffect(() => {
    const loadFaculties = async () => {
      try {
        setLoadingFaculties(true);
        const data = await getFaculties();
        setFaculties(data);
      } catch (error) {
        console.error("Error al cargar facultades:", error);
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

  const handleChange = (field: string, value: string) => {
    if (field === "semester") value = value.toLowerCase();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateYear = (year: string) => {
    if (!year) return false;
    const num = parseInt(year);
    return num >= 1990 && year.length === 4;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // evita doble envío

    if (
      !formData.code ||
      !formData.title ||
      !formData.typeProject ||
      !formData.year ||
      !formData.semester ||
      !formData.faculty ||
      !formData.description
    ) {
      setErrorMessage("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!validateYear(formData.year)) {
      setYearError("El año debe tener 4 dígitos y ser mayor o igual a 1990.");
      return;
    }

    setIsSubmitting(true);
    setYearError("");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        ...formData,
        year: parseInt(formData.year),
        status: "en_formulacion",
      };

      const createdProject = await createProject(payload);
      onCreate(createdProject);

      // ✅ Mostrar mensaje de éxito
      setSuccessMessage("Proyecto registrado exitosamente 🎉");

      // 🧹 Limpiar formulario
      setFormData({
        code: "",
        title: "",
        description: "",
        typeProject: "",
        year: "",
        semester: "",
        faculty: "",
      });

      // ⏳ Cerrar el modal después de 2 segundos
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error al crear el proyecto:", error);
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
              Registrar nuevo proyecto
            </ModalHeader>

            <ModalBody className="space-y-4">
              {isSubmitting ? (
                // ⏳ Skeleton mientras se guarda
                <Card className="w-full space-y-5 p-4" radius="lg">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg bg-default-300" />
                  ))}
                </Card>
              ) : (
                <>
                  <Input
                    label="Código de la unidad académica"
                    placeholder="Ej: 115"
                    value={formData.code}
                    onValueChange={(value) => handleChange("code", value)}
                    required
                  />

                  <Input
                    label="Título del proyecto"
                    placeholder="Ingrese el título..."
                    value={formData.title}
                    onValueChange={(value) => handleChange("title", value)}
                    required
                  />

                  {/* 📝 Nuevo campo: descripción del proyecto */}
                  <Textarea
                    label="Descripción del proyecto"
                    placeholder="Describe brevemente el propósito y alcance del proyecto..."
                    value={formData.description}
                    onValueChange={(value) => handleChange("description", value)}
                    required
                    minRows={3}
                    variant="bordered"
                  />

                  <Select
                    label="Tipo de proyecto"
                    placeholder="Seleccione tipo..."
                    selectedKeys={
                      formData.typeProject
                        ? new Set([formData.typeProject])
                        : new Set()
                    }
                    onChange={(e) =>
                      handleChange("typeProject", e.target.value)
                    }
                    required
                  >
                    {typeProjects.map((type) => (
                      <SelectItem key={type}>{type}</SelectItem>
                    ))}
                  </Select>

                  <div className="flex gap-3">
                    <Input
                      type="number"
                      label="Año"
                      placeholder="Ej: 2025"
                      min={1900}
                      value={formData.year}
                      onValueChange={(value) => {
                        handleChange("year", value);
                        if (validateYear(value)) setYearError("");
                      }}
                      required
                      isInvalid={!!yearError}
                      errorMessage={yearError}
                      className="flex-1"
                    />

                    <Select
                      label="Semestre"
                      placeholder="Seleccione semestre..."
                      selectedKeys={
                        formData.semester
                          ? new Set([formData.semester.charAt(0).toUpperCase() +
                              formData.semester.slice(1)])
                          : new Set()
                      }
                      onChange={(e) =>
                        handleChange("semester", e.target.value)
                      }
                      className="flex-1"
                      required
                    >
                      {semesters.map((s) => (
                        <SelectItem key={s}>{s}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  {loadingFaculties ? (
                    <Card className="w-full space-y-5 p-4" radius="lg">
                      <Skeleton className="rounded-lg h-10 bg-default-300" />
                      <Skeleton className="rounded-lg h-10 bg-default-200" />
                    </Card>
                  ) : (
                    <Select
                      placeholder="Seleccione facultad..."
                      selectedKeys={
                        formData.faculty
                          ? new Set([formData.faculty])
                          : new Set()
                      }
                      onChange={(e) =>
                        handleChange("faculty", e.target.value)
                      }
                      required
                    >
                      {faculties.map((fac) => (
                        <SelectItem key={fac._id} textValue={fac.name}>
                          {fac.name} {fac.code ? `(${fac.code})` : ""}
                        </SelectItem>
                      ))}
                    </Select>
                  )}

                  {/* ⚠️ Mensajes visuales */}
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
              <Button
                color="primary"
                isLoading={isSubmitting}
                onPress={handleSubmit}
              >
                Guardar proyecto
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

