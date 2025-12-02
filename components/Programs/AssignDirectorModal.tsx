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
import { getDirectorsProgramRole } from "@/services/userServices";

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
  const [directors, setDirectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [localSelected, setLocalSelected] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 🔥 Mantener sincronizado el director actual
  useEffect(() => {
    setLocalSelected(currentDirectorId);
  }, [currentDirectorId]);

  // 🔥 Cargar directores
  useEffect(() => {
    if (isOpen) loadDirectors();
  }, [isOpen]);

  const loadDirectors = async () => {
    setLoading(true);
    const data = await getDirectorsProgramRole();
    setDirectors(data);
    setLoading(false);
  };

  // 🔥 Filtro corregido (incluye “programa eliminado”)
  const availableDirectors = useMemo(() => {
    return directors.filter((d) => {
      if (!d.assignedProgram) return true;
      if (currentProgramId && d.assignedProgram === currentProgramId) return true;
      if (d.assignedProgram === "" || d.assignedProgram === null) return true;
      return false;
    });
  }, [directors, currentProgramId]);

  const filteredDirectors = useMemo(() => {
    const q = search.toLowerCase();
    return availableDirectors.filter((d) => {
      const full = `${d.firstName} ${d.firstLastName}`.toLowerCase();
      return full.includes(q) || d.email.toLowerCase().includes(q);
    });
  }, [search, availableDirectors]);

  const totalPages = Math.ceil(filteredDirectors.length / rowsPerPage);

  const directorsToShow = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredDirectors.slice(start, start + rowsPerPage);
  }, [filteredDirectors, page]);

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
            isClearable
            className="max-w-sm"
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
                            name="director"
                            checked={isSelected}
                            onChange={() => setLocalSelected(d._id)}
                          />
                        </TableCell>

                        <TableCell>
                          {d.firstName} {d.firstLastName}
                        </TableCell>

                        <TableCell>{d.email}</TableCell>

                        <TableCell>
                          {isSelected ? (
                            <Chip
                              color="primary"
                              variant="flat"
                              className="cursor-pointer transition-all"
                              onMouseEnter={() => setHoveredId(d._id)}
                              onMouseLeave={() => setHoveredId(null)}
                              onClick={() => setLocalSelected(null)}
                            >
                              {hoveredId === d._id
                                ? "Quitar director"
                                : "Seleccionado"}
                            </Chip>
                          ) : (
                            <Chip color="success" variant="flat">
                              Disponible
                            </Chip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex justify-center mt-3">
                <Pagination
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                  showControls
                  color="primary"
                />
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>

          <Button
            color="primary"
            onPress={handleSave}
            isDisabled={localSelected === currentDirectorId}
          >
            Guardar selección
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
