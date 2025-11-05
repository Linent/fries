"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useCallback, useMemo, useState, useEffect } from "react";
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
import { useRouter } from "next/router";
import { getTokenPayload } from "@/utils/auth";
import { projectStatusMap, Project, ProjectsTableProps } from "@/types";

// ──────────────────────────────────────────────────────────────
// Helpers de permisos
// ──────────────────────────────────────────────────────────────
const canEditProject = (project: Project, role?: string, userId?: string) => {
  if (!role) return false;
  if (role === "administrador") return true;

  if (role === "fries") {
    // FRIES solo edita cuando está en formulación
    return project.status === "en_formulacion";
  }

  if (role === "formulador") {
    // El formulador edita SOLO sus proyectos y SOLO en formulación
    const owner =
      (project as any)?.createdBy?._id === userId ||
      (project as any)?.createdBy === userId;
    return owner && project.status === "en_formulacion";
  }

  // Otros roles (director/decano/vicerrector) no editan desde aquí
  return false;
};

// ──────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────
export default function ProjectsTableAdvanced({
  projects,
  loading,
  onCreate,
}: ProjectsTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortKey, setSortKey] = useState<"title" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [message, setMessage] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  const user = getTokenPayload();
  const role = user?.role as string | undefined;
  const userId = (user as any)?._id || (user as any)?.id;
  const isPrivileged = ["administrador", "fries"].includes(role || "");

  // 🔁 Actualiza lista si cambian las props
  useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  // 🧩 IDs únicos
  const sanitizedProjects = useMemo(
    () =>
      projectList.map((p, index) => ({
        ...p,
        id: (p as any)._id || (p as any).id || `${p.code || "proj"}-${index}`,
      })),
    [projectList]
  );

  // 🔍 Filtrado y orden
  const filteredProjects = useMemo(() => {
    let data = [...sanitizedProjects];

    if (filterValue) {
      const q = filterValue.toLowerCase();
      data = data.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
      );
    }

    if (dateRange.start && dateRange.end) {
      data = data.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= dateRange.start! && d <= dateRange.end!;
      });
    }

    data.sort((a, b) => {
      if (sortKey === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return data;
  }, [filterValue, dateRange, sortKey, sortOrder, sanitizedProjects]);

  const pages = Math.ceil(filteredProjects.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const items = filteredProjects.slice(start, start + rowsPerPage);

  // 🎨 Estado visual
  const renderStatus = (status: string) => {
    const s = projectStatusMap[status] || {
      label: status,
      color: "bg-gray-100 text-gray-700",
    };
    return (
      <Chip className={`capitalize ${s.color}`} size="sm" variant="flat">
        {s.label}
      </Chip>
    );
  };

  // 📄 Exportar Excel
  const handleExportExcel = () => {
    if (!projectList.length) {
      setMessage({ type: "danger", text: "No hay datos para exportar." });
      return;
    }

    const data = projectList.map((p) => ({
      Código: p.code || "",
      Título: p.title || "",
      Estado: projectStatusMap[p.status]?.label || p.status,
      Facultad: (p as any).faculty?.name || "Sin facultad",
      FechaCreación: new Date(p.createdAt).toLocaleString("es-CO"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proyectos");
    XLSX.writeFile(workbook, "proyectos-extension.xlsx");
  };

  // 📄 Exportar PDF
  const handleExportPDF = () => {
    if (!projectList.length) {
      setMessage({ type: "danger", text: "No hay datos para exportar." });
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    doc.setFontSize(14);
    doc.text("Reporte de Proyectos de Extensión", 40, 40);
    doc.setFontSize(10);
    const username = (user as any)?.name || "Usuario";
    const date = new Date().toLocaleString("es-CO");
    doc.text(`Generado por: ${username}`, 40, 55);
    doc.text(`Fecha: ${date}`, 40, 70);

    const body = projectList.map((p) => [
      p.code || "",
      p.title || "",
      projectStatusMap[p.status]?.label || p.status,
      (p as any).faculty?.name || "Sin facultad",
      new Date(p.createdAt).toLocaleDateString("es-CO"),
    ]);

    autoTable(doc, {
      startY: 90,
      head: [["Código", "Título", "Estado", "Facultad", "Fecha"]],
      body,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [200, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 40, right: 40 },
    });
    doc.save("proyectos-extension.pdf");
  };

  // 🆕 Nuevo proyecto desde modal
  const handleCreateProject = (created: Project) => {
    setProjectList((prev) => [created, ...prev]);
    setMessage({ type: "success", text: "Proyecto creado exitosamente." });
  };

  // ⚙️ Render de celdas
  const renderCell = useCallback(
    (project: Project, columnKey: string) => {
      switch (columnKey) {
        case "code":
          return <p className="font-medium">{project.code}</p>;
        case "title":
          return <p className="font-medium">{project.title}</p>;
        case "status":
          return renderStatus(project.status);
        case "faculty":
          return <p>{(project as any).faculty?.name || "Sin facultad"}</p>;
        case "createdAt":
          return (
            <span>
              {new Date(project.createdAt).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          );
        case "actions": {
          const projectId = (project as any)._id || (project as any).id;
          const editable = canEditProject(project, role, userId);

          return (
            <div className="flex justify-center">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <VerticalDotsIcon className="text-default-300" />
                  </Button>
                </DropdownTrigger>

                <DropdownMenu>
                  {/* Acción principal */}
                  <DropdownItem
                    key="main"
                    onPress={() =>
                      router.push(
                        `/extension/${projectId}?mode=${editable ? "edit" : "view"}`
                      )
                    }
                  >
                    {editable ? "Editar" : "Ver detalle"}
                  </DropdownItem>

                  {/* Solo mostrar “Intentar editar” si es privilegiado y no editable */}
                  {isPrivileged && !editable ? (
                    <DropdownItem
                      key="edit-force"
                      color="primary"
                      onPress={() =>
                        router.push(`/extension/${projectId}?mode=edit`)
                      }
                    >
                      Intentar editar
                    </DropdownItem>
                  ) : null}
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        }
        default:
          return (project as any)[columnKey];
      }
    },
    [role, userId, isPrivileged, router]
  );

  // 🔝 Contenido superior
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

        <div className="flex gap-2">
          <Button
            color="default"
            variant="flat"
            startContent={<RefreshCcwIcon />}
            onPress={() => {
              setFilterValue("");
              setDateRange({});
              setSortKey("createdAt");
              setSortOrder("desc");
              setMessage(null);
            }}
          >
            Limpiar filtros
          </Button>

          {isPrivileged && (
            <>
              <Button
                color="primary"
                variant="flat"
                startContent={<UploadIcon />}
                onPress={() => console.log("Carga masiva pendiente")}
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
                <DropdownMenu aria-label="Opciones de exportación">
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

          <Button
            color="primary"
            endContent={<PlusIcon />}
            onPress={() => setIsModalOpen(true)}
          >
            Nuevo proyecto
          </Button>
        </div>
      </div>

      {message && (
        <Alert color={message.type} variant="solid">
          {message.text}
        </Alert>
      )}

      <div className="flex justify-end text-sm text-gray-500">
        Mostrando {items.length} de {sanitizedProjects.length} proyectos
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
      >
        <TableHeader>
          <TableColumn key="code">Código</TableColumn>
          <TableColumn key="title">Título</TableColumn>
          <TableColumn key="faculty">Facultad</TableColumn>
          <TableColumn key="status">Estado</TableColumn>
          <TableColumn key="createdAt">Fecha</TableColumn>
          <TableColumn key="actions" align="center">
            Acciones
          </TableColumn>
        </TableHeader>

        <TableBody
          items={items}
          emptyContent={"No se encontraron proyectos."}
          isLoading={loading}
          loadingContent={<Spinner color="danger" label="Cargando proyectos..." />}
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

      {/* Modal para crear proyecto */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  );
}
