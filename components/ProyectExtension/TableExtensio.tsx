"use client";

import React, { useCallback, useMemo, useState } from "react";
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
  DateRangePicker,
  Alert,
  SortDescriptor,
  Selection,
} from "@heroui/react";
import { Spinner } from "@heroui/spinner";

import ProjectModal from "@/components/ProyectExtension/ProjectModal";
import {
  ChevronDownIcon,
  SearchIcon,
  VerticalDotsIcon,
  PlusIcon,
  UploadIcon,
  DownloadIcon,
  RefreshCcwIcon,
} from "@/components/icons";

import { useRouter } from "next/navigation";
import { getTokenPayload } from "@/utils/auth";
import { projectStatusMap, Project, ProjectsTableProps } from "@/types";
import { useProjectExport } from "@/components/ProyectExtension/hooks/useProjectExport";

// ─────────────────────────────────────────────
// 🧠 LOGICA DE PERMISOS
// ─────────────────────────────────────────────
const canEditProject = (
  project: Project,
  roles: string[] = [],
  userId?: string
) => {
  if (roles.includes("administrador")) return true;
  if (roles.includes("fries")) return true;

  if (roles.includes("formulador")) {
    const owner =
      (typeof project.createdBy === "object" &&
        project.createdBy?._id === userId) ||
      project.createdBy === userId;
    return owner && project.status === "en_formulacion";
  }

  return false;
};

// ─────────────────────────────────────────────
// 🎯 FILTRADO GLOBAL POR ROLES
// ─────────────────────────────────────────────
function filterByUserRoles(projects: Project[]): Project[] {
  const user = getTokenPayload();
  const userId = user?.id;
  const roles: string[] = user?.roles ?? [];

  return projects.filter((project) => {
    if (roles.includes("administrador")) return true;
    if (roles.includes("fries")) return true;

    if (roles.includes("formulador")) {
      return (
        (typeof project.createdBy === "object" &&
          project.createdBy?._id === userId) ||
        project.createdBy === userId
      );
    }

    if (roles.includes("decano")) {
      const isDecano = (project as any).faculty?.decano?._id === userId;
      const isReview = project.status === "en_revision_decano";
      return isDecano || isReview;
    }

    if (roles.includes("director_programa")) {
      const isDirector = (project as any).program?.director?._id === userId;
      const isReview = project.status === "en_revision_director";
      return isDirector || isReview;
    }

    return false;
  });
}

// Opciones de filtros
const statusOptions = Object.entries(projectStatusMap).map(
  ([key, { label }]) => ({
    key,
    label,
  })
);

const projectTypeOptions = [
  { key: "Remunerado", label: "Remunerado" },
  { key: "Solidarío", label: "Solidarío" },
];

