"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import {
  getProjectMembers,
  addProjectMember,
  deleteProjectMember,
} from "@/services/projectMemberService";
import UserPickerModal from "@/components/ProyectExtension/tabs/Integrantes/UserPickerModal";
import UserQuickCreateModal from "@/components/ProyectExtension/tabs/Integrantes/UserQuickCreateModal";

export default function IntegrantesTab({
  project,
  editable,
}: {
  project: { _id: string };
  editable: boolean;
}) {
  const [members, setMembers] = useState<any>({
    director: null,
    coauthors: [],
    students: [],
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "danger"; text: string } | null>(
    null
  );

  const [openPicker, setOpenPicker] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [role, setRole] = useState<"director" | "coautor" | "estudiante" | null>(
    null
  );

  const didRun = useRef(false);

  // 🔄 Carga inicial
  const load = async () => {
    setLoading(true);
    try {
      const data = await getProjectMembers(project._id);
      setMembers({
        director: data?.director || null,
        coauthors: Array.isArray(data?.coauthors) ? data.coauthors : [],
        students: Array.isArray(data?.students) ? data.students : [],
      });
    } catch (e) {
      console.error(e);
      setMsg({ type: "danger", text: "Error cargando integrantes" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    load();
  }, [project._id]);

  // ⏱️ Ocultar alertas
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  // 🟢 Agregar miembro
  const handleAdd = async (userId: string) => {
    if (!role) return;
    try {
      await addProjectMember({
        project: project._id,
        user: userId,
        roleInProject: role,
      });
      setMsg({ type: "success", text: "Miembro agregado correctamente" });
      await load();
      setOpenPicker(false);
      setOpenCreate(false);
    } catch (e) {
      console.error(e);
      setMsg({ type: "danger", text: "Error al vincular miembro" });
    }
  };

  // 🔴 Eliminar miembro
  const handleDelete = async (r: string, userId: string) => {
    try {
      await deleteProjectMember(project._id, r, userId);
      setMsg({ type: "success", text: "Miembro eliminado" });
      await load();
    } catch {
      setMsg({ type: "danger", text: "No se pudo eliminar el miembro" });
    }
  };

  // 🧩 Selección desde modal
  const handleSelectUser = async (userId: string) => {
    await handleAdd(userId);
  };

  // 📋 Render genérico de tablas (coautores y estudiantes)
  const renderTable = (data: any[] = [], roleName: string) => (
    <Table
      aria-label={roleName}
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
        <TableColumn>Programa académico</TableColumn>
        <TableColumn>Email</TableColumn>
        <TableColumn>Acción</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={loading ? "Cargando..." : "No hay registros."}
        isLoading={loading}
      >
        {(data || []).map((u) => (
          <TableRow key={u._id}>
            <TableCell>
              {u.firstName} {u.firstLastName}
            </TableCell>
            <TableCell>
              {u.academic_program || (
                <span className="text-gray-400">—</span>
              )}
            </TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              {editable && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => handleDelete(roleName, u._id)}
                >
                  Eliminar
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-4 space-y-6">
      {msg && <Alert color={msg.type}>{msg.text}</Alert>}

      {/* DIRECTOR */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Director del proyecto</h3>
          {editable && (
            <div className="flex gap-2">
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  setRole("director");
                  setOpenPicker(true);
                }}
                isDisabled={!!members.director}
              >
                Asignar existente
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  setRole("director");
                  setOpenCreate(true);
                }}
                isDisabled={!!members.director}
              >
                Registrar nuevo docente
              </Button>
            </div>
          )}
        </CardHeader>
        <CardBody>
          {members.director ? (
            <Table
              aria-label="Información del director"
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
                <TableColumn>Programa académico</TableColumn>
                <TableColumn>Correo</TableColumn>
                <TableColumn>Acción</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow key={members.director._id}>
                  <TableCell>
                    {members.director.firstName} {members.director.firstLastName}
                  </TableCell>
                  <TableCell>
                    {members.director.academic_program || (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{members.director.email}</TableCell>
                  <TableCell>
                    {editable && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() =>
                          handleDelete("director", members.director._id)
                        }
                      >
                        Eliminar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500">Sin director asignado</p>
          )}
        </CardBody>
      </Card>

      {/* COAUTORES */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Coautores</h3>
          {editable && (
            <div className="flex gap-2">
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  setRole("coautor");
                  setOpenPicker(true);
                }}
              >
                Agregar existente
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  setRole("coautor");
                  setOpenCreate(true);
                }}
              >
                Registrar nuevo docente
              </Button>
            </div>
          )}
        </CardHeader>
        <CardBody>{renderTable(members.coauthors, "coautor")}</CardBody>
      </Card>

      {/* ESTUDIANTES */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Estudiantes</h3>
          {editable && (
            <div className="flex gap-2">
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  setRole("estudiante");
                  setOpenPicker(true);
                }}
              >
                Agregar existente
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  setRole("estudiante");
                  setOpenCreate(true);
                }}
              >
                Registrar nuevo estudiante
              </Button>
            </div>
          )}
        </CardHeader>
        <CardBody>{renderTable(members.students, "estudiante")}</CardBody>
      </Card>

      {/* MODALES */}
      <UserPickerModal
        isOpen={openPicker}
        onClose={() => setOpenPicker(false)}
        onSelect={handleSelectUser}
        fixedRole={role}
        projectId={project._id}
      />

      <UserQuickCreateModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={handleAdd}
        fixedRole={role!}
      />
    </div>
  );
}
