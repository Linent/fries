"use client";

import { useMemo, useState } from "react";
import { getTokenPayload } from "@/utils/auth";
import { changeProjectStatus } from "@/services/projectStatusService";

export const useProjectStatus = (project: any) => {
  const user = getTokenPayload();
  const roles: string[] = user?.roles ?? [];
  const [loading, setLoading] = useState(false);

  // Transiciones permitidas por rol
  const transitions: Record<string, string[]> = {
    formulador: ["en_revision_director"],
    director_programa: ["en_formulacion", "en_revision_decano"],
    decano: ["en_formulacion", "en_revision_fries"],
    fries: [
      "en_formulacion",
      "en_revision_director",
      "en_revision_decano",
      "en_revision_fries",
      "en_revision_vicerrectoria",
      "aprobado",
      "rechazado",
    ],
    administrador: [
      "en_formulacion",
      "en_revision_director",
      "en_revision_decano",
      "en_revision_fries",
      "en_revision_vicerrectoria",
      "aprobado",
      "rechazado",
    ],
    vicerrectoria: ["en_formulacion", "aprobado", "rechazado"],
  };

  const currentStatus = project.status;

  // Rol principal del usuario (el que tenga transiciones definidas)
  const mainRole = roles.find((r) => transitions[r]);

  const availableNextStatuses = useMemo(() => {
    if (!mainRole) return [];
    return transitions[mainRole] || [];
  }, [mainRole]);

  const canChange = availableNextStatuses.length > 0;

  const submitStatusChange = async (next: string) => {
    setLoading(true);
    try {
      const data = await changeProjectStatus(project._id, next);
      return { ok: true, data };
    } catch (e: any) {
      return { ok: false, error: e?.response?.data || e.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    canChange,
    availableNextStatuses,
    submitStatusChange,
    currentStatus,
    roles,
  };
};
