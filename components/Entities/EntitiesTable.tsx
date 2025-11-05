"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  Switch,
  Spinner,
  Pagination,
  Chip,
  addToast,
} from "@heroui/react";
import {
  SearchIcon,
  PlusIcon,
  VerticalDotsIcon,
  RefreshCcwIcon,
  DownloadIcon,
  ChevronDownIcon,
} from "@/components/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toggleEntityActive, deleteEntity } from "@/services/entityService";
import EntityModal from "@/components/Entities/EntityModal";

export default function EntitiesTable({
  entities,
  loading,
}: {
  entities: any[];
  loading: boolean;
}) {
  const [data, setData] = useState<any[]>(entities);
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setData(entities);
  }, [entities]);

  // 🔍 Filtro
  const filtered = useMemo(() => {
    if (!filterValue) return data;
    const q = filterValue.toLowerCase();
    return data.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.nit.toLowerCase().includes(q) ||
        (e.city || "").toLowerCase().includes(q) ||
        (e.representative || "").toLowerCase().includes(q)
    );
  }, [filterValue, data]);

  const pages = Math.ceil(filtered.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const items = filtered.slice(start, start + rowsPerPage);

  // 🧩 Cambiar estado activo
  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const updated = await toggleEntityActive(id, current);
      setData((prev) =>
        prev.map((e) => (e._id === id ? { ...e, active: updated.active } : e))
      );
      addToast({
        title: "Estado actualizado",
        description: `La entidad ahora está ${
          updated.active ? "activa" : "inactiva"
        }.`,
        color: updated.active ? "success" : "danger",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo cambiar el estado.",
        color: "danger",
      });
    }
  };

  // 🗑️ Eliminar entidad
  const handleDelete = async (id: string) => {
    try {
      await deleteEntity(id);
      setData((prev) => prev.filter((e) => e._id !== id));
      addToast({
        title: "Entidad eliminada",
        description: "La entidad fue eliminada correctamente.",
        color: "danger",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo eliminar la entidad.",
        color: "danger",
      });
    }
  };

  // 📤 Exportar Excel
  const handleExportExcel = () => {
    if (!data.length) return;
    const rows = data.map((e) => ({
      Nombre: e.name,
      NIT: e.nit,
      Tipo: e.typeEntity,
      Sector: e.sector,
      Representante: e.representative || "N/A",
      Ciudad: e.city || "N/A",
      Estado: e.active ? "Activa" : "Inactiva",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entidades");
    XLSX.writeFile(wb, "entidades.xlsx");
  };

  // 📄 Exportar PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Listado de Entidades", 20, 20);
    const body = data.map((e) => [
      e.name,
      e.nit,
      e.typeEntity,
      e.sector,
      e.city,
      e.active ? "Activa" : "Inactiva",
    ]);
    autoTable(doc, {
      startY: 30,
      head: [["Nombre", "NIT", "Tipo", "Sector", "Ciudad", "Estado"]],
      body,
    });
    doc.save("entidades.pdf");
  };

  // 🔧 Render de celdas
  const renderCell = useCallback((entity: any, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return <p className="font-semibold">{entity.name}</p>;
      case "nit":
        return <p>{entity.nit}</p>;
      case "typeEntity":
        return (
          <Chip size="sm" color="primary" variant="flat">
            {entity.typeEntity}
          </Chip>
        );
      case "sector":
        return <p>{entity.sector}</p>;
      case "city":
        return <p>{entity.city || "N/A"}</p>;
      case "active":
        return (
          <Switch
            isSelected={entity.active}
            onChange={() => handleToggleActive(entity._id, entity.active)}
            color={entity.active ? "success" : "danger"}
          />
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
                  setSelectedEntity(entity);
                  setModalMode("view");
                  setIsModalOpen(true);
                }}
              >
                Ver
              </DropdownItem>
              <DropdownItem
                key="edit"
                onPress={() => {
                  setSelectedEntity(entity);
                  setModalMode("edit");
                  setIsModalOpen(true);
                }}
              >
                Editar
              </DropdownItem>
              <DropdownItem
                key="delete"
                color="danger"
                onPress={() => handleDelete(entity._id)}
              >
                Eliminar
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return (entity as any)[columnKey];
    }
  }, []);

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <Input
          isClearable
          placeholder="Buscar por nombre, NIT o ciudad..."
          startContent={<SearchIcon />}
          className="w-full sm:max-w-[40%]"
          value={filterValue}
          onValueChange={setFilterValue}
        />
        <div className="flex gap-2">
          <Button
            color="default"
            variant="flat"
            startContent={<RefreshCcwIcon />}
            onPress={() => window.location.reload()}
          >
            Refrescar
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
            <DropdownMenu aria-label="Exportar">
              <DropdownItem key="excel" onPress={handleExportExcel}>
                Excel
              </DropdownItem>
              <DropdownItem key="pdf" onPress={handleExportPDF}>
                PDF
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Button
            color="primary"
            endContent={<PlusIcon />}
            onPress={() => {
              setSelectedEntity(null);
              setModalMode("create");
              setIsModalOpen(true);
            }}
          >
            Nueva Entidad
          </Button>
        </div>
      </div>

      <Table
        aria-label="Tabla de entidades"
        selectionMode="none"
        bottomContentPlacement="outside"
      >
        <TableHeader>
          <TableColumn key="name">Nombre</TableColumn>
          <TableColumn key="nit">NIT</TableColumn>
          <TableColumn key="typeEntity">Tipo</TableColumn>
          <TableColumn key="sector">Sector</TableColumn>
          <TableColumn key="city">Ciudad</TableColumn>
          <TableColumn key="active">Estado</TableColumn>
          <TableColumn key="actions" align="center">
            Acciones
          </TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          isLoading={loading}
          emptyContent="No hay entidades registradas"
          loadingContent={
            <Spinner color="primary" label="Cargando entidades..." />
          }
        >
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, String(columnKey))}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <EntityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entity={selectedEntity}
        mode={modalMode}
        onSave={() => window.location.reload()}
      />
    </>
  );
}
