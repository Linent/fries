"use client";

import { Alert } from "@heroui/react";

export default function ProjectRequirementsAlert({ project }: { project: any }) {
  const errors: string[] = [];

  // 🔍 Validaciones
  if (!project.code) errors.push("Código del proyecto es obligatorio");
  if (!project.title) errors.push("Título del proyecto es obligatorio");
  if (!project.typeProject) errors.push("Tipo de proyecto es obligatorio");
  if (!project.year) errors.push("Año es obligatorio");
  if (!project.semester) errors.push("Semestre es obligatorio");
  if (!project.faculty) errors.push("Facultad es obligatoria");


  if (!project.description) errors.push("Descripción es obligatoria");
  if (!project.justification) errors.push("Justificación es obligatoria");
  if (!project.location) errors.push("Localización es obligatoria");

  if (!project.objectiveGeneral)
    errors.push("Objetivo general es obligatorio");

  if (!project.objectivesSpecific || project.objectivesSpecific.length === 0)
    errors.push("Debe agregar al menos 1 objetivo específico");

  if (!project.populations || Object.values(project.populations).every((arr: any) => arr.length === 0))
    errors.push("Debe registrar al menos una población beneficiaria");

  if (!project.results || project.results.length === 0)
    errors.push("Debe registrar al menos un resultado");

  if (!project.impacts || project.impacts.length === 0)
    errors.push("Debe agregar al menos un impacto");

  if (!project.director)
    errors.push("Debe asignarse un Director de Programa");

  const hasErrors = errors.length > 0;

  return (
    <Alert color={hasErrors ? "warning" : "success"} variant="flat">
      <div className="flex flex-col gap-1">
        <strong>
          {hasErrors
            ? "Este proyecto aún NO puede ser transferido. Debe cumplir los siguientes requisitos:"
            : "El proyecto cumple todos los requisitos obligatorios para avanzar de estado."}
        </strong>

        <ul className="list-disc pl-6 text-sm">
          {errors.length > 0
            ? errors.map((e, i) => <li key={i}>{e}</li>)
            : <li>Todos los campos obligatorios están completos.</li>}
        </ul>
      </div>
    </Alert>
  );
}
