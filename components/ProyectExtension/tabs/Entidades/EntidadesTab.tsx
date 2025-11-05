"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Chip,
} from "@heroui/react";
import EntityPickerModal from "@/components/ProyectExtension/tabs/Entidades/EntityPickerModal";
import EntityCreateModal from "@/components/ProyectExtension/tabs/Entidades/EntityCreateModal";
import {
  getProjectEntities,
  createProjectEntity,
  deleteProjectEntity,
} from "@/services/projectEntityService";
import { ProjectEntityDTO } from "@/types";

// ✅ Componente EntidadesTab con control de llamadas duplicadas
export default function EntidadesTab({
  project,
  editable,
}: {
  project: { _id: string };
  editable: boolean;
}) {
  const [items, setItems] = useState<ProjectEntityDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  const [openPicker, setOpenPicker] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  // 🧠 Evita llamadas duplicadas (por React Strict Mode)
  const didRun = useRef(false);

  // 🔁 Cargar entidades
  const load = async () => {
    setLoading(true);
    try {
      const data = await getProjectEntities(project._id);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMsg({ type: "danger", text: "Error cargando entidades vinculadas" });
    } finally {
      setLoading(false);
    }
  };

  // ⚙️ Ejecuta solo una vez al montar (protegido por useRef)
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    load();
  }, [project._id]);

  // ⏱️ Ocultar mensaje automáticamente
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  // 🟢 Vincular entidad (existente o nueva)
  const linkEntity = async (payload: {
    entityId: string;
    aporteEspecie: number;
    aporteEfectivo: number;
  }) => {
    try {
      await createProjectEntity({
        project: project._id,
        entity: payload.entityId,
        aporteEspecie: payload.aporteEspecie,
        aporteEfectivo: payload.aporteEfectivo,
      });
      setMsg({ type: "success", text: "Entidad vinculada correctamente" });
      setOpenPicker(false);
      setOpenCreate(false);
      await load();
    } catch (e) {
      console.error(e);
      setMsg({ type: "danger", text: "No se pudo vincular la entidad" });
    }
  };

  // 🔴 Eliminar vínculo
  const handleDelete = async (id: string) => {
    try {
      await deleteProjectEntity(id);
      setMsg({ type: "success", text: "Entidad desvinculada" });
      await load();
    } catch (e) {
      console.error(e);
      setMsg({ type: "danger", text: "No se pudo eliminar el vínculo" });
    }
  };

  return (
    <div className="p-4 space-y-8">
      {/* 🔔 Alert con duración automática */}
      {msg && (
        <Alert
          color={msg.type}
          variant="solid"
          className="mb-6 rounded-lg shadow-sm"
        >
          {msg.text}
        </Alert>
      )}

      {/* 🔘 Encabezado y acciones */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Entidades vinculadas
        </h3>
        {editable && (
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              onPress={() => setOpenPicker(true)}
            >
              Vincular entidad existente
            </Button>
            <Button color="danger" onPress={() => setOpenCreate(true)}>
              Registrar nueva entidad
            </Button>
          </div>
        )}
      </div>

      {/* 📋 Tabla estilizada */}
      <Table
        aria-label="Tabla de entidades"
        removeWrapper
        classNames={{
          base: "border border-gray-200 rounded-2xl shadow-sm overflow-hidden bg-white",
          thead: "bg-gray-50 text-gray-700 text-sm font-semibold",
          th: "px-4 py-3 text-left",
          tr: "hover:bg-gray-50 transition-colors duration-200",
          td: "px-4 py-3 text-sm text-gray-700",
        }}
      >
        <TableHeader>
          <TableColumn>Nombre</TableColumn>
          <TableColumn>NIT</TableColumn>
          <TableColumn>Tipo</TableColumn>
          <TableColumn>Sector</TableColumn>
          <TableColumn>Aporte en especie</TableColumn>
          <TableColumn>Aporte en efectivo</TableColumn>
          <TableColumn align="center">Acciones</TableColumn>
        </TableHeader>

        <TableBody
          items={items}
          isLoading={loading}
          emptyContent={
            loading ? "Cargando..." : "No hay entidades vinculadas."
          }
        >
          {(item) => (
            <TableRow key={item._id}>
              <TableCell>{(item.entity as any)?.name}</TableCell>
              <TableCell>{(item.entity as any)?.nit}</TableCell>
              <TableCell>
                <Chip variant="flat" size="sm">
                  {(item.entity as any)?.typeEntity}
                </Chip>
              </TableCell>
              <TableCell>{(item.entity as any)?.sector || "otro"}</TableCell>
              <TableCell>
                ${Number(item.aporteEspecie || 0).toLocaleString("es-CO")}
              </TableCell>
              <TableCell>
                ${Number(item.aporteEfectivo || 0).toLocaleString("es-CO")}
              </TableCell>
              <TableCell className="text-center">
                {editable ? (
                  <Button
                    color="danger"
                    size="sm"
                    variant="flat"
                    onPress={() => handleDelete(item._id!)}
                  >
                    Eliminar
                  </Button>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 🧩 Modales */}
      <EntityPickerModal
        isOpen={openPicker}
        onClose={() => setOpenPicker(false)}
        onConfirm={linkEntity}
      />

      <EntityCreateModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreatedAndLink={linkEntity}
      />
    </div>
  );
}
