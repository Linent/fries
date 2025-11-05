"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Input,
  Button,
  Select,
  SelectItem,
  Alert,
} from "@heroui/react";
import { registerUser } from "@/services/userServices";
import { IUser } from "@/types";
import { tipoDocumentoOptions } from "@/types/";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId: string) => void;
  fixedRole: "director" | "coautor" | "estudiante";
}

export default function UserQuickCreateModal({
  isOpen,
  onClose,
  onSuccess,
  fixedRole,
}: Props) {
  // Estado inicial del formulario
  const [formData, setFormData] = useState<Partial<IUser>>({
    role: fixedRole === "estudiante" ? "estudiante" : "docente",
    tipo_documento: "CC",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "danger"; text: string } | null>(
    null
  );

  // 🔄 Sincronizar el rol con la sección actual (director, coautor o estudiante)
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        role: fixedRole === "estudiante" ? "estudiante" : "docente",
      }));
    }
  }, [fixedRole, isOpen]);

  // 📑 Opciones del tipo de documento


  // 📥 Manejar cambios de campos
  const handleChange = (key: keyof IUser, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "dni" ? { password: value } : {}), // Contraseña = documento
    }));
  };

  // ✅ Validar y enviar
  const handleSubmit = async () => {
    setMsg(null);

    if (
      !formData.firstName ||
      !formData.firstLastName ||
      !formData.email ||
      !formData.tipo_documento ||
      !formData.dni ||
      !formData.academic_program ||
      !formData.codigo
    ) {
      setMsg({
        type: "danger",
        text: "Por favor completa todos los campos obligatorios.",
      });
      return;
    }

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
      console.error(error);
      setMsg({
        type: "danger",
        text: error?.response?.data?.message || "Error al registrar usuario",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Ocultar mensaje después de 3 segundos
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Registrar nuevo {fixedRole}</ModalHeader>

        <ModalBody className="grid grid-cols-2 gap-3">
          {/* Campos del formulario */}
          <Input
            label="Primer nombre"
            isRequired
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
          <Input
            label="Segundo nombre"
            onChange={(e) => handleChange("secondName", e.target.value)}
          />

          <Input
            label="Primer apellido"
            isRequired
            onChange={(e) => handleChange("firstLastName", e.target.value)}
          />
          <Input
            label="Segundo apellido"
            onChange={(e) => handleChange("secondLastName", e.target.value)}
          />
            <Input
            label="Código académico"
            type="number"
            isRequired
            onChange={(e) => handleChange("codigo", e.target.value)}
          />
          <Input
            label="Correo electrónico"
            type="email"
            isRequired
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Select
            label="Tipo de documento"
            selectedKeys={[formData.tipo_documento || "CC"]}
            onChange={(e) => handleChange("tipo_documento", e.target.value)}
            isRequired
          >
            {tipoDocumentoOptions.map((opt) => (
              <SelectItem key={opt.value}>{opt.label}</SelectItem>
            ))}
          </Select>

          <Input
            label="Número de documento"
            type="text"
            isRequired
            onChange={(e) => handleChange("dni", e.target.value)}
          />

          <Input
            label="Programa académico"
            
            isRequired
            onChange={(e) => handleChange("academic_program", e.target.value)}
          />

          {/* 🔒 Campo de rol oculto */}
          <input type="hidden" value={formData.role} readOnly />

          {msg && (
            <div className="col-span-2">
              <Alert color={msg.type}>{msg.text}</Alert>
            </div>
          )}
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
