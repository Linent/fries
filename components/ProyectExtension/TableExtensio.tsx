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
  // MODIFICADO: Importa SortDescriptor y Selection para tipado
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
import { useRouter } from "next/router";
import { getTokenPayload } from "@/utils/auth";
import { projectStatusMap, Project, ProjectsTableProps } from "@/types";

// ──────────────────────────────────────────────────────────────
// Helpers de permisos (Sin cambios)
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
  return false;
};

// ──────────────────────────────────────────────────────────────
// Constantes para filtros
// ──────────────────────────────────────────────────────────────
// Asume que projectStatusMap está definido en @/types
const statusOptions = Object.entries(projectStatusMap).map(
  ([key, { label }]) => ({
    key,
    label,
  })
);

const projectTypeOptions = [
  { key: "Remunerado", label: "Remunerado" },
  { key: "Solidario", label: "Solidario" },
  // Añade más tipos si es necesario
];

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
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [projectList, setProjectList] = useState<Project[]>(projects);
  
  // ------------------------------------------------------------
  // NUEVO: Estados para los filtros de Dropdown
  // ------------------------------------------------------------
  const [statusFilter, setStatusFilter] = useState<Selection>(new Set([]));
  const [typeFilter, setTypeFilter] = useState<Selection>(new Set([]));

  // ------------------------------------------------------------
  // MODIFICADO: Estado unificado para el ordenamiento
  // ------------------------------------------------------------
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  });

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

  // ------------------------------------------------------------
  // MODIFICADO: `filteredProjects` ahora solo filtra, no ordena.
  // ------------------------------------------------------------
  const filteredProjects = useMemo(() => {
    let data = [...sanitizedProjects];

    // Filtro de texto
    if (filterValue) {
      const q = filterValue.toLowerCase();
      data = data.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      );
    }

    // Filtro de rango de fechas
    if (dateRange.start && dateRange.end) {
      data = data.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= dateRange.start! && d <= dateRange.end!;
      });
    }

    // NUEVO: Filtro por Estado
    if (statusFilter !== "all" && statusFilter.size > 0) {
      data = data.filter((p) => statusFilter.has(p.status));
    }

    // NUEVO: Filtro por Tipo de Proyecto (asumiendo que el dato existe)
    if (typeFilter !== "all" && typeFilter.size > 0) {
      data = data.filter((p) => typeFilter.has((p as any).typeProject));
    }

    return data;
  }, [filterValue, dateRange, statusFilter, typeFilter, sanitizedProjects]);

  // ------------------------------------------------------------
  // NUEVO: `sortedItems` se encarga del ordenamiento.
  // ------------------------------------------------------------
  const sortedItems = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const key = sortDescriptor.column as keyof Project | "faculty";
      let cmp: number;

      let first: any;
      let second: any;

      // Manejo especial para 'faculty' que es un objeto anidado
      if (key === "faculty") {
        first = (a as any).faculty?.name || "";
        second = (b as any).faculty?.name || "";
        cmp = first.localeCompare(second);
      } else {
        first = (a as any)[key];
        second = (b as any)[key];

        if (key === "createdAt") {
          cmp = new Date(first).getTime() - new Date(second).getTime();
        } else {
          // Ordenamiento genérico para texto/números
          cmp = (first || "") < (second || "") ? -1 : 1;
          if (typeof first === "string" && typeof second === "string") {
            cmp = first.localeCompare(second);
          }
        }
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredProjects, sortDescriptor]);

  // ------------------------------------------------------------
  // MODIFICADO: Paginación basada en `sortedItems` y `filteredProjects`
  // ------------------------------------------------------------
  const pages = Math.ceil(filteredProjects.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const items = sortedItems.slice(start, start + rowsPerPage);

  // 🎨 Estado visual (Sin cambios)
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

  // 📄 Exportar (Sin cambios, pero podrías querer exportar `filteredProjects` en lugar de `projectList`)
  const handleExportExcel = () => {
  if (!projectList.length) {
    setMessage({ type: "danger", text: "No hay datos para exportar." });
    setTimeout(() => setMessage(null), 2000);
    return;
  }

  // --- Función para aplanar objetos y arrays ---
  const flattenField = (value:any) => {
    if (!value) return "";

    // Si es array
    if (Array.isArray(value)) {
      return value
        .map((item) =>
          typeof item === "object"
            ? Object.values(item).join(" ")
            : String(item)
        )
        .join(", ");
    }

    // Si es objeto
    if (typeof value === "object") {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }

    return value;
  };

  const excelData = projectList.map((p) => ({
    Código: p.code,
    Título: p.title,
    Tipo: p.typeProject,
    Año: p.year,
    Semestre: p.semester,
    Estado: projectStatusMap[p.status]?.label || p.status,
    Facultad: p.faculty?.name || "Sin facultad",

    // Director del proyecto
    Director: p?.director
      ? `${p.director.firstName} ${p.director.firstLastName} (${p.director.email})`
      : "Sin director",

    // Coautores
    Coautores: p.coauthors
      ?.map((c) => `${c.firstName} ${c.firstLastName} (${c.email})`)
      .join(", ") || "Ninguno",

    // Estudiantes
    Estudiantes: p.students
      ?.map((s) => `${s.firstName} ${s.firstLastName} (${s.email})`)
      .join(", ") || "Ninguno",

    // Poblaciones estructuradas
    "Ciclo Vital": p.populations?.ciclo_vital
      ?.map((cv) => `${cv.name}: ${cv.numberOfPeople}`)
      .join(", ") || "",

    Condición: p.populations?.condicion
      ?.map((c) => `${c.name}: ${c.numberOfPeople}`)
      .join(", ") || "",

    Grupo: p.populations?.grupo
      ?.map((g) => `${g.name}: ${g.numberOfPeople}`)
      .join(", ") || "",

    // Resultados
    Resultados: p.results
      ?.map((r) => `${r.product} - Indicador: ${r.indicator}`)
      .join(" | ")
      .trim() || "",

    // Impactos
    Impactos: p.impacts
      ?.map((i) => `${i.expectedImpact} (${i.term})`)
      .join(" | ") || "",

    // Entidades
    Entidades: p.entity
      ?.map((e) => `${e.entity?.name} (${e.entity?.typeEntity})`)
      .join(", ") || "",

    // Documentos
    Documentos: p.documents
      ?.map((d) => `${d.name} (${d.type})`)
      .join(", ") || "",

    Descripción: p.description || "",
    Justificación: p.justification || "",
    ObjetivoGeneral: p.objectiveGeneral || "",

    FechaCreación: new Date(p.createdAt).toLocaleString("es-CO"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Proyectos Extensión");
  XLSX.writeFile(workbook, "proyectos-extension-completo.xlsx");

  setMessage({
    type: "success",
    text: "Archivo Excel generado correctamente.",
  });

  setTimeout(() => setMessage(null), 2000);
};

  const handleExportPDF = () => {
  if (!projectList.length) {
    setMessage({ type: "danger", text: "No hay datos para exportar." });
    setTimeout(() => setMessage(null), 2000);
    return;
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "A4",
  });

  doc.setFontSize(14);
  doc.text("Reporte de Proyectos de Extensión", 40, 40);

  const username = (user as any)?.name || "Usuario";
  const date = new Date().toLocaleString("es-CO");
  doc.setFontSize(10);
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

  setMessage({ type: "success", text: "PDF generado correctamente." });

  // Ocultar después de 2 segundos
  setTimeout(() => setMessage(null), 2000);
};


  // 🆕 Nuevo proyecto desde modal (Sin cambios)
  const handleCreateProject = (created: Project) => {
    setProjectList((prev) => [created, ...prev]);
    setMessage({ type: "success", text: "Proyecto creado exitosamente." });
  };

  // ------------------------------------------------------------
  // MODIFICADO: `renderCell` con el nuevo `typeProject`
  // ------------------------------------------------------------
  const renderCell = useCallback(
    (project: Project, columnKey: string) => {
      switch (columnKey) {
        case "code":
          return <p className="font-medium">{project.code}</p>;
        case "title":
          return <p className="font-medium">{project.title}</p>;
        // NUEVO: Render para el tipo de proyecto
        case "typeProject":
          return <p>{(project as any).typeProject || "No definido"}</p>;
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

  // ------------------------------------------------------------
  // MODIFICADO: `topContent` con los nuevos filtros
  // ------------------------------------------------------------
  const topContent = (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        {/* --- Fila 1: Búsqueda y Fecha --- */}
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
        {/* --- Fila 2: Filtros Dropdown --- */}
        <div className="flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" endContent={<ChevronDownIcon />}>
                Estado
                {statusFilter !== "all" && statusFilter.size > 0 && ` (${statusFilter.size})`}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filtrar por estado"
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
                {typeFilter !== "all" && typeFilter.size > 0 && ` (${typeFilter.size})`}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filtrar por tipo de proyecto"
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
              setSortDescriptor({ column: "createdAt", direction: "descending" });
              setMessage(null);
            }}
          >
            Limpiar filtros
          </Button>
        </div>

        {/* --- Fila 2: Botones de Acción --- */}
        <div className="flex gap-2">
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

          {["administrador", "fries", "formulador"].includes(role || "") && (
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
        {/* MODIFICADO: Muestra el total de items filtrados */}
        Mostrando {items.length} de {filteredProjects.length} proyectos
      </div>
    </div>
  );

  // ------------------------------------------------------------
  // `bottomContent` (Sin cambios)
  // ------------------------------------------------------------
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
      {/* ------------------------------------------------------------ */}
      {/* MODIFICADO: Table ahora usa sortDescriptor y onSortChange */}
      {/* ------------------------------------------------------------ */}
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
          {/* MODIFICADO: Columnas con `allowsSorting` */}
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

      {/* Modal para crear proyecto (Sin cambios) */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  );
}