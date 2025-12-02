"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Pagination,
  Chip,
  Alert,
} from "@heroui/react";

import {
  PlusIcon,
  VerticalDotsIcon,
  SearchIcon,
  RefreshCcwIcon,
} from "@/components/icons";

import React, { useMemo, useState } from "react";
import ProgramModal from "@/components/Programs/ProgramModal";
import { ProgramTableProps, Program, ProgramUpsertDTO } from "@/types/types";

export default function ProgramTable({
  programs,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
}: ProgramTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // control local de loading
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  // ---- Filtros ----
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [directorFilter, setDirectorFilter] = useState("all");

  // ---- Paginación ----
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  // ---- Facultades únicas ----
  const facultyOptions = useMemo(() => {
    const set = new Set<string>();
    programs.forEach((p) => {
      if (p.faculty?.name) set.add(p.faculty.name);
    });
    return ["all", ...Array.from(set)];
  }, [programs]);

  // ---- Directores únicos ----
  const directorOptions = useMemo(() => {
    const set = new Set<string>();
    programs.forEach((p) => {
      if (p.director)
        set.add(`${p.director.firstName} ${p.director.firstLastName}`);
    });
    return ["all", ...Array.from(set)];
  }, [programs]);

  // ---- Filtrar programas ----
  const filteredPrograms = useMemo(() => {
    let data = [...programs];

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.faculty?.name?.toLowerCase().includes(q)
      );
    }

    if (facultyFilter !== "all") {
      data = data.filter((p) => p.faculty?.name === facultyFilter);
    }

    if (directorFilter !== "all") {
      data = data.filter(
        (p) =>
          p.director &&
          `${p.director.firstName} ${p.director.firstLastName}` ===
            directorFilter
      );
    }

    return data;
  }, [programs, search, facultyFilter, directorFilter]);

  // ---- Paginación ----
  const pages = Math.ceil(filteredPrograms.length / rowsPerPage);

  const dataToShow = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredPrograms.slice(start, start + rowsPerPage);
  }, [filteredPrograms, page]);

  // ---- Limpiar filtros ----
  const clearFilters = () => {
    setSearch("");
    setFacultyFilter("all");
    setDirectorFilter("all");
    setPage(1);
  };

  // ----------------------------------------------------------
  // GUARDAR (crear o editar) → mostrar spinner → recargar → cerrar modal
  // ----------------------------------------------------------
  const handleSave = async (data: ProgramUpsertDTO) => {
  try {
    setSaving(true);

    if (selectedProgram) {
      await onEdit(selectedProgram._id, data);
    } else {
      await onCreate(data);
    }

    // recargar lista si existe
    if (onRefresh) {
      await onRefresh();
    }

    setToast({
      type: "success",
      message: selectedProgram
        ? "Programa actualizado correctamente"
        : "Programa creado correctamente",
    });

    setModalOpen(false);
    setSelectedProgram(null);

    setTimeout(() => setToast(null), 2000);
  } catch (e) {
    setToast({
      type: "danger",
      message: "Error al guardar el programa",
    });
    setTimeout(() => setToast(null), 2000);
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="w-full">

      {toast && (
        <Alert color={toast.type} variant="flat" className="mb-4">
          {toast.message}
        </Alert>
      )}

      {/* ---- LOADING global ---- */}
      {loading || saving ? (
        <div className="flex flex-col justify-center items-center py-10">
          <Spinner size="lg" label="Cargando..." />
          {saving && <p className="mt-2 text-sm text-gray-600">Guardando cambios…</p>}
        </div>
      ) : (
        <>
          {/* ---- CONTENEDOR DE FILTROS ---- */}
          <div className="w-full bg-white rounded-xl p-4 mb-5 shadow-sm border border-gray-100">

            <div className="flex flex-wrap items-center justify-start gap-3">

              <Input
                className="w-full sm:w-64"
                startContent={<SearchIcon />}
                placeholder="Buscar programa..."
                value={search}
                onValueChange={setSearch}
                isClearable
                onClear={() => setSearch("")}
              />

              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" className="w-full sm:w-44 justify-between">
                    Facultad: {facultyFilter === "all" ? "Todas" : facultyFilter}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectionMode="single"
                  selectedKeys={[facultyFilter]}
                  onSelectionChange={(k) => {
                    const value = Array.from(k)[0] as string;
                    setFacultyFilter(value);
                    setPage(1);
                  }}
                >
                  {facultyOptions.map((f) => (
                    <DropdownItem key={f}>{f === "all" ? "Todas" : f}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" className="w-full sm:w-44 justify-between">
                    Director: {directorFilter === "all" ? "Todos" : directorFilter}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectionMode="single"
                  selectedKeys={[directorFilter]}
                  onSelectionChange={(k) => {
                    const value = Array.from(k)[0] as string;
                    setDirectorFilter(value);
                    setPage(1);
                  }}
                >
                  {directorOptions.map((d) => (
                    <DropdownItem key={d}>{d === "all" ? "Todos" : d}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <Button
                variant="flat"
                startContent={<RefreshCcwIcon />}
                className="w-full sm:w-40"
                onPress={clearFilters}
              >
                Limpiar filtros
              </Button>

              <Button
                color="primary"
                endContent={<PlusIcon />}
                className="w-full sm:w-48"
                onPress={() => setModalOpen(true)}
              >
                Nuevo Programa
              </Button>
            </div>

            <div className="flex justify-end text-sm text-gray-500 mt-2 pr-1">
              Mostrando {dataToShow.length} de {filteredPrograms.length} programas
            </div>
          </div>

          {/* ---- TABLA ---- */}
          <Table aria-label="Tabla de Programas Académicos">
            <TableHeader>
              <TableColumn>Código</TableColumn>
              <TableColumn>Nombre</TableColumn>
              <TableColumn>Facultad</TableColumn>
              <TableColumn>Director</TableColumn>
              <TableColumn>Acciones</TableColumn>
            </TableHeader>

            <TableBody emptyContent="No hay programas registrados.">
              {dataToShow.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.faculty?.name || "Sin facultad"}</TableCell>
                  <TableCell>
                    {p.director ? (
                      <Chip color="primary" variant="flat">
                        {p.director.firstName} {p.director.firstLastName}
                      </Chip>
                    ) : (
                      <Chip color="default" variant="flat">
                        Sin director
                      </Chip>
                    )}
                  </TableCell>

                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly variant="light">
                          <VerticalDotsIcon />
                        </Button>
                      </DropdownTrigger>

                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          onPress={() => {
                            setSelectedProgram(p);
                            setModalOpen(true);
                          }}
                        >
                          Editar
                        </DropdownItem>

                        <DropdownItem
                          key="delete"
                          color="danger"
                          className="text-danger"
                          onPress={() => onDelete(p._id)}
                        >
                          Eliminar
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-center mt-4">
            <Pagination
              showControls
              color="primary"
              page={page}
              total={pages || 1}
              onChange={setPage}
            />
          </div>
        </>
      )}

      {/* ---- MODAL ---- */}
      <ProgramModal
        isOpen={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setSelectedProgram(null);
          }
        }}
        program={selectedProgram}
        onSave={handleSave}
      />
    </div>
  );
}
