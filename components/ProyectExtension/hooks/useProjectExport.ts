"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Project, projectStatusMap } from "@/types";
import { getTokenPayload } from "@/utils/auth";

type ExportMessage = { type: "success" | "danger"; text: string } | null;

export function useProjectExport() {
  const [message, setMessage] = useState<ExportMessage>(null);
  const user = getTokenPayload();

  const showTempMessage = (msg: ExportMessage, timeout = 2000) => {
    setMessage(msg);
    if (msg) {
      setTimeout(() => setMessage(null), timeout);
    }
  };

  // 🔹 Exportar a Excel
  const exportToExcel = (projects: Project[]) => {
    if (!projects || projects.length === 0) {
      showTempMessage({
        type: "danger",
        text: "No hay datos para exportar.",
      });
      return;
    }

    const excelData = projects.map((p) => ({
      Código: p.code,
      Título: p.title,
      Tipo: p.typeProject,
      Año: p.year,
      Semestre: p.semester,
      Estado: projectStatusMap[p.status]?.label || p.status,
      Facultad: (p as any).faculty?.name || "Sin facultad",

      Director: (p as any).director
        ? `${(p as any).director.firstName} ${
            (p as any).director.firstLastName
          } (${(p as any).director.email})`
        : "Sin director",

      Coautores:
        (p as any).coauthors
          ?.map(
            (c: any) => `${c.firstName} ${c.firstLastName} (${c.email})`
          )
          .join(", ") || "Ninguno",

      Estudiantes:
        (p as any).students
          ?.map(
            (s: any) => `${s.firstName} ${s.firstLastName} (${s.email})`
          )
          .join(", ") || "Ninguno",

      "Ciclo Vital":
        (p as any).populations?.ciclo_vital
          ?.map((cv: any) => `${cv.name}: ${cv.numberOfPeople}`)
          .join(", ") || "",

      Condición:
        (p as any).populations?.condicion
          ?.map((c: any) => `${c.name}: ${c.numberOfPeople}`)
          .join(", ") || "",

      Grupo:
        (p as any).populations?.grupo
          ?.map((g: any) => `${g.name}: ${g.numberOfPeople}`)
          .join(", ") || "",

      Resultados:
        (p as any).results
          ?.map((r: any) => `${r.product} - Indicador: ${r.indicator}`)
          .join(" | ")
          .trim() || "",

      Impactos:
        (p as any).impacts
          ?.map((i: any) => `${i.expectedImpact} (${i.term})`)
          .join(" | ") || "",

      Entidades:
        (p as any).entity
          ?.map(
            (e: any) => `${e.entity?.name} (${e.entity?.typeEntity})`
          )
          .join(", ") || "",

      Documentos:
        (p as any).documents
          ?.map((d: any) => `${d.name} (${d.type})`)
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

    showTempMessage({
      type: "success",
      text: "Archivo Excel generado correctamente.",
    });
  };

  // 🔹 Exportar a PDF
  const exportToPDF = (projects: Project[]) => {
    if (!projects || projects.length === 0) {
      showTempMessage({
        type: "danger",
        text: "No hay datos para exportar.",
      });
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

    const body = projects.map((p) => [
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

    showTempMessage({
      type: "success",
      text: "PDF generado correctamente.",
    });
  };

  return {
    exportToExcel,
    exportToPDF,
    message,
    setMessage, // por si quieres limpiarlo manualmente
  };
}
