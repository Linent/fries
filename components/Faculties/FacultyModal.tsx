"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Button,
  Alert,
} from "@heroui/react";
import { createFaculty, updateFaculty } from "@/services/facultyService";

interface FacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (faculty: any) => void;
  mode?: "create" | "view" | "edit";
  faculty?: any;
}

export default function FacultyModal({
  isOpen,
  onClose,
  onCreate,
  mode = "create",
  faculty = null,
}: FacultyModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isView = mode === "view";
  const isEdit = mode === "edit";

  useEffect(() => {
    if (faculty) {
      setFormData({
        code: faculty.code || "",
        name: faculty.name || "",
        description: faculty.description || "",
      });
    } else {
      setFormData({ code: "", name: "", description: "" });
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [faculty, mode]);

  const getTitle = () =>
    mode === "view"
      ? "Detalles de Facultad"
      : mode === "edit"
      ? "Editar Facultad"
      : "Nueva Facultad";

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      setErrorMsg("Por favor completa el código y el nombre.");
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === "edit" && faculty
          ? await updateFaculty(faculty._id, formData)
          : await createFaculty(formData);

      onCreate(result);
      setSuccessMsg(
        mode === "edit"
          ? "Los datos se han actualizado correctamente."
          : "La facultad se ha registrado correctamente."
      );

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (error: any) {
      setErrorMsg(
        error?.message || "No se pudo guardar la facultad. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      backdrop="blur"
      size="lg"
      placement="center"
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2
                className={`text-xl font-semibold ${
                  isView
                    ? "text-primary"
                    : isEdit
                    ? "text-blue-600"
                    : "text-success"
                }`}
              >
                {getTitle()}
              </h2>
            </ModalHeader>

            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
  label="Código"
  placeholder="Ej. FIS01"
  value={formData.code}
  onValueChange={(v) => setFormData({ ...formData, code: v })}
  isDisabled={isView}
  required
  classNames={{
    inputWrapper: isView ? "bg-gray-100" : "",
    input: isView ? "text-gray-800 font-medium" : "",
  }}
/>

<Input
  label="Nombre"
  placeholder="Ej. Facultad de Ingeniería"
  value={formData.name}
  onValueChange={(v) => setFormData({ ...formData, name: v })}
  isDisabled={isView}
  required
  classNames={{
    inputWrapper: isView ? "bg-gray-100" : "",
    input: isView ? "text-gray-800 font-medium" : "",
  }}
/>

<Textarea
  label="Descripción"
  placeholder="Descripción breve..."
  value={formData.description}
  onValueChange={(v) => setFormData({ ...formData, description: v })}
  isDisabled={isView}
  classNames={{
    inputWrapper: isView ? "bg-gray-100" : "",
    input: isView ? "text-gray-800 font-medium" : "",
  }}
/>

                {errorMsg && (
                  <Alert color="danger" variant="solid">
                    {errorMsg}
                  </Alert>
                )}
                {successMsg && (
                  <Alert color="success" variant="solid">
                    {successMsg}
                  </Alert>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" color="default" onPress={close}>
                {isView ? "Cerrar" : "Cancelar"}
              </Button>
              {!isView && (
                <Button
                  color={isEdit ? "primary" : "success"}
                  isLoading={loading}
                  onPress={handleSubmit}
                >
                  {isEdit ? "Guardar cambios" : "Crear facultad"}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
