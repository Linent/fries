"use client";

import { getTokenPayload } from "@/utils/auth";

export function useProjectPermissions(project: any, document?: any) {
  const user = getTokenPayload();
  const userId = user?.id;
  const roles: string[] = user?.roles || [];

  const status = project?.status;
  const creator = project?.createdBy?._id || project?.createdBy;

  const isAdminOrFries =
    roles.includes("administrador") || roles.includes("fries");

  const canUpload =
    isAdminOrFries ||
    (roles.includes("formulador") &&
      creator === userId &&
      status === "en_formulacion") ||
    (roles.includes("director_programa") &&
      status === "en_revision_director") ||
    (roles.includes("decano") && status === "en_revision_decano");

  // 🔥 SOLO ADMIN o FRIES PUEDEN EDITAR CUALQUIERA
  // Otros roles SOLO PUEDEN EDITAR SUS DOCUMENTOS
  const isAuthor = document ? document.uploadedBy === userId : false;

  const canEdit =
    isAdminOrFries ||
    (canUpload && isAuthor); // decano/director/formulador → solo los SUYOS

  const canDelete =
    isAdminOrFries ||
    (canUpload && isAuthor); // misma regla que editar

  return {
    canUpload,
    canEdit,
    canDelete,
  };
}

