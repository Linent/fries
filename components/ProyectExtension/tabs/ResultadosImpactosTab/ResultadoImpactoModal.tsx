"use client";

import { useState } from "react";
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
  Textarea,
} from "@heroui/react";

interface Props {
  type: "result" | "impact";
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function ResultadoImpactoModal({
  type,
  isOpen,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState({
    product: "",
    acceptanceCriteria: "",
    indicator: "",
    beneficiary: "",
    expectedImpact: "",
    term: "",
    indicators: "",
    assumptions: "",
  });

  const handleSave = () => {
    if (type === "result") {
      if (!form.product.trim()) return;
      onSave({
        product: form.product,
        acceptanceCriteria: form.acceptanceCriteria,
        indicator: form.indicator,
        beneficiary: form.beneficiary,
      });
    } else {
      if (!form.expectedImpact.trim() || !form.term) return;
      onSave({
        expectedImpact: form.expectedImpact,
        term: form.term,
        indicators: form.indicators,
        assumptions: form.assumptions,
      });
    }
    setForm({
      product: "",
      acceptanceCriteria: "",
      indicator: "",
      beneficiary: "",
      expectedImpact: "",
      term: "",
      indicators: "",
      assumptions: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader>
          {type === "result"
            ? "Agregar resultado o producto"
            : "Agregar impacto esperado"}
        </ModalHeader>
        <ModalBody>
          {type === "result" ? (
            <>
              <Textarea
                label="Resultado o producto"
                placeholder="Describe el resultado o producto"
                value={form.product}
                onValueChange={(v) => setForm((p) => ({ ...p, product: v }))}
              />
              <Textarea
                label="Criterio de aceptación"
                placeholder="Criterio de aceptación"
                value={form.acceptanceCriteria}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, acceptanceCriteria: v }))
                }
              />
              <Textarea
                label="Indicador verificable"
                placeholder="Indicador verificable"
                value={form.indicator}
                onValueChange={(v) => setForm((p) => ({ ...p, indicator: v }))}
              />
              <Input
                label="Beneficiario"
                placeholder="Beneficiario"
                value={form.beneficiary}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, beneficiary: v }))
                }
              />
            </>
          ) : (
            <>
              <Input
                label="Impacto esperado"
                placeholder="Describe el impacto esperado"
                value={form.expectedImpact}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, expectedImpact: v }))
                }
              />
              <Select
                label="Plazo"
                placeholder="Seleccione una opción"
                selectedKeys={form.term ? [form.term] : []}
                onSelectionChange={(keys) =>
                  setForm((p) => ({
                    ...p,
                    term: Array.from(keys)[0] as string,
                  }))
                }
              >
                <SelectItem key="corto">Corto</SelectItem>
                <SelectItem key="mediano">Mediano</SelectItem>
                <SelectItem key="largo">Largo</SelectItem>
              </Select>
              <Input
                label="Indicadores"
                placeholder="Indicadores del impacto"
                value={form.indicators}
                onValueChange={(v) => setForm((p) => ({ ...p, indicators: v }))}
              />
              <Input
                label="Supuestos"
                placeholder="Supuestos del impacto"
                value={form.assumptions}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, assumptions: v }))
                }
              />
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" color="danger" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isDisabled={
              type === "result"
                ? !form.product.trim()
                : !form.expectedImpact.trim() || !form.term
            }
          >
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
