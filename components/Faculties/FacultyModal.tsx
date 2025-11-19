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
import DeanSelectorModal from "./DeanSelectorModal";

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
    decano: "", // id
    decanoName: "" // nombre para mostrar
  });

  const [loading, setLoading] = useState(false);
  const [showDeanSelector, setShowDeanSelector] = useState(false);

  const isView = mode === "view";
  const isEdit = mode === "edit";

  useEffect(() => {
    if (faculty) {
      setFormData({
        code: faculty.code || "",
        name: faculty.name || "",
        description: faculty.description || "",
        decano: faculty.decano?._id || "",
        decanoName:
          faculty.decano
            ? `${faculty.decano.name} (${faculty.decano.email})`
            : "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        decano: "",
        decanoName: "",
      });
    }
  }, [faculty]);

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) return;

    setLoading(true);

    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        decano: formData.decano,
      };

      const result =
        mode === "edit" && faculty
          ? await updateFaculty(faculty._id, payload)
          : await createFaculty(payload);

      onCreate(result);
      setTimeout(onClose, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose} size="lg" backdrop="blur">
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-semibold">
              {mode === "view"
                ? "Detalles de Facultad"
                : mode === "edit"
                ? "Editar Facultad"
                : "Nueva Facultad"}
            </h2>
          </ModalHeader>

          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Código"
                value={formData.code}
                isDisabled={isView}
                onValueChange={(v) => setFormData({ ...formData, code: v })}
              />

              <Input
                label="Nombre"
                value={formData.name}
                isDisabled={isView}
                onValueChange={(v) => setFormData({ ...formData, name: v })}
              />

              <Textarea
                label="Descripción"
                value={formData.description}
                isDisabled={isView}
                onValueChange={(v) =>
                  setFormData({ ...formData, description: v })
                }
              />

              {/* Select personalizado de decano */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Decano</label>

                <div className="flex gap-2">
                  <Input
                    isReadOnly
                    placeholder="Ninguno seleccionado"
                    value={formData.decanoName}
                    className="w-full"
                  />

                  {!isView && (
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={() => setShowDeanSelector(true)}
                    >
                      Buscar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancelar
            </Button>

            {!isView && (
              <Button color="success" isLoading={loading} onPress={handleSubmit}>
                {isEdit ? "Guardar cambios" : "Crear facultad"}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de selección de decano */}
      <DeanSelectorModal
        isOpen={showDeanSelector}
        onClose={() => setShowDeanSelector(false)}
        onSelect={(decano) =>
          setFormData({
            ...formData,
            decano: decano._id,
            decanoName: `${decano.name} (${decano.email})`,
          })
        }
      />
    </>
  );
}
