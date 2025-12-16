"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  Card,
  Alert,
} from "@heroui/react";
import { IUser } from "@/types";
import { registerUser } from "@/services/userServices";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // ✅ Se ejecuta para refrescar la tabla en el padre
}

export default function UserCreateModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Partial<IUser>>({
    tipo_documento: "CC",
    roles: ["formulador"],
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (key: keyof IUser, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const required = [
      "codigo",
      "tipo_documento",
      "dni",
      "firstName",
      "firstLastName",
      "email",
      "password",
      "roles",
    ];

    for (const field of required) {
      if (!(formData as any)[field]) {
        setErrorMsg(`El campo "${field}" es obligatorio.`);
        setLoading(false);
        return;
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || "")) {
      setErrorMsg("El correo electrónico no es válido.");
      setLoading(false);
      return;
    }

    if ((formData.password || "").length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData as IUser);
      setSuccessMsg("Usuario registrado exitosamente 🎉");

      // ✅ Refresca la tabla si el padre pasó una función
      onSuccess?.();

      // 🧹 Limpia el formulario y cierra tras 2 segundos
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error al registrar usuario:", error);
      setErrorMsg(
        error?.response?.data?.message ||
          "Error al registrar el usuario. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      size="2xl"
    >
      <ModalContent>
        <ModalHeader className="text-xl font-semibold">
          Crear nuevo usuario
        </ModalHeader>

        <ModalBody className="grid grid-cols-2 gap-3">
          {loading ? (
            // 🧩 Skeleton de carga
            <Card className="w-full space-y-4 p-4" radius="lg">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg bg-default-300" />
              ))}
            </Card>
          ) : (
            <>
              <Input
                label="Código"
                placeholder="Ej. 115001"
                onChange={(e) => handleChange("codigo", e.target.value)}
              />

              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered" className="w-full">
                    {formData.tipo_documento || "Tipo de documento"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  onAction={(key) =>
                    handleChange("tipo_documento", String(key).toUpperCase())
                  }
                >
                  {[
                    "CC",
                    "TI",
                    "CE",
                    "PA",
                    "RC",
                    "PEP",
                    "NIT",
                    "CD",
                    "NUIP",
                    "DNI",
                  ].map((type) => (
                    <DropdownItem key={type}>{type}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <Input
                label="Número de documento"
                onChange={(e) => handleChange("dni", e.target.value)}
              />
              <Input
                label="Primer nombre"
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              <Input
                label="Segundo nombre"
                onChange={(e) => handleChange("secondName", e.target.value)}
              />
              <Input
                label="Primer apellido"
                onChange={(e) => handleChange("firstLastName", e.target.value)}
              />
              <Input
                label="Segundo apellido"
                onChange={(e) => handleChange("secondLastName", e.target.value)}
              />
              <Input
                label="Celular"
                type="tel"
                onChange={(e) => handleChange("celular", e.target.value)}
              />
              <Input
                label="Correo electrónico"
                type="email"
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <Input
                label="Contraseña"
                type="password"
                onChange={(e) => handleChange("password", e.target.value)}
              />

              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered" className="w-full">
                    {formData.roles && formData.roles.length > 0
                      ? formData.roles.join(", ")
                      : "Seleccionar roles"}
                  </Button>
                </DropdownTrigger>

                <DropdownMenu
                  selectionMode="multiple"
                  selectedKeys={new Set(formData.roles || [])}
                  onSelectionChange={(keys) =>
                    setFormData((prev) => ({
                      ...prev,
                      roles: Array.from(keys) as string[],
                    }))
                  }
                >
                  {[
                    "formulador",
                    "fries",
                    "administrador",
                    "docente",
                    "estudiante",
                    "decano",
                    "director_programa",
                    "vicerrectoria",
                  ].map((role) => (
                    <DropdownItem key={role}>{role}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              {formData.roles?.length === 1 &&
                (formData.roles.includes("docente") ||
                  formData.roles.includes("estudiante")) && (
                  <Input
                    label="Programa académico"
                    placeholder="Ej. Ingeniería de Sistemas"
                    onChange={(e) =>
                      handleChange("academic_program", e.target.value)
                    }
                  />
                )}

              {/* ⚠️ Alertas visuales */}
              {errorMsg && (
                <Alert color="danger" variant="solid" className="col-span-2">
                  {errorMsg}
                </Alert>
              )}
              {successMsg && (
                <Alert color="success" variant="solid" className="col-span-2">
                  {successMsg}
                </Alert>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter className="flex justify-end gap-2">
          <Button variant="flat" color="danger" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleSubmit}>
            Crear usuario
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
