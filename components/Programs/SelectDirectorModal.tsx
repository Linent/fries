"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Button,
  Spinner,
} from "@heroui/react";

import React, { useEffect, useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { useProgramDirectors } from "./hooks/useProgramDirectors";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProgramId: string | null;
  currentDirectorId: string | null;
  onSelect: (directorId: string | null) => void;
}

export default function SelectDirectorModal({
  isOpen,
  onClose,
  currentProgramId,
  currentDirectorId,
  onSelect,
}: Props) {
  const { directors, loading, reloadDirectors } = useProgramDirectors();

  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // 🔥 Reset & Reload cuando se abra
  useEffect(() => {
    if (isOpen) {
      reloadDirectors();
      setLocalSelected(currentDirectorId);
      setSearch("");
      setPage(1);
    }
  }, [isOpen, currentDirectorId, reloadDirectors]);

  // 🔥 Filtrado
  const availableDirectors = useMemo(() => {
    return directors.filter((d) => {
      if (!d.assignedProgram) return true;
      if (d.assignedProgram === "" || d.assignedProgram === null) return true;
      if (currentProgramId && d.assignedProgram === currentProgramId) return true;
      return false;
    });
  }, [directors, currentProgramId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return availableDirectors.filter((d) => {
      const fn = `${d.firstName} ${d.firstLastName}`.toLowerCase();
      return fn.includes(q) || d.email.toLowerCase().includes(q);
    });
  }, [search, availableDirectors]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const directorsToShow = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  // 🔥 Guardar selección
  const handleSave = () => {
    onSelect(localSelected);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl" backdrop="blur">
      <ModalContent>
        <ModalHeader>Seleccionar Director del Programa</ModalHeader>

        <ModalBody className="flex flex-col gap-4">
          <Input
            placeholder="Buscar director..."
            startContent={<SearchIcon />}
            value={search}
            onValueChange={setSearch}
            className="max-w-sm"
            isClearable
          />

          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner label="Cargando directores..." />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableColumn>Sel.</TableColumn>
                  <TableColumn>Nombre</TableColumn>
                  <TableColumn>Email</TableColumn>
                  <TableColumn>Estado</TableColumn>
                </TableHeader>

                <TableBody emptyContent="No hay directores disponibles.">
                  {directorsToShow.map((d) => {
                    const isSelected = localSelected === d._id;

                    return (
                      <TableRow key={d._id}>
                        <TableCell>
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setLocalSelected(d._id)}
                          />
                        </TableCell>

                        <TableCell>{d.firstName} {d.firstLastName}</TableCell>
                        <TableCell>{d.email}</TableCell>

                        <TableCell>
                          {isSelected ? (
                            <Chip
                              color="primary"
                              variant="flat"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredId(d._id)}
                              onMouseLeave={() => setHoveredId(null)}
                              onClick={() => setLocalSelected(null)}
                            >
                              {hoveredId === d._id
                                ? "Quitar director"
                                : "Seleccionado"}
                            </Chip>
                          ) : (
                            <Chip color="success" variant="flat">Disponible</Chip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Pagination
                page={page}
                total={totalPages}
                onChange={setPage}
                showControls
                color="primary"
                className="mt-3"
              />
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>Cancelar</Button>
          <Button color="primary" onPress={handleSave}>
            Guardar selección
          </Button>
        </ModalFooter>

      </ModalContent>
    </Modal>
  );
}
