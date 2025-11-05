"use client";

import React, { useEffect, useState } from "react";
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
  addToast,
} from "@heroui/react";
import { createEntity, updateEntity } from "@/services/entityService";
import { Spinner } from "@heroui/spinner";

const typeEntityOptions = [
  { label: "Pública", value: "pública" },
  { label: "Privada", value: "privada" },
  { label: "Mixta", value: "mixta" },
  { label: "Internacional", value: "internacional" },
  { label: "Comunitaria", value: "comunitaria" },
  { label: "Institucional", value: "institucional" },
];

const sectorOptions = [
  { label: "Educación", value: "educación" },
  { label: "Salud", value: "salud" },
  { label: "Tecnología", value: "tecnología" },
  { label: "Cultural", value: "cultural" },
  { label: "Ambiental", value: "ambiental" },
  { label: "Agropecuario", value: "agropecuario" },
  { label: "Turismo", value: "turismo" },
  { label: "Otro", value: "otro" },
];

export default function EntityModal({
  isOpen,
  onClose,
  entity,
  mode,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  entity: any | null;
  mode: "create" | "edit" | "view";
  onSave: () => void;
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  type TypeEntity = "pública" | "privada" | "mixta" | "internacional" | "comunitaria" | "institucional" | "";
  
  const [form, setForm] = useState<{
    name: string;
    nit: string;
    typeEntity: TypeEntity;
    sector: string;
    representative: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    city: string;
    country: string;
    website: string;
  }>({
    name: "",
    nit: "",
    typeEntity: "",
    sector: "",
    representative: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    country: "Colombia",
    website: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entity) {
      setForm({
        name: entity.name || "",
        nit: entity.nit || "",
        typeEntity: entity.typeEntity || "",
        sector: entity.sector || "",
        representative: entity.representative || "",
        contactEmail: entity.contactEmail || "",
        contactPhone: entity.contactPhone || "",
        address: entity.address || "",
        city: entity.city || "",
        country: entity.country || "Colombia",
        website: entity.website || "",
      });
    } else {
      setForm({
        name: "",
        nit: "",
        typeEntity: "",
        sector: "",
        representative: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        city: "",
        country: "Colombia",
        website: "",
      });
    }
  }, [entity, mode]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!form.name || !form.nit || !form.typeEntity) {
        addToast({
          title: "Campos requeridos",
          description: "Por favor completa los campos obligatorios.",
          color: "warning",
        });
        return;
      }

      if (isCreate) {
        await createEntity(form);
        addToast({
          title: "Entidad creada",
          description: "La entidad fue registrada correctamente.",
          color: "success",
        });
      } else if (isEdit && entity?._id) {
        await updateEntity(entity._id, {
          ...form,
          typeEntity: form.typeEntity ? form.typeEntity : undefined,
          sector: form.sector ? form.sector as
            | "educación"
            | "salud"
            | "tecnología"
            | "cultural"
            | "ambiental"
            | "agropecuario"
            | "turismo"
            | "otro"
            : undefined,
        });
        addToast({
          title: "Entidad actualizada",
          description: "Los datos se actualizaron correctamente.",
          color: "success",
        });
      }

      onSave();
      onClose();
    } catch (err) {
      addToast({
        title: "Error",
        description: "No se pudo guardar la entidad.",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="text-lg font-semibold">
          {isCreate && "Registrar nueva entidad"}
          {isEdit && "Editar entidad"}
          {isView && "Detalle de entidad"}
        </ModalHeader>

        <ModalBody className="space-y-3">
          <Input
            label="Nombre"
            value={form.name}
            onValueChange={(v) => handleChange("name", v)}
            disabled={isView}
            isRequired
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              label="Tipo de entidad"
              selectedKeys={form.typeEntity ? [form.typeEntity] : []}
              onSelectionChange={(keys) =>
                handleChange("typeEntity", Array.from(keys)[0] as string)
              }
              disabled={isView}
            >
              {typeEntityOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>

            <Select
              label="Sector"
              selectedKeys={form.sector ? [form.sector] : []}
              onSelectionChange={(keys) =>
                handleChange("sector", Array.from(keys)[0] as string)
              }
              disabled={isView}
            >
              {sectorOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
          </div>

          <Input
            label="Representante"
            value={form.representative}
            onValueChange={(v) => handleChange("representative", v)}
            disabled={isView}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              label="Correo electrónico"
              type="email"
              value={form.contactEmail}
              onValueChange={(v) => handleChange("contactEmail", v)}
              disabled={isView}
            />
            <Input
              label="Teléfono"
              value={form.contactPhone}
              onValueChange={(v) => handleChange("contactPhone", v)}
              disabled={isView}
            />
          </div>

          <Input
            label="Dirección"
            value={form.address}
            onValueChange={(v) => handleChange("address", v)}
            disabled={isView}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              label="Ciudad"
              value={form.city}
              onValueChange={(v) => handleChange("city", v)}
              disabled={isView}
            />
            <Input
              label="País"
              value={form.country}
              onValueChange={(v) => handleChange("country", v)}
              disabled={isView}
            />
          </div>

          <Input
            label="Sitio web"
            value={form.website}
            onValueChange={(v) => handleChange("website", v)}
            disabled={isView}
          />
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cerrar
          </Button>

          {!isView && (
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={saving}
              spinner={<Spinner size="sm" color="white" />}
            >
              {isCreate ? "Guardar" : "Actualizar"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
