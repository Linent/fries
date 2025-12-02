"use client";

import { useMemo } from "react";
import { Project } from "@/types";
import { getTokenPayload } from "@/utils/auth";

// Helpers para normalizar ids que pueden venir como string u objeto con _id
function getId(maybeIdOrObj: any): string | undefined {
  if (!maybeIdOrObj) return undefined;
  if (typeof maybeIdOrObj === "string") return maybeIdOrObj;
  if (typeof maybeIdOrObj === "object" && typeof maybeIdOrObj._id === "string") {
    return maybeIdOrObj._id;
  }
  return undefined;
}

export function useFilteredProjects(projects: Project[]) {
  const user = getTokenPayload();
  const userId = user?.id;
  const roles: string[] = user?.roles ?? [];

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) => {
      // ADMIN → ve todos
      if (roles.includes("administrador")) return true;

      // FRIES → ve todos
      if (roles.includes("fries")) return true;

      // FORMULADOR → ve solo los suyos
      if (roles.includes("formulador")) {
        const creatorId = getId(project?.createdBy);
        return creatorId === userId;
      }

      // DECANO → ve proyectos en revisión del decano o proyectos de su facultad
      if (roles.includes("decano")) {
        const decanoId = getId(project?.faculty?.decano);
        const isDecanoOfFaculty = decanoId === userId;

        const isReviewState = project.status === "en_revision_decano";

        return isDecanoOfFaculty || isReviewState;
      }

      // DIRECTOR DE PROGRAMA → ve los de su programa o en revisión del director
      if (roles.includes("director_programa")) {
        const directorId = getId(project?.program?.director);
        const isDirectorOfProgram = directorId === userId;

        const isReviewState = project.status === "en_revision_director";

        return isDirectorOfProgram || isReviewState;
      }

      return false;
    });
  }, [projects, userId, roles]);

  return filteredProjects;
}
