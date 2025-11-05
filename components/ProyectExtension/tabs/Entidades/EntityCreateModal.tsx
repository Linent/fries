"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Alert,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { ChevronDown } from "lucide-react"; // para el ícono animado
import { createEntity } from "@/services/entityService";

const TYPE_OPTIONS = [
  "pública",
  "privada",
  "mixta",
  "internacional",
  "comunitaria",
  "institucional",
] as const;

const SECTOR_OPTIONS = [
  "educación",
  "salud",
  "tecnología",
  "cultural",
  "ambiental",
  "agropecuario",
  "turismo",
  "comercio",
  "otro",
] as const;

export default function EntityCreateModal({
  isOpen,
  onClose,
  onCreatedAndLink,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreatedAndLink: (payload: {
    entityId: string;
    aporteEspecie: number;
    aporteEfectivo: number;
  }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    nit: "",
    typeEntity: "" as "" | (typeof TYPE_OPTIONS)[number],
    sector: "" as "" | (typeof SECTOR_OPTIONS)[number],
    representative: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    country: "Colombia",
    website: "",
  });
  const [aporteEspecie, setAporteEspecie] = useState("");
  const [aporteEfectivo, setAporteEfectivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  const handleChange = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.name.trim()) return "El nombre es obligatorio.";
    if (!form.nit.trim()) return "El NIT es obligatorio.";
    if (!form.typeEntity) return "El tipo de entidad es obligatorio.";
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      setMsg({ type: "danger", text: error });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        sector: form.sector || "otro",
      };
      const created = await createEntity(payload);
      onCreatedAndLink({
        entityId: created._id,
        aporteEspecie: Number(aporteEspecie) || 0,
        aporteEfectivo: Number(aporteEfectivo) || 0,
      });
      setMsg({
        type: "success",
        text: "Entidad creada y vinculada correctamente.",
      });
      setTimeout(() => {
        onClose();
        setMsg(null);
      }, 1200);
    } catch (e: any) {
      console.error(e);
      setMsg({
        type: "danger",
        text: e?.response?.data?.message || "No se pudo crear la entidad.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>Registrar nueva entidad</ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-500 mb-2">
            Registre datos obligatorios (*)
          </p>

          {msg && (
            <Alert color={msg.type} variant="solid" className="mb-3">
              {msg.text}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Nombre *"
              value={form.name}
              onValueChange={(v) => handleChange("name", v)}
            />
            <Input
              label="NIT *"
              value={form.nit}
              onValueChange={(v) => handleChange("nit", v)}
            />

            <Select
              label="Tipo de entidad *"
              selectedKeys={form.typeEntity ? [form.typeEntity] : []}
              onSelectionChange={(keys) =>
                handleChange("typeEntity", Array.from(keys)[0] as string)
              }
            >
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t}>{t}</SelectItem>
              ))}
            </Select>

            <Select
              label="Sector (opcional)"
              selectedKeys={form.sector ? [form.sector] : []}
              onSelectionChange={(keys) =>
                handleChange("sector", Array.from(keys)[0] as string)
              }
            >
              {SECTOR_OPTIONS.map((s) => (
                <SelectItem key={s}>{s}</SelectItem>
              ))}
            </Select>
          </div>

          {/* Accordion visualmente mejorado */}
          <Accordion
            className="mt-4 rounded-2xl border border-gray-200 shadow-sm bg-gray-50"
            itemClasses={{
              base: "py-1 px-2",
              trigger:
                "flex justify-between items-center text-gray-800 hover:text-blue-600 font-medium text-base transition-all",
              title: "font-semibold text-base",
              content: "pt-3 pb-1 px-2 bg-white rounded-xl mt-2 shadow-inner",
            }}
          >
            <AccordionItem
              key="1"
              aria-label="Información adicional"
              title="Información adicional de contacto"
              indicator={
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Representante"
                  value={form.representative}
                  onValueChange={(v) => handleChange("representative", v)}
                />
                <Input
                  label="Email de contacto"
                  type="email"
                  value={form.contactEmail}
                  onValueChange={(v) => handleChange("contactEmail", v)}
                />
                <Input
                  label="Teléfono"
                  value={form.contactPhone}
                  onValueChange={(v) => handleChange("contactPhone", v)}
                />
                <Input
                  label="Dirección"
                  value={form.address}
                  onValueChange={(v) => handleChange("address", v)}
                />
                <Input
                  label="Ciudad"
                  value={form.city}
                  onValueChange={(v) => handleChange("city", v)}
                />
                <Input
                  label="País"
                  value={form.country}
                  onValueChange={(v) => handleChange("country", v)}
                />
                <Input
                  label="Sitio web"
                  value={form.website}
                  onValueChange={(v) => handleChange("website", v)}
                />
              </div>
            </AccordionItem>
          </Accordion>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <Input
              label="Aporte en especie (vincular)"
              type="number"
              placeholder="0"
              value={aporteEspecie}
              onValueChange={setAporteEspecie}
            />
            <Input
              label="Aporte en efectivo (vincular)"
              type="number"
              placeholder="0"
              value={aporteEfectivo}
              onValueChange={setAporteEfectivo}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleSave}>
            Guardar y vincular
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
