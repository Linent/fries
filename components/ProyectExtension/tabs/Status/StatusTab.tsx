"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, Button, Alert, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";

import { useProjectStatus } from "./hooks/useProjectStatus";
import { projectStatusMap, statusFlow } from "@/types/types";

// Íconos personalizados
import {
  BackIcon,
  ApproveIcon,
  RejectIcon,
  ForwardIcon,
} from "@/components/icons";

import ProjectRequirementsAlert from "./ProjectRequirementsAlert";

// 🟦 Textos e íconos por cada estado
const buttonConfig = {
  en_formulacion: {
    label: "Devolver a Formulación",
    icon: <BackIcon className="text-current" />,
    color: "primary",
  },
  en_revision_director: {
    label: "Enviar a Revisión del Director de Programa",
    icon: <ForwardIcon className="text-current" />,
    color: "primary",
  },
  en_revision_decano: {
    label: "Enviar a Revisión del Decano",
    icon: <ForwardIcon className="text-current" />,
    color: "primary",
  },
  en_revision_fries: {
    label: "Enviar a Revisión del FRIES",
    icon: <ForwardIcon className="text-current" />,
    color: "primary",
  },
  en_revision_vicerrectoria: {
    label: "Enviar a Vicerrectoría",
    icon: <ForwardIcon className="text-current" />,
    color: "primary",
  },
  aprobado: {
    label: "Aprobar proyecto",
    icon: <ApproveIcon className="text-green-600" />,
    color: "success",
  },
  rechazado: {
    label: "Rechazar proyecto",
    icon: <RejectIcon className="text-red-600" />,
    color: "danger",
  },
} as const;

type ButtonConfig = typeof buttonConfig;
type StatusKey = keyof ButtonConfig;

export default function StatusTab({ project, onStatusUpdated }: any) {
  const router = useRouter();
  const [msg, setMsg] = useState<any>(null);

  const {
    canChange,
    availableNextStatuses,
    currentStatus,
    submitStatusChange,
    loading,
    roles,
  } = useProjectStatus(project);

  const handleStatusChange = async (next: string) => {
  const res = await submitStatusChange(next);

  if (!res.ok) {
    setMsg({
      type: "danger",
      text: res.error.message || "Error cambiando estado",
    });
    return;
  }

  setMsg({ type: "success", text: "Estado actualizado correctamente." });

  const shouldRedirect =
    next === "en_formulacion" ||
    next === "aprobado" ||
    next === "rechazado" ||
    roles.some((r) =>
      ["director_programa", "decano", "fries", "vicerrectoria"].includes(r)
    );

  if (shouldRedirect) {
    setTimeout(() => {
      router.push("/extension");
    }, 200);
    return;
  }

  onStatusUpdated?.(next);
};


  // Nombre del estado
  const readableStatus =
    projectStatusMap[currentStatus]?.label || currentStatus;
  const statusColor = projectStatusMap[currentStatus]?.color;

  return (
    <div className="p-6 space-y-4">
      {msg && <Alert color={msg.type}>{msg.text}</Alert>}

      <Card shadow="sm" className="border border-gray-200">
        <CardHeader>
          <h3 className="font-semibold text-gray-800">Estado del Proyecto</h3>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* 🔥 Estado actual */}
          <div className="text-lg font-semibold">
            Estado actual:
            <Chip className={`ml-3 ${statusColor}`} variant="flat">
              {readableStatus}
            </Chip>
          </div>

          <ProjectRequirementsAlert project={project} />

          {/* 🔵 Línea visual del flujo */}
          <div className="flex items-center gap-4 flex-wrap justify-center py-4">
            {statusFlow.map((status, index) => {
              const label = projectStatusMap[status]?.label || status;
              const isCurrent = status === currentStatus;

              return (
                <div key={status} className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      isCurrent ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  ></div>

                  <span
                    className={`ml-2 text-sm ${
                      isCurrent
                        ? "font-semibold text-blue-700"
                        : "text-gray-600"
                    }`}
                  >
                    {label}
                  </span>

                  {index < statusFlow.length - 1 && (
                    <span className="mx-3 text-gray-400">───</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 🔥 Botones */}
          {canChange ? (
            <div className="flex flex-wrap gap-3 items-center">
              {/* 🟥 ADMIN */}
              {roles.includes("administrador") && (
                <>
                  {(Object.keys(buttonConfig) as StatusKey[]).map((key) => {
                    if (key === currentStatus) return null;

                    return (
                      <Button
                        key={key}
                        color={buttonConfig[key].color}
                        variant="solid"
                        className="min-w-[260px] flex items-center gap-2"
                        onPress={() => handleStatusChange(key)}
                        isLoading={loading}
                      >
                        {buttonConfig[key].icon}
                        {buttonConfig[key].label}
                      </Button>
                    );
                  })}
                </>
              )}

              {/* 🟧 FRIES → no puede aprobar ni rechazar */}
              {roles.includes("fries") && !roles.includes("administrador") && (
                <>
                  {(Object.keys(buttonConfig) as StatusKey[]).map((key) => {
                    if (key === currentStatus) return null;
                    if (key === "aprobado" || key === "rechazado") return null;

                    return (
                      <Button
                        key={key}
                        color={buttonConfig[key].color}
                        variant="solid"
                        className="min-w-[260px] flex items-center gap-2"
                        onPress={() => handleStatusChange(key)}
                        isLoading={loading}
                      >
                        {buttonConfig[key].icon}
                        {buttonConfig[key].label}
                      </Button>
                    );
                  })}
                </>
              )}

              {/* 🟩 VICERRECTORÍA */}
              {roles.includes("vicerrectoria") &&
                !roles.includes("administrador") &&
                !roles.includes("fries") && (
                  <>
                    {["aprobado", "rechazado", "en_formulacion"].map(
                      (rawKey) => {
                        const key = rawKey as StatusKey;
                        if (key === currentStatus) return null;

                        return (
                          <Button
                            key={key}
                            color={buttonConfig[key].color}
                            variant="solid"
                            className="min-w-[260px] flex items-center gap-2"
                            onPress={() => handleStatusChange(key)}
                            isLoading={loading}
                          >
                            {buttonConfig[key].icon}
                            {buttonConfig[key].label}
                          </Button>
                        );
                      }
                    )}
                  </>
                )}

              {/* 🟦 OTROS ROLES */}
              {!roles.includes("administrador") &&
                !roles.includes("fries") &&
                !roles.includes("vicerrectoria") && (
                  <>
                    {availableNextStatuses.map((status) => {
                      const key = status as StatusKey;
                      if (!buttonConfig[key]) return null;

                      const cfg = buttonConfig[key];

                      return (
                        <Button
                          key={key}
                          color={cfg.color}
                          variant="solid"
                          className="min-w-[260px] flex items-center gap-2"
                          onPress={() => handleStatusChange(key)}
                          isLoading={loading}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </Button>
                      );
                    })}
                  </>
                )}
            </div>
          ) : (
            <p className="text-gray-500">No tienes permisos para cambiar el estado.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
