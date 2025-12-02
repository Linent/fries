"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useMemo, useState, useCallback, useEffect } from "react";
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
  Chip,
  Pagination,
  Alert,
} from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import UserViewModal from "./UserViewModal";
import UserCreateModal from "./UserCreateModal";
import {
  SearchIcon,
  DownloadIcon,
  ChevronDownIcon,
  PlusIcon,
  VerticalDotsIcon,
  RefreshCcwIcon,
} from "@/components/icons";
import { getTokenPayload } from "@/utils/auth";
import { deleteUser, getUserById } from "@/services/userServices";
import UserEditModal from "./UserEditModal";

interface User {
  _id?: string;
  name: string;
  email: string;
  role: string;
  academic_program?: string;
  institucion?: string;
  dni?: string;
  enable: boolean;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onRefresh?: () => void; // ✅ Nuevo: refrescar lista tras crear usuario
}

export default function UsersTable({ users, loading, onRefresh }: UsersTableProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterValue, setFilterValue] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [userList, setUserList] = useState<User[]>(users);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const user = getTokenPayload();
  const userRoles: string[] = Array.isArray(user?.roles)
    ? user.roles
    : user?.roles
    ? [user.roles]
    : [];
  const isPrivileged = userRoles.some((r) => ["administrador", "fries"].includes(r));

  useEffect(() => {
    setUserList(users);
  }, [users]);

  const sanitizedUsers = useMemo(
    () =>
      userList.map((u, index) => ({
        ...u,
        id: u._id || `${u.email}-${index}`,
      })),
    [userList]
  );

  // 🔍 Filtrado
  const filteredUsers = useMemo(() => {
    let data = [...sanitizedUsers];
    if (filterValue) {
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          u.email.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return data;
  }, [filterValue, sanitizedUsers]);

  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const items = filteredUsers.slice(start, end);

  // 🟢 Estado visual de habilitado / deshabilitado
  const renderStatus = (enable: boolean) => {
    const label = enable ? "Activo" : "Inactivo";
    const color = enable ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700";
    return (
      <Chip className={`capitalize ${color}`} size="sm" variant="flat">
        {label}
      </Chip>
    );
  };

  // 📄 Exportar Excel
  const handleExportExcel = () => {
    if (!userList || userList.length === 0) {
      setMessage({ type: "danger", text: "No hay datos para exportar." });
      return;
    }

    const data = userList.map((u) => ({
      Nombre: u.name,
      Correo: u.email,
      Rol: u.role,
      Programa_Académico: u.academic_program || "N/A",
      Institución: u.institucion || "N/A",
      DNI: u.dni || "N/A",
      Estado: u.enable ? "Activo" : "Inactivo",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "usuarios.xlsx");
  };
  const handleDelete = async (user: User) => {
  if (user._id === getTokenPayload()?.id) {
    setMessage({ type: "danger", text: "No puedes eliminar tu propio usuario." });
    return;
  }

  const confirmDelete = confirm(`¿Eliminar a ${user.name}?`);
  if (!confirmDelete) return;

  try {
    await deleteUser(user._id!);
    setMessage({ type: "success", text: "Usuario eliminado correctamente." });

    setUserList(prev => prev.filter(u => u._id !== user._id));

    onRefresh?.();
  } catch (e) {
    setMessage({ type: "danger", text: "Error al eliminar usuario." });
  }
};
  // 📄 Exportar PDF
  const handleExportPDF = () => {
    if (!userList || userList.length === 0) {
      setMessage({ type: "danger", text: "No hay datos para exportar." });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
    doc.setFontSize(14);
    doc.text("Reporte de Usuarios", 40, 40);
    doc.setFontSize(10);
    const username = user?.name || "Usuario desconocido";
    const date = new Date().toLocaleString("es-CO");
    doc.text(`Generado por: ${username}`, 40, 55);
    doc.text(`Fecha de generación: ${date}`, 40, 70);

    const tableData = userList.map((u) => [
      u.name,
      u.email,
      u.role,
      u.academic_program || "N/A",
      u.institucion || "N/A",
      u.dni || "N/A",
      u.enable ? "Activo" : "Inactivo",
    ]);

    autoTable(doc, {
      startY: 90,
      head: [["Nombre", "Correo", "Rol", "Programa académico", "Institución", "DNI", "Estado"]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [200, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 40, right: 40 },
    });

    doc.save("usuarios.pdf");
  };

  // 📦 Render de celdas
  const renderCell = useCallback(
    (user: User, columnKey: string) => {
      switch (columnKey) {
        case "name":
          return <p className="font-medium">{user.name}</p>;
        case "email":
          return <p>{user.email}</p>;
        case "role":
          return <Chip color="primary" size="sm" variant="flat">{user.role}</Chip>;
        case "academic_program":
          return <p>{user.academic_program || "N/A"}</p>;
        case "institucion":
          return <p>{user.institucion || "N/A"}</p>;
        case "dni":
          return <p>{user.dni || "N/A"}</p>;
        case "enable":
          return renderStatus(user.enable);
        case "actions":
          return (
            <div className="flex justify-center">
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
                      setSelectedUserId(user._id || null);
                      setIsViewModalOpen(true);
                    }}
                  >
                    Ver detalles
                  </DropdownItem>
                  <DropdownItem
  key="edit"
  color="primary"
  onPress={() => {
    setSelectedUserId(user._id || null);
    setIsEditModalOpen(true);
  }}
>
  Editar
</DropdownItem>
                  {isPrivileged ? (
  <DropdownItem
    key="delete"
    color="danger"
    onPress={() => handleDelete(user)}
  >
    Eliminar
  </DropdownItem>
):null}
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return (user as any)[columnKey];
      }
    },
    [isPrivileged]
  );

  const topContent = (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <Input
          isClearable
          placeholder="Buscar por nombre o correo..."
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
            onPress={() => {
              setFilterValue("");
              setMessage(null);
            }}
          >
            Limpiar filtros
          </Button>

          {isPrivileged && (
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
          )}

          <Button
            color="primary"
            endContent={<PlusIcon />}
            onPress={() => setIsCreateModalOpen(true)}
          >
            Nuevo usuario
          </Button>
        </div>
      </div>

      {message && (
        <Alert color={message.type} variant="solid">
          {message.text}
        </Alert>
      )}

      <div className="flex justify-end text-sm text-gray-500">
        Mostrando {items.length} de {sanitizedUsers.length} usuarios
      </div>
    </div>
  );

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
          <option value={15}>15</option>
        </select>
      </label>
    </div>
  );

  return (
    <>
      <Table
        aria-label="Tabla de usuarios"
        topContent={topContent}
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        selectionMode="none"
      >
        <TableHeader>
          <TableColumn key="name">Nombre</TableColumn>
          <TableColumn key="dni">DNI</TableColumn>
          <TableColumn key="email">Correo</TableColumn>
          <TableColumn key="academic_program">Programa académico</TableColumn>
          <TableColumn key="institucion">Institución</TableColumn>
          <TableColumn key="role">Rol</TableColumn>
          <TableColumn key="enable">Estado</TableColumn>
          <TableColumn key="actions" align="center">
            Acciones
          </TableColumn>
        </TableHeader>

        <TableBody
          items={items}
          emptyContent={"No se encontraron usuarios."}
          isLoading={loading}
          loadingContent={<Spinner color="danger" label="Cargando usuarios..." />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, String(columnKey))}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 🔹 Modales integrados */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={onRefresh}
      />
      <UserEditModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  userId={selectedUserId}
  onSuccess={onRefresh}
/>
      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        userId={selectedUserId}
      />
    </>
  );
}
