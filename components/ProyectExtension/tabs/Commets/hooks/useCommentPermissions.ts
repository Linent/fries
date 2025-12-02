import { getTokenPayload } from "@/utils/auth";

export const useCommentPermissions = (project: any) => {
  const user = getTokenPayload();
  const roles: string[] = user?.roles || [];
  const state = project?.status;

  const is = (role: string) => roles.includes(role);

  // 🔥 FRIES y ADMIN pueden siempre
  if (is("fries") || is("administrador")) {
    return {
      canComment: true,
      reason: null, // siempre pueden
    };
  }

  // ❌ Formulador NO comenta nunca
  if (is("formulador")) {
    return {
      canComment: false,
      reason: "Los formuladores no pueden agregar comentarios.",
    };
  }

  // 🎓 Director Programa
  if (is("director_programa")) {
    return {
      canComment: state === "en_revision_director",
      reason:
        state !== "en_revision_director"
          ? "Solo puedes comentar cuando el proyecto está en revisión del director."
          : null,
    };
  }

  // 🎓 Decano
  if (is("decano")) {
    return {
      canComment: state === "en_revision_decano",
      reason:
        state !== "en_revision_decano"
          ? "Solo puedes comentar cuando el proyecto está en revisión del decano."
          : null,
    };
  }

  // 🏛 Vicerrectoría
  if (is("vicerrectoria")) {
    return {
      canComment: state === "en_revision_vicerrectoria",
      reason:
        state !== "en_revision_vicerrectoria"
          ? "Solo puedes comentar cuando el proyecto está en revisión de vicerrectoría."
          : null,
    };
  }

  // Otros roles no comentan
  return {
    canComment: false,
    reason: "No tienes permisos para agregar comentarios.",
  };
};
