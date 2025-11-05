"use client";

import { useState } from "react";
import { Input, Button, Alert, Select, SelectItem } from "@heroui/react";
import { updateProject } from "@/services/proyectServices";

export default function GeneralTab({
  project,
  editable,
}: {
  project: any;
  editable: boolean;
}) {
  const [form, setForm] = useState({
    title: project.title || "",
    code: project.code || "",
    typeProject: project.typeProject || "",
    totalValue: project.totalValue || 0,
    year: project.year || "",
    semester: project.semester || "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectTypes = ["Remunerado", "Solidarío"];
  const semesterOptions = ["primero", "segundo"];

  const handleChange = (field: string, value: string | number) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    if (!form.title || !form.typeProject || !form.year || !form.semester) {
      setError(
        "Por favor completa todos los campos obligatorios marcados con *"
      );
      return;
    }

    try {
      await updateProject(project._id, form);
      setMessage("Datos actualizados correctamente");
    } catch (err) {
      console.error(err);
      setError("Error al guardar los datos");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Información general del proyecto
      </h3>

      {error && <Alert color="danger">{error}</Alert>}
      {message && <Alert color="success">{message}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Título *"
          name="title"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          readOnly={!editable}
          required
        />
        <Input label="Código" name="code" value={form.code} readOnly />

        <Select
          label="Tipo de proyecto *"
          placeholder="Selecciona un tipo"
          selectedKeys={[form.typeProject]}
          onChange={(e) => handleChange("typeProject", e.target.value)}
          isDisabled={!editable}
          required
        >
          {projectTypes.map((type) => (
            <SelectItem key={type}>{type}</SelectItem>
          ))}
        </Select>

        <Input
          label="Valor total del proyecto"
          name="totalValue"
          type="number"
          value={form.totalValue}
          onChange={(e) => handleChange("totalValue", Number(e.target.value))}
          readOnly={!editable}
        />

        <Input
          label="Año *"
          name="year"
          type="number"
          value={form.year}
          onChange={(e) => handleChange("year", e.target.value)}
          readOnly={!editable}
          required
        />

        <Select
          label="Semestre *"
          placeholder="Selecciona semestre"
          selectedKeys={[form.semester]}
          onChange={(e) => handleChange("semester", e.target.value)}
          isDisabled={!editable}
          required
        >
          {semesterOptions.map((sem) => (
            <SelectItem key={sem}>
              {sem === "primero" ? "Primero" : "Segundo"}
            </SelectItem>
          ))}
        </Select>
      </div>

      {editable && (
        <div className="flex justify-end mt-4">
          <Button color="danger" onPress={handleSubmit}>
            Guardar cambios
          </Button>
        </div>
      )}
    </div>
  );
}
