"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner
} from "@heroui/react";

import { fetchDeans } from "@/services/userServices";
import { SearchIcon } from "@/components/icons";

export default function DeanSelectorModal({
  isOpen,
  onClose,
  onSelect
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (dean: any) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [deans, setDeans] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchDeans();
        setDeans(list);
      } catch (error) {
        console.error("Error cargando decanos:", error);
      }
      setLoading(false);
    };

    load();
  }, [isOpen]);

  const filtered = deans.filter((d) => {
    const q = filter.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q)
    );
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="lg">
      <ModalContent>
        <ModalHeader>Seleccionar Decano</ModalHeader>

        <ModalBody>
          <Input
            placeholder="Buscar por nombre o correo..."
            startContent={<SearchIcon />}
            value={filter}
            onValueChange={setFilter}
          />

          <Table aria-label="Lista de decanos">
            <TableHeader>
              <TableColumn>Nombre</TableColumn>
              <TableColumn>Email</TableColumn>
              <TableColumn align="center">Seleccionar</TableColumn>
            </TableHeader>

            <TableBody
              isLoading={loading}
              loadingContent={<Spinner color="danger" label="Cargando..." />}
            >
              {filtered.map((d) => (
                <TableRow key={d._id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => {
                        onSelect(d);
                        onClose();
                      }}
                    >
                      Elegir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
