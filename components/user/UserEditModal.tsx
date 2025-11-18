"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Input,
  Button,
  Card,
  CardBody,
  Alert,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
} from "@heroui/react";

import { EyeIcon, EyeOffIcon, CameraIcon } from "lucide-react";

import {
  getUserById,
  updateUser,
  updateUserProfileImage,
} from "@/services/userServices";

import { getTokenPayload } from "@/utils/auth";
import { DEFAULT_IMAGE } from "@/types/types";

const DOCUMENT_TYPES = [
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
];

const ROLES = [
  "formulador",
  "fries",
  "administrador",
  "docente",
  "estudiante",
  "decano",
  "director_programa",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onSuccess?: () => void;
}

export default function UserEditModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const auth = getTokenPayload();
  const canEditPassword = ["administrador", "fries"].includes(auth?.role || "");

  useEffect(() => {
    if (userId) loadUser();
  }, [userId]);

  const loadUser = async () => {
    const data = await getUserById(userId!);
    setFormData(data);
    setImgPreview(data.profileImage || DEFAULT_IMAGE);
  };

  const handleUpdate = async () => {
    setMsg(null);
    setLoading(true);

    try {
      await updateUser(userId!, formData);
      if (imageFile) await updateUserProfileImage(userId!, imageFile);

      setMsg({ type: "success", text: "Usuario actualizado correctamente 🎉" });
      onSuccess?.();

      setTimeout(() => {
        setMsg(null);
        onClose();
      }, 1400);
    } catch {
      setMsg({ type: "danger", text: "Error al actualizar usuario." });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !userId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg"  placement="top"
  scrollBehavior="outside">
      <ModalContent className="!max-w-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200">

        <ModalHeader className="bg-gray-50 py-4 px-6 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Editar Usuario</h2>
        </ModalHeader>

        <ModalBody className="space-y-6 p-6">

          {/* FOTO DE PERFIL */}
          <div className="flex flex-col items-center mt-2">
            <div className="relative w-20 h-20">
              <img
                src={imgPreview}
                className="w-20 h-20 rounded-full object-cover border shadow-sm"
                alt="Foto"
              />

              <label className="absolute bottom-0 right-0 bg-white shadow-md border rounded-full p-1 cursor-pointer hover:bg-gray-100">
                <CameraIcon className="w-4 h-4 text-gray-700" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setImageFile(f);
                      setImgPreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </label>
            </div>

            <p className="text-[10px] text-gray-500 mt-1">
              JPG, PNG, WEBP – Máx. 2MB
            </p>
          </div>

          {/* INFORMACIÓN PERSONAL */}
          <Card className="shadow-sm border border-gray-100 rounded-xl">
            <CardBody className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Información personal</h3>

              <div className="grid grid-cols-2 gap-4">
                
                {/* Tipo de documento */}
                <Dropdown>
                  <DropdownTrigger>
                    <Button size="sm" variant="bordered" className="w-full">
                      {formData.tipo_documento || "Tipo de documento"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    onAction={(key) =>
                      setFormData({ ...formData, tipo_documento: key })
                    }
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <DropdownItem key={type}>{type}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>

                {/* Documento */}
                <Input
                  size="sm"
                  label="Documento"
                  value={formData.dni || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dni: e.target.value })
                  }
                />

                <Input
                  size="sm"
                  label="Código"
                  value={formData.codigo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value })
                  }
                />

                <Input
                  size="sm"
                  label="Correo"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />

                <Input
                  size="sm"
                  label="Primer nombre"
                  value={formData.firstName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
                <Input
                  size="sm"
                  label="Segundo nombre"
                  value={formData.secondName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, secondName: e.target.value })
                  }
                />

                <Input
                  size="sm"
                  label="Primer apellido"
                  value={formData.firstLastName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, firstLastName: e.target.value })
                  }
                />
                <Input
                  size="sm"
                  label="Segundo apellido"
                  value={formData.secondLastName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, secondLastName: e.target.value })
                  }
                />

                <Input
                  size="sm"
                  label="Celular"
                  value={formData.celular || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, celular: e.target.value })
                  }
                />
              </div>
            </CardBody>
          </Card>

          {/* INFORMACIÓN ACADÉMICA */}
          <Card className="shadow-sm border border-gray-100 rounded-xl">
            <CardBody className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Información académica</h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  size="sm"
                  label="Programa académico"
                  value={formData.academic_program || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, academic_program: e.target.value })
                  }
                />
                <Input
                  size="sm"
                  label="Institución"
                  value={formData.institucion || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, institucion: e.target.value })
                  }
                />
              </div>
            </CardBody>
          </Card>

          {/* ROL */}
          <Card className="shadow-sm border border-gray-100 rounded-xl">
            <CardBody className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Rol</h3>

              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="bordered" className="w-full">
                    {formData.role || "Seleccionar rol"}
                  </Button>
                </DropdownTrigger>

                <DropdownMenu
                  onAction={(key) => {
                    setFormData({ ...formData, role: key });
                  }}
                >
                  {ROLES.map((role) => (
                    <DropdownItem key={role}>{role}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </CardBody>
          </Card>

          {/* SEGURIDAD */}
          {canEditPassword && (
            <Card className="shadow-sm border border-gray-100 rounded-xl">
              <CardBody className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Seguridad</h3>

                <Input
                  size="sm"
                  label="Nueva contraseña"
                  type={showPassword ? "text" : "password"}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-4 h-4 text-gray-600" />
                      ) : (
                        <EyeIcon className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  }
                />
              </CardBody>
            </Card>
          )}

          {msg && (
            <Alert color={msg.type} variant="flat">
              {msg.text}
            </Alert>
          )}
        </ModalBody>

        <ModalFooter className="px-6 pb-4">
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleUpdate}>
            Guardar cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
