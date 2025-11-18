"use client";

import { useState, useEffect, useRef } from "react";
import {
  Input,
  Textarea,
  Button,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Spinner,
  addToast,
} from "@heroui/react";
import { PlusCircleIcon } from "@/components/icons";
import { updateProject } from "@/services/proyectServices";

export default function DescripcionTab({
  project,
  editable,
  onProjectUpdate,
}: {
  project: any;
  editable: boolean;
  onProjectUpdate?: (updatedProject: any) => void;
}) {
  const [formData, setFormData] = useState({
    description: "",
    justification: "",
    location: "",
    objectiveGeneral: "",
    objectivesSpecific: [""],
  });

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "danger"; text: string } | null>(
    null
  );

  const didInit = useRef(false);

  // 🧠 Inicializa datos cuando llega el proyecto
  useEffect(() => {
    if (project && !didInit.current) {
      didInit.current = true;
      setFormData({
        description: project.description || "",
        justification: project.justification || "",
        location: project.location || "",
        objectiveGeneral: project.objectiveGeneral || "",
        objectivesSpecific:
          Array.isArray(project.objectivesSpecific) && project.objectivesSpecific.length > 0
            ? project.objectivesSpecific
            : [""],
      });
    }
  }, [project]);

  // 🔄 Si el padre actualiza el proyecto (por ejemplo, otra tab)
  useEffect(() => {
    if (project && didInit.current) {
      setFormData({
        description: project.description || "",
        justification: project.justification || "",
        location: project.location || "",
        objectiveGeneral: project.objectiveGeneral || "",
        objectivesSpecific:
          Array.isArray(project.objectivesSpecific) && project.objectivesSpecific.length > 0
            ? project.objectivesSpecific
            : [""],
      });
    }
  }, [project]);

  // 📝 Cambios en campos generales
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 🧩 Cambios en objetivos específicos
  const handleObjectiveChange = (index: number, value: string) => {
    const updated = [...formData.objectivesSpecific];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, objectivesSpecific: updated }));
  };

  // ➕ Agregar objetivo
  const addObjective = () => {
    if (!formData.objectivesSpecific.at(-1)?.trim()) return;
    setFormData((prev) => ({
      ...prev,
      objectivesSpecific: [...prev.objectivesSpecific, ""],
    }));
  };

  // ❌ Eliminar objetivo
  const removeObjective = (index: number) => {
    if (formData.objectivesSpecific.length <= 1) return;
    const updated = formData.objectivesSpecific.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, objectivesSpecific: updated }));
  };

  // 💾 Guardar en backend y actualizar el padre
  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        description: formData.description,
        justification: formData.justification,
        location: formData.location,
        objectiveGeneral: formData.objectiveGeneral,
        objectivesSpecific: formData.objectivesSpecific.filter((o) => o.trim() !== ""),
      };

      const updatedProject = await updateProject(project._id, payload);

      // ✅ Actualiza el padre (ProjectTabs)
      if (onProjectUpdate) onProjectUpdate(updatedProject);

      addToast({
        title: "Cambios guardados",
        description: "Descripción del proyecto actualizada correctamente.",
        color: "success",
      });
    } catch (error) {
      console.error("Error guardando la descripción:", error);
      setAlert({
        type: "danger",
        text: "❌ Error al guardar la descripción del proyecto.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setAlert(null), 4000);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 rounded-lg w-full">
      <Card className="w-full mx-auto shadow-md border border-gray-100 bg-white transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800">
            Descripción del proyecto
          </h3>
        </CardHeader>

        <CardBody className="pt-4 space-y-6">
          {/* Mensaje de alerta */}
          {alert && (
            <Alert color={alert.type} className="mb-4" variant="flat">
              {alert.text}
            </Alert>
          )}

          {/* Campos principales */}
          <Textarea
            label="El problema"
            labelPlacement="outside"
            placeholder="Problema a solucionar"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            isDisabled={!editable}
          />

          <Textarea
            label="Justificación"
            labelPlacement="outside"
            placeholder="Justificación del proyecto"
            value={formData.justification}
            onChange={(e) => handleChange("justification", e.target.value)}
            isDisabled={!editable}
          />

          <Input
            label="Ubicación geográfica"
            labelPlacement="outside"
            placeholder="Ubicación donde se va a ejecutar el proyecto"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            isDisabled={!editable}
          />

          <Textarea
            label="Objetivo general"
            labelPlacement="outside"
            placeholder="Objetivo general"
            value={formData.objectiveGeneral}
            onChange={(e) => handleChange("objectiveGeneral", e.target.value)}
            isDisabled={!editable}
          />

          {/* Objetivos específicos */}
          <div className="space-y-3">
            <label className="font-medium text-gray-700 text-sm mb-1 block">
              Objetivos específicos
            </label>

            {formData.objectivesSpecific.map((obj, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-start gap-3 border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <Textarea
                  placeholder={`Objetivo específico ${index + 1}`}
                  value={obj}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  isDisabled={!editable}
                  minRows={2}
                  className="flex-1"
                />
                {editable && (
                  <Button
                    color="danger"
                    variant="flat"
                    isDisabled={formData.objectivesSpecific.length <= 1}
                    onPress={() => removeObjective(index)}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            ))}

            {editable && (
              <div className="flex justify-end mt-2">
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<PlusCircleIcon size={18} />}
                  onPress={addObjective}
                  isDisabled={!formData.objectivesSpecific.at(-1)?.trim()}
                >
                  Agregar objetivo específico
                </Button>
              </div>
            )}
          </div>

          {/* Botón guardar */}
          {editable && (
            <div className="pt-6 text-right">
              <Button
                color="danger"
                size="lg"
                onPress={handleSave}
                isLoading={saving}
                spinner={<Spinner color="white" size="sm" />}
              >
                Guardar
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
