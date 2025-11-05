"use client";
import { useState, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";

interface PoblacionModalProps {
  title: string;
  options: { label: string; value: string }[];
  usedValues: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (poblacion: { name: string; numberOfPeople: number }) => void;
}

export default function PoblacionModal({
  title,
  options,
  usedValues,
  isOpen,
  onClose,
  onSave,
}: PoblacionModalProps) {
  const [selected, setSelected] = useState("");
  const [cantidad, setCantidad] = useState(0);

  const availableOptions = useMemo(
    () => options.filter((opt) => !usedValues.includes(opt.value)),
    [options, usedValues]
  );

  const handleSave = () => {
    if (!selected || cantidad <= 0) return;
    onSave({ name: selected, numberOfPeople: cantidad });
    setSelected("");
    setCantidad(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" placement="center" backdrop="blur">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <Select
            label="Tipo de población"
            placeholder="Seleccione una opción"
            selectedKeys={selected ? [selected] : []}
            onChange={(e) => setSelected(e.target.value)}
          >
            {availableOptions.map((opt) => (
              <SelectItem key={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="Cantidad"
            type="number"
            min={0}
            value={cantidad.toString()}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" color="danger" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSave} isDisabled={!selected || cantidad <= 0}>
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
