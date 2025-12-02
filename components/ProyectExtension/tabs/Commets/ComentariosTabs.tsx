"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Alert,
  Switch,
  Textarea,
} from "@heroui/react";
import {
  getProjectComments,
  addProjectComment,
  updateProjectComment,
  deleteProjectComment,
} from "@/services/proyectServices";
import { getTokenPayload } from "@/utils/auth";
import { Trash2Icon, SendIcon } from "lucide-react";

export default function ComentariosTab({
  project,
  editable,
}: {
  project: { _id: string; status: string };
  editable: boolean;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const didRun = useRef(false);

  // ---------------------------------------------------------
  // 🔐 Obtener usuario con roles múltiples
  // ---------------------------------------------------------
  const user = getTokenPayload();
  const myId = user?.id;
  const myRoles: string[] = Array.isArray(user?.roles) ? user.roles : [];

  const isRole = (role: string) => myRoles?.includes(role);

  // ---------------------------------------------------------
  // 🔐 Permisos globales para comentar según estado
  // ---------------------------------------------------------
  const state = project?.status;

  const canComment = (() => {
    if (isRole("fries") || isRole("administrador")) return true; // siempre pueden

    if (isRole("formulador")) return false; // nunca comenta

    if (isRole("director_programa"))
      return state === "en_revision_director";

    if (isRole("decano"))
      return state === "en_revision_decano";

    if (isRole("vicerrectoria"))
      return state === "en_revision_vicerrectoria";

    return false;
  })();

  const commentReason = (() => {
    if (canComment) return null;

    if (isRole("formulador"))
      return "Los formuladores no pueden agregar comentarios.";

    if (isRole("director_programa"))
      return "Este proyecto no está en revisión del director. No puedes comentar ahora.";

    if (isRole("decano"))
      return "Este proyecto no está en revisión del decano. No puedes comentar ahora.";

    if (isRole("vicerrectoria"))
      return "Solo puedes comentar cuando el proyecto esté en revisión de Vicerrectoría.";

    return "No tienes permisos para agregar comentarios.";
  })();

  // ---------------------------------------------------------
  // 🔄 Cargar comentarios
  // ---------------------------------------------------------
  const load = async () => {
    try {
      setLoading(true);
      const data = await getProjectComments(project._id);
      setComments(data);
    } catch {
      setMsg({ type: "danger", text: "Error cargando comentarios" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!didRun.current) {
      didRun.current = true;
      load();
    }
  }, []);

  // ---------------------------------------------------------
  // ➕ AGREGAR COMENTARIO
  // ---------------------------------------------------------
  const handleAdd = async () => {
    if (!text.trim()) return;

    try {
      await addProjectComment(project._id, text, true);
      setText("");
      setMsg({ type: "success", text: "Comentario agregado" });
      load();
    } catch {
      setMsg({ type: "danger", text: "Error al agregar comentario" });
    }
  };

  // ---------------------------------------------------------
  // 👁 Cambio de visibilidad (solo FRIES)
  // ---------------------------------------------------------
  const handleToggleVisibility = async (comment: any, visible: boolean) => {
    try {
      await updateProjectComment(comment._id, {
        visibleToFormulator: visible,
      });
      setMsg({ type: "success", text: "Visibilidad actualizada" });
      load();
    } catch {
      setMsg({ type: "danger", text: "Error al actualizar visibilidad" });
    }
  };

  // ---------------------------------------------------------
  // 🗑 ELIMINAR COMENTARIO
  // ---------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar comentario?")) return;

    try {
      await deleteProjectComment(id);
      setMsg({ type: "success", text: "Comentario eliminado" });
      load();
    } catch {
      setMsg({ type: "danger", text: "No se pudo eliminar" });
    }
  };

  // ---------------------------------------------------------
  // 🖼️ RENDER
  // ---------------------------------------------------------
  return (
    <div className="p-6 space-y-4">

      {msg && <Alert color={msg.type}>{msg.text}</Alert>}

      {/* ---------------------------------------------------------------- */}
      {/* AGREGAR COMENTARIO (solo si permitido) */}
      {/* ---------------------------------------------------------------- */}
      {canComment ? (
        <Card shadow="sm" className="border border-gray-200">
          <CardHeader>Agregar comentario</CardHeader>
          <CardBody className="space-y-3">
            <Textarea
              placeholder="Escribe tu comentario..."
              value={text}
              onValueChange={setText}
              minRows={3}
            />
            <Button
              color="primary"
              onPress={handleAdd}
              startContent={<SendIcon size={16} />}
            >
              Enviar comentario
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Alert color="warning" variant="flat">
          {commentReason}
        </Alert>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* LISTA DE COMENTARIOS */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-4">
        {comments.map((c) => {
          const isAuthor = c.author?._id === myId;

          const canDelete =
            isRole("administrador") || isRole("fries") || isAuthor;

          const canToggle = isRole("fries");

          return (
            <Card
              key={c._id}
              shadow="sm"
              className="border border-gray-200 bg-white"
            >
              <CardBody className="space-y-2">
                <p className="text-gray-800">{c.text}</p>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {c.author?.firstName} {c.author?.firstLastName} —{" "}
                    {new Date(c.createdAt).toLocaleString("es-CO")}
                  </p>

                  <div className="flex gap-2 items-center">

                    {/* 👁 Cambiar visibilidad (solo FRIES) */}
                    {canToggle && (
                      <Switch
                        color="primary"
                        isSelected={c.visibleToFormulator}
                        onValueChange={(v) => handleToggleVisibility(c, v)}
                      >
                        Visible
                      </Switch>
                    )}

                    {/* 🗑 Eliminar */}
                    {canDelete && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<Trash2Icon size={14} />}
                        onPress={() => handleDelete(c._id)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
