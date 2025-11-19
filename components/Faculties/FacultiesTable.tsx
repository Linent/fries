"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Alert,
  Pagination,
  addToast,
  Chip,
  Spinner,
  Switch,
} from "@heroui/react";
import {
  SearchIcon,
  PlusIcon,
  RefreshCcwIcon,
  DownloadIcon,
  ChevronDownIcon,
  VerticalDotsIcon,
} from "@/components/icons";
import FacultyModal from "./FacultyModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toggleFacultyActive, deleteFaculty } from "@/services/facultyService";

export default function FacultiesTable({ faculties, loading }: any) {
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [facultyList, setFacultyList] = useState(faculties);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">(
    "create"
  );
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [message, setMessage] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  React.useEffect(() => {
    setFacultyList(faculties);
  }, [faculties]);

  // 🔍 Filtrado
  const filteredFaculties = useMemo(() => {
    if (!filterValue) return facultyList.filter((f: any) => !f.deleted);
    const q = filterValue.toLowerCase();
    return facultyList.filter(
      (f: any) =>
        !f.deleted &&
        (f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          (f.description || "").toLowerCase().includes(q) ||
          (f.decano?.name || "").toLowerCase().includes(q))
    );
  }, [filterValue, facultyList]);

  const pages = Math.ceil(filteredFaculties.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const items = filteredFaculties.slice(start, start + rowsPerPage);

  // 📤 Exportar Excel
  const handleExportExcel = () => {
    if (!facultyList.length) {
      addToast({
        title: "Sin datos",
        description: "No hay facultades para exportar.",
        color: "warning",
      });
      return;
    }

    const data = facultyList
      .filter((f: any) => !f.deleted)
      .map((f: any) => ({
        Código: f.code,
        Nombre: f.name,
        Descripción: f.description || "N/A",
        Decano: f.decano ? `${f.decano.name} (${f.decano.email})` : "N/A",
        Estado: f.active ? "Activa" : "Inactiva",
      }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Facultades");
    XLSX.writeFile(workbook, "facultades.xlsx");
  };

  // 📄 Exportar PDF
  const handleExportPDF = () => {
    if (!facultyList.length) {
      addToast({
        title: "Sin datos",
        description: "No hay facultades para exportar.",
        color: "warning",
      });
      return;
    }

    const doc = new jsPDF();
    doc.text("Reporte de Facultades", 20, 20);

    const body = facultyList
      .filter((f: any) => !f.deleted)
      .map((f: any) => [
        f.code,
        f.name,
        f.description || "N/A",
        f.decano ? `${f.decano.name} (${f.decano.email})` : "N/A",
        f.active ? "Activa" : "Inactiva",
      ]);

    autoTable(doc, {
      startY: 30,
      head: [["Código", "Nombre", "Descripción", "Decano", "Estado"]],
      body,
    });

    doc.save("facultades.pdf");
  };

  // 🆕 Crear o editar facultad
  const handleSaveFaculty = (saved: any) => {
    setFacultyList((prev: any[]) => {
      const exists = prev.some((f) => f._id === saved._id);
      return exists
        ? prev.map((f) => (f._id === saved._id ? saved : f))
        : [saved, ...prev];
    });

    addToast({
      title: modalMode === "edit" ? "Facultad actualizada" : "Facultad creada",
      description:
        modalMode === "edit"
          ? "Los datos se han actualizado correctamente."
          : "Se ha registrado una nueva facultad.",
      color: "success",
    });

    setIsModalOpen(false);
  };

  // 🔄 Activar/desactivar facultad
  const handleToggleActive = async (id: string) => {
    try {
      const updated = await toggleFacultyActive(id);
      setFacultyList((prev: any[]) =>
        prev.map((f: any) =>
          f._id === id ? { ...f, active: updated.active } : f
        )
      );

      addToast({
        title: updated.active ? "Facultad activada" : "Facultad desactivada",
        description: `La facultad ahora está ${
          updated.active ? "activa" : "inactiva"
        }.`,
        color: updated.active ? "success" : "danger",
      });
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado.",
        color: "danger",
      });
    }
  };

  // 🗑️ Eliminar (marcar como deleted)
  const handleDelete = async (id: string) => {
    try {
      await deleteFaculty(id);
      setFacultyList((prev: any[]) =>
        prev.map((f: any) => (f._id === id ? { ...f, deleted: true } : f))
      );

      addToast({
        title: "Facultad eliminada",
        description: "La facultad ha sido marcada como eliminada.",
        color: "danger",
      });
    } catch (error: any) {
      addToast({
        title: "Error",
        description: "No se pudo eliminar la facultad.",
        color: "danger",
      });
    }
  };

  // ⚙️ Render de celdas
  const renderCell = useCallback((faculty: any, columnKey: string) => {
    switch (columnKey) {
      case "code":
        return <p className="font-medium">{faculty.code}</p>;

      case "name":
        return <p>{faculty.name}</p>;

      case "description":
        return <p>{faculty.description || "Sin descripción"}</p>;

      case "decano":
        return (
          <p className="text-gray-700">
            {faculty.decano
              ? `${faculty.decano.name} (${faculty.decano.email})`
              : "N/A"}
          </p>
        );

      case "active":
        return (
          <div className="flex items-center gap-2">
            <Switch
              isSelected={faculty.active}
              color={faculty.active ? "success" : "danger"}
              size="sm"
              onChange={() => handleToggleActive(faculty._id)}
            />
            <Chip
              color={faculty.active ? "success" : "danger"}
              variant="flat"
              size="sm"
            >
              {faculty.active ? "Activa" : "Inactiva"}
            </Chip>
          </div>
        );

      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <VerticalDotsIcon className="text-default-300" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="view"
                onPress={() => {
                  setSelectedFaculty(faculty);
                  setModalMode("view");
                  setIsModalOpen(true);
                }}
              >
                Ver detalles
              </DropdownItem>

              <DropdownItem
                key="edit"
                onPress={() => {
                  setSelectedFaculty(faculty);
                  setModalMode("edit");
                  setIsModalOpen(true);
                }}
              >
                Editar
              </DropdownItem>

              <DropdownItem
                key="delete"
                color="danger"
                onPress={() => handleDelete(faculty._id)}
              >
                Eliminar
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      default:
        return faculty[columnKey];
    }
  }, []);

  // 🔼 Top Content
  const topContent = (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <Input
          isClearable
          placeholder="Buscar por nombre, código, decano o descripción..."
          startContent={<SearchIcon />}
          className="w-full sm:max-w-[40%]"
          value={filterValue}
          onValueChange={setFilterValue}
          onClear={() => setFilterValue("")}
        />

        <div className="flex gap-2">
          <Button
            color="default"
            variant="flat"
            startContent={<RefreshCcwIcon />}
            onPress={() => setFilterValue("")}
          >
            Limpiar filtros
          </Button>

          <Dropdown>
            <DropdownTrigger>
              <Button
                color="success"
                variant="flat"
                startContent={<DownloadIcon />}
                endContent={<ChevronDownIcon />}
              >
                Exportar
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Opciones de exportación">
              <DropdownItem key="excel" onPress={handleExportExcel}>
                Exportar a Excel
              </DropdownItem>
              <DropdownItem key="pdf" onPress={handleExportPDF}>
                Exportar a PDF
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Button
            color="primary"
            endContent={<PlusIcon />}
            onPress={() => {
              setSelectedFaculty(null);
              setModalMode("create");
              setIsModalOpen(true);
            }}
          >
            Nueva facultad
          </Button>
        </div>
      </div>

      {message && (
        <Alert color={message.type} variant="solid">
          {message.text}
        </Alert>
      )}

      <div className="flex justify-end text-sm text-gray-500">
        Mostrando {items.length} de{" "}
        {facultyList.filter((f: any) => !f.deleted).length} facultades
      </div>
    </div>
  );

  // 🔽 Bottom Content
  const bottomContent = (
    <div className="flex justify-between items-center py-2 px-2">
      <Pagination
        showControls
        color="primary"
        page={page}
        total={pages || 1}
        onChange={setPage}
      />
      <label className="flex items-center text-sm text-gray-500">
        Filas por página:
        <select
          className="ml-2 bg-transparent outline-none text-gray-700"
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          value={rowsPerPage}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </label>
    </div>
  );

  return (
    <>
      <Table
        aria-label="Tabla de facultades"
        topContent={topContent}
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        selectionMode="none"
      >
        <TableHeader>
          <TableColumn key="code">Código</TableColumn>
          <TableColumn key="name">Nombre</TableColumn>
          <TableColumn key="description">Descripción</TableColumn>

          {/* ⭐ NUEVA COLUMNA DECANO */}
          <TableColumn key="decano">Decano</TableColumn>

          <TableColumn key="active">Estado</TableColumn>
          <TableColumn key="actions" align="center">
            Acciones
          </TableColumn>
        </TableHeader>

        <TableBody
          items={items}
          emptyContent="No se encontraron facultades."
          isLoading={loading}
          loadingContent={
            <Spinner color="danger" label="Cargando facultades..." />
          }
        >
          {(item: any) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, String(columnKey))}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <FacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleSaveFaculty}
        mode={modalMode}
        faculty={selectedFaculty}
      />
    </>
  );
}