// ─────────────────────────────────────────────
// 📌 COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function ProjectsTableAdvanced({
  projects,
  loading,
  onCreate,
}: ProjectsTableProps) {
  const router = useRouter();
  const user = getTokenPayload();
  const roles = user?.roles ?? [];
  const userId = user?.id;

  const { exportToExcel, exportToPDF, message } = useProjectExport();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [statusFilter, setStatusFilter] = useState<Selection>(new Set([]));
  const [typeFilter, setTypeFilter] = useState<Selection>(new Set([]));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  });

  const isPrivileged = roles.some((r) =>
    ["administrador", "fries"].includes(r)
  );

  const allowedProjects = useMemo(
    () => filterByUserRoles(projects),
    [projects]
  );

  const sanitizedProjects = useMemo(
    () =>
      allowedProjects.map((p, index) => ({
        ...p,
        id: p._id || `${p.code}-${index}`,
      })),
    [allowedProjects]
  );

  const filteredProjects = useMemo(() => {
    let data = [...sanitizedProjects];

    if (filterValue) {
      const q = filterValue.toLowerCase();
      data = data.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      );
    }

    if (dateRange.start && dateRange.end) {
      data = data.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= dateRange.start! && d <= dateRange.end!;
      });
    }

    if (statusFilter !== "all" && (statusFilter as Set<string>).size > 0) {
      const set = statusFilter as Set<string>;
      data = data.filter((p) => set.has(p.status));
    }

    if (typeFilter !== "all" && (typeFilter as Set<string>).size > 0) {
      const set = typeFilter as Set<string>;
      data = data.filter((p) => set.has(p.typeProject || ""));
    }

    return data;
  }, [filterValue, dateRange, statusFilter, typeFilter, sanitizedProjects]);

  const sortedItems = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const key = sortDescriptor.column as keyof Project;
      const first = (a as any)[key];
      const second = (b as any)[key];

      if (sortDescriptor.direction === "descending") {
        return first > second ? -1 : 1;
      }
      return first > second ? 1 : -1;
    });
  }, [filteredProjects, sortDescriptor]);

  const pages = Math.ceil(filteredProjects.length / rowsPerPage) || 1;
  const start = (page - 1) * rowsPerPage;
  const items = sortedItems.slice(start, start + rowsPerPage);

  const renderStatus = (status: string) => {
    const s = projectStatusMap[status] || {
      label: status,
      color: "bg-gray-200 text-gray-700",
    };
    return (
      <Chip className={`capitalize ${s.color}`} size="sm" variant="flat">
        {s.label}
      </Chip>
    );
  };

  const renderCell = useCallback(
    (project: Project, columnKey: string) => {
      switch (columnKey) {
        case "code":
          return <p className="font-medium">{project.code}</p>;
        case "title":
          return <p className="font-medium">{project.title}</p>;
        case "typeProject":
          return <p>{project.typeProject || "No definido"}</p>;
        case "status":
          return renderStatus(project.status);
        case "faculty":
          return <p>{(project as any).faculty?.name || "Sin facultad"}</p>;
        case "createdAt":
          return new Date(project.createdAt).toLocaleDateString("es-CO");
        case "actions": {
          const projectId = project._id;
          const editable = canEditProject(project, roles, userId);

          return (
            <div className="flex justify-center">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <VerticalDotsIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="main"
                    onPress={() =>
                      router.push(
                        `/extension/${projectId}?mode=${
                          editable ? "edit" : "view"
                        }`
                      )
                    }
                  >
                    {editable ? "Editar" : "Ver detalle"}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        }
        default:
          return (project as any)[columnKey];
      }
    },
    [roles, userId, router]
  );

  const handleExportExcel = () => exportToExcel(filteredProjects);
  const handleExportPDF = () => exportToPDF(filteredProjects);

  const topContent = (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <Input
          isClearable
          placeholder="Buscar por código o título..."
          startContent={<SearchIcon />}
          className="w-full sm:max-w-[40%]"
          value={filterValue}
          onValueChange={setFilterValue}
          onClear={() => setFilterValue("")}
        />
        <DateRangePicker
          className="max-w-xs"
          label="Filtrar por fechas"
          onChange={(range: any) =>
            setDateRange({
              start: range?.start ? new Date(range.start) : undefined,
              end: range?.end ? new Date(range.end) : undefined,
            })
          }
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-between items-center">
        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" endContent={<ChevronDownIcon />}>
                Estado
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="multiple"
              selectedKeys={statusFilter}
              onSelectionChange={setStatusFilter}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.key}>{status.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" endContent={<ChevronDownIcon />}>
                Tipo
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="multiple"
              selectedKeys={typeFilter}
              onSelectionChange={setTypeFilter}
            >
              {projectTypeOptions.map((type) => (
                <DropdownItem key={type.key}>{type.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Button
            color="default"
            variant="flat"
            startContent={<RefreshCcwIcon />}
            onPress={() => {
              setFilterValue("");
              setDateRange({});
              setStatusFilter(new Set([]));
              setTypeFilter(new Set([]));
              setSortDescriptor({
                column: "createdAt",
                direction: "descending",
              });
            }}
          >
            Limpiar filtros
          </Button>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 flex-wrap">
          {isPrivileged && (
            <>
              <Button
                color="primary"
                variant="flat"
                startContent={<UploadIcon />}
              >
                Subir CSV/XLSX
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
                <DropdownMenu>
                  <DropdownItem key="excel" onPress={handleExportExcel}>
                    Exportar a Excel
                  </DropdownItem>
                  <DropdownItem key="pdf" onPress={handleExportPDF}>
                    Exportar a PDF
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          )}

          {roles.some((r) =>
            ["administrador", "fries", "formulador"].includes(r)
          ) && (
            <Button
              color="primary"
              endContent={<PlusIcon />}
              onPress={() => setIsModalOpen(true)}
            >
              Nuevo proyecto
            </Button>
          )}
        </div>
      </div>

      {message && (
        <Alert color={message.type} variant="solid">
          {message.text}
        </Alert>
      )}

      <div className="flex justify-end text-sm text-gray-500">
        Mostrando {items.length} de {filteredProjects.length} proyectos
      </div>
    </div>
  );

  const bottomContent = (
    <div className="flex justify-between items-center py-2 px-2">
      <Pagination
        showControls
        color="primary"
        page={page}
        total={pages}
        onChange={setPage}
      />

      <label className="flex items-center text-sm text-gray-500">
        Filas por página:
        <select
          className="ml-2 bg-transparent outline-none text-gray-700"
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
          }}
          value={rowsPerPage}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </label>
    </div>
  );

  return (
    <>
      <Table
        aria-label="Tabla avanzada de proyectos de extensión"
        topContent={topContent}
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        selectionMode="none"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader>
          <TableColumn key="code" allowsSorting>
            Código
          </TableColumn>
          <TableColumn key="typeProject" allowsSorting>
            Tipo de proyecto
          </TableColumn>
          <TableColumn key="title" allowsSorting>
            Título
          </TableColumn>
          <TableColumn key="faculty" allowsSorting>
            Facultad
          </TableColumn>
          <TableColumn key="status" allowsSorting>
            Estado
          </TableColumn>
          <TableColumn key="createdAt" allowsSorting>
            Fecha
          </TableColumn>
          <TableColumn key="actions" align="center">
            Acciones
          </TableColumn>
        </TableHeader>

        <TableBody
          items={items}
          emptyContent={"No se encontraron proyectos."}
          isLoading={loading}
          loadingContent={
            <Spinner color="danger" label="Cargando proyectos..." />
          }
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, String(columnKey))}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 🔥 AQUI ESTA EL FIX PARA REFRESCAR AUTOMATICAMENTE */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={() => {
          setIsModalOpen(false);
          onCreate?.(); // refresca desde Page.jsx
        }}
      />
    </>
  );
}
