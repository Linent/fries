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
  Alert,
} from "@heroui/react";
import { IUser } from "@/types";
import { registerUser } from "@/services/userServices";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId: string) => void;
  fixedRole?: "director" | "coautor" | "estudiante" | null;
}

export default function UserCreateModal({
  isOpen,
  onClose,
  onSuccess,
  fixedRole,
}: Props) {
  const isStudent = fixedRole === "estudiante";

  const [formData, setFormData] = useState<Partial<IUser>>({
    tipo_documento: "CC",
    roles: isStudent ? ["estudiante"] : ["docente"],
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  const handleChange = (key: keyof IUser, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setMsg(null);
    setLoading(true);

    try {
      const created = await registerUser(formData as IUser);
      setMsg({ type: "success", text: "Usuario creado correctamente." });
      setTimeout(() => {
        setMsg(null);
        onSuccess?.(created._id);
        onClose();
      }, 1200);
    } catch (error: any) {
      setMsg({
        type: "danger",
        text: error?.response?.data?.message || "Error al registrar usuario",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          Registrar nuevo {isStudent ? "estudiante" : "docente"}
        </ModalHeader>
        <ModalBody className="grid grid-cols-2 gap-3">
          <Input
            label="Primer nombre"
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
          <Input
            label="Primer apellido"
            onChange={(e) => handleChange("firstLastName", e.target.value)}
          />
          <Input
            label="Correo electrónico"
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <Input
            label="Contraseña"
            type="password"
            onChange={(e) => handleChange("password", e.target.value)}
          />
          <Input
            label="Rol del usuario"
            value={Array.isArray(formData.roles) ? formData.roles.join(", ") : ''}
            readOnly
          />
          {msg && <Alert color={msg.type}>{msg.text}</Alert>}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" color="danger" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleSubmit}>
            Crear y vincular
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
