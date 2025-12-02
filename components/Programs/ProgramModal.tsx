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
  Spinner,
  Alert,
} from "@heroui/react";

import React, { useEffect, useState } from "react";
import { Program, ProgramUpsertDTO } from "@/types/types";
import { getFaculties } from "@/services/facultyService";
import SelectDirectorModal from "./SelectDirectorModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
  onSave: (data: ProgramUpsertDTO) => Promise<void>;
}

export default function ProgramModal({
  isOpen,
  onClose,
  program,
  onSave,
}: Props) {
  const [form, setForm] = useState<ProgramUpsertDTO>({
    name: "",
    code: "",
    faculty: "",
    director: "",
  });

  const [faculties, setFaculties] = useState<any[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [saving, setSaving] = useState(false);
  const [directorModalOpen, setDirectorModalOpen] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  // Cargar facultades
  useEffect(() => {
    const load = async () => {
      setLoadingFaculties(true);
      const data = await getFaculties();
      setFaculties(data);
      setLoadingFaculties(false);
    };
    load();
  }, []);

  // Pre-cargar datos
  useEffect(() => {
    if (program) {
      setForm({
        name: program.name,
        code: program.code,
        faculty: program.faculty?._id || "",
        director: program.director?._id || "",
      });
    } else {
      setForm({ name: "", code: "", faculty: "", director: "" });
    }
  }, [program]);

  const handleChange = (key: keyof ProgramUpsertDTO, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectDirector = (directorId: string | null) => {
  setForm((prev) => ({ ...prev, director: directorId || "" }));
};


  const handleSave = async () => {
    if (!form.name || !form.code || !form.faculty) {
      setToast({ type: "danger", message: "Completa todos los campos requeridos" });
      return;
    }

    try {
      setSaving(true);
      await onSave(form);

      setToast({ type: "success", message: "Programa guardado correctamente" });

      setTimeout(() => {
        setToast(null);
        onClose();
      }, 1000);
    } catch {
      setToast({ type: "danger", message: "Error al guardar el programa" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <Modal isOpen={isOpen} onOpenChange={onClose} size="lg" backdrop="blur">
        <ModalContent>
          <ModalHeader>
            {program ? "Editar Programa Académico" : "Nuevo Programa Académico"}
          </ModalHeader>

          <ModalBody className="flex flex-col gap-4">
            {toast && (
              <Alert color={toast.type} variant="flat">
                {toast.message}
              </Alert>
            )}

            <Input
              label="Nombre del programa"
              value={form.name}
              onValueChange={(v) => handleChange("name", v)}
              isRequired
              isDisabled={saving}
            />

            <Input
              label="Código"
              value={form.code}
              onValueChange={(v) => handleChange("code", v)}
              isRequired
              isDisabled={saving}
            />

            <Select
              label="Facultad"
              selectedKeys={[form.faculty]}
              onSelectionChange={(keys) =>
                handleChange("faculty", Array.from(keys)[0] as string)
              }
              isDisabled={saving}
              isRequired
            >
              {loadingFaculties ? (
                <SelectItem key="loading" isReadOnly>
                  <Spinner size="sm" />
                </SelectItem>
              ) : (
                faculties.map((f) => <SelectItem key={f._id}>{f.name}</SelectItem>)
              )}
            </Select>

            <Button
              color="primary"
              variant="flat"
              onPress={() => setDirectorModalOpen(true)}
            >
              {form.director ? "Cambiar director" : "Asignar director"}
            </Button>
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancelar
            </Button>

            <Button
              color="primary"
              onPress={handleSave}
              startContent={saving ? <Spinner size="sm" /> : null}
              isDisabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL DE DIRECTOR */}
      <SelectDirectorModal
        isOpen={directorModalOpen}
        onClose={() => setDirectorModalOpen(false)}
        currentProgramId={program?._id || null}
        currentDirectorId={form.director || null}
        onSelect={handleSelectDirector}
      />
    </>
  );
}
