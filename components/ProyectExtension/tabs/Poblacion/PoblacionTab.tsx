"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Alert,
  addToast,
} from "@heroui/react";
import { updateProject } from "@/services/proyectServices";
import PoblacionModal from "@/components/ProyectExtension/tabs/Poblacion/PoblacionModal";
import {
  poblacionCicloVital,
  poblacionCondicion,
  poblacionGrupo,
} from "@/types";

export default function PoblacionTab({
  project,
  editable,
  onProjectUpdate,
}: {
  project: any;
  editable: boolean;
  onProjectUpdate?: (updatedProject: any) => void;
}) {
  const [populations, setPopulations] = useState({
    ciclo_vital: project?.populations?.ciclo_vital || [],
    condicion: project?.populations?.condicion || [],
    grupo: project?.populations?.grupo || [],
  });

  const [activeModal, setActiveModal] = useState<
    "ciclo_vital" | "condicion" | "grupo" | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  // 🧠 Si el padre se actualiza (por ejemplo, desde otra tab), refrescar datos
  useEffect(() => {
    if (project?.populations) {
      setPopulations({
        ciclo_vital: project.populations.ciclo_vital || [],
        condicion: project.populations.condicion || [],
        grupo: project.populations.grupo || [],
      });
    }
  }, [project]);

  // ➕ Agregar población (solo local)
  const handleAdd = async (
    type: "ciclo_vital" | "condicion" | "grupo",
    poblacion: { name: string; numberOfPeople: number }
  ) => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 300)); // pequeño delay visual
      const updated = {
        ...populations,
        [type]: [...(populations[type] || []), poblacion],
      };
      setPopulations(updated);
      setAlert("✅ Población agregada localmente (no guardada).");
      setTimeout(() => setAlert(null), 2500);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Eliminar población (solo local)
  const handleDelete = (
    type: "ciclo_vital" | "condicion" | "grupo",
    index: number
  ) => {
    const updated = {
      ...populations,
      [type]: populations[type].filter((_: any, i: number) => i !== index),
    };
    setPopulations(updated);

    addToast({
      title: "Población eliminada",
      description: "El registro fue eliminado localmente (no guardado).",
      color: "warning",
    });
  };

  // 💾 Guardar cambios (y refrescar el padre)
  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProject = await updateProject(project._id, { populations });
      addToast({
        title: "Cambios guardados",
        description: "Las poblaciones fueron actualizadas correctamente.",
        color: "success",
      });

      // 🧩 Notificar al padre que el proyecto cambió
      if (onProjectUpdate) onProjectUpdate(updatedProject);
    } catch (error) {
      console.error("Error al guardar poblaciones:", error);
      addToast({
        title: "Error al guardar",
        description: "Ocurrió un error al actualizar las poblaciones.",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderSpinner = (text: string) => (
    <div className="flex flex-col items-center justify-center py-16">
      <Spinner color="danger" size="lg" label={text} labelColor="danger" />
    </div>
  );

  const renderTable = (
    title: string,
    type: "ciclo_vital" | "condicion" | "grupo",
    options: any[]
  ) => (
    <Card className="mb-6 shadow-sm border border-gray-100">
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-gray-800">{title}</h4>
          {editable && (
            <Button color="primary" onPress={() => setActiveModal(type)}>
              Agregar
            </Button>
          )}
        </div>

        <Table aria-label={title}>
          <TableHeader>
            <TableColumn>Población</TableColumn>
            <TableColumn>Número de personas</TableColumn>
            <TableColumn>Opción</TableColumn>
          </TableHeader>

          <TableBody>
            {populations[type]?.length > 0 ? (
              populations[type].map((p: any, index: number) => (
                <TableRow key={`${type}-${index}`}>
                  <TableCell>
                    {options.find((o) => o.value === p.name)?.label || p.name}
                  </TableCell>
                  <TableCell>{p.numberOfPeople}</TableCell>
                  <TableCell>
                    {editable ? (
                      <Button
                        color="danger"
                        size="sm"
                        variant="flat"
                        onPress={() => handleDelete(type, index)}
                      >
                        Eliminar
                      </Button>
                    ) : (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-400 italic">
                  No hay poblaciones registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );

  return (
    <div className="p-6">
      {alert && (
        <Alert color="success" className="mb-4" variant="flat">
          {alert}
        </Alert>
      )}

      {loading
        ? renderSpinner("Agregando población...")
        : saving
        ? renderSpinner("Guardando cambios...")
        : (
          <>
            {renderTable("Población por ciclo vital", "ciclo_vital", poblacionCicloVital)}
            {renderTable("Población por condición", "condicion", poblacionCondicion)}
            {renderTable("Población por grupo", "grupo", poblacionGrupo)}

            {editable && (
              <div className="flex justify-end mt-6">
                <Button color="danger" onPress={handleSave}>
                  Guardar
                </Button>
              </div>
            )}
          </>
        )}

      {/* Modales */}
      <PoblacionModal
        title="Agregar población por ciclo vital"
        options={poblacionCicloVital}
        usedValues={populations.ciclo_vital?.map((p: any) => p.name) || []}
        isOpen={activeModal === "ciclo_vital"}
        onClose={() => setActiveModal(null)}
        onSave={(p) => handleAdd("ciclo_vital", p)}
      />
      <PoblacionModal
        title="Agregar población por condición"
        options={poblacionCondicion}
        usedValues={populations.condicion?.map((p: any) => p.name) || []}
        isOpen={activeModal === "condicion"}
        onClose={() => setActiveModal(null)}
        onSave={(p) => handleAdd("condicion", p)}
      />
      <PoblacionModal
        title="Agregar población por grupo"
        options={poblacionGrupo}
        usedValues={populations.grupo?.map((p: any) => p.name) || []}
        isOpen={activeModal === "grupo"}
        onClose={() => setActiveModal(null)}
        onSave={(p) => handleAdd("grupo", p)}
      />
    </div>
  );
}
