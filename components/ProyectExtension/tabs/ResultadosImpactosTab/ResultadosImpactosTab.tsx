"use client";

import { useState } from "react";
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
import ResultadoImpactoModal from "@/components/ProyectExtension/tabs/ResultadosImpactosTab/ResultadoImpactoModal";

export default function ResultadosImpactosTab({
  project,
  editable,
  onProjectUpdate,
}: {
  project: any;
  editable: boolean;
  onProjectUpdate?: (updatedProject: any) => void;
}) {
  const [data, setData] = useState({
    results: project?.results || [],
    impacts: project?.impacts || [],
  });

  const [activeModal, setActiveModal] = useState<"result" | "impact" | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  // ➕ Agregar
  const handleAdd = (type: "result" | "impact", item: any) => {
    const updated = {
      ...data,
      [type === "result" ? "results" : "impacts"]: [
        ...(data[type === "result" ? "results" : "impacts"] || []),
        item,
      ],
    };
    setData(updated);

    setAlert(
      type === "result"
        ? "✅ Resultado agregado correctamente."
        : "✅ Impacto agregado correctamente."
    );
    setTimeout(() => setAlert(null), 3000);
  };

  // 🗑️ Eliminar
  const handleDelete = (type: "result" | "impact", index: number) => {
    const updated = {
      ...data,
      [type === "result" ? "results" : "impacts"]: data[
        type === "result" ? "results" : "impacts"
      ].filter((_: any, i: number) => i !== index),
    };
    setData(updated);

    addToast({
      title: "Elemento eliminado",
      description: "El registro fue eliminado correctamente.",
      color: "danger",
    });
  };

  // 💾 Guardar
  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProject = await updateProject(project._id, data);

      if (onProjectUpdate && updatedProject) {
        onProjectUpdate(updatedProject);
      }

      addToast({
        title: "Cambios guardados",
        description: "Los resultados e impactos fueron actualizados correctamente.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error al guardar",
        description: "Ocurrió un error al guardar los cambios.",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  // 📋 Tablas
  const renderResultsTable = () => (
    <Card className="mb-6 shadow-sm border border-gray-100">
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-gray-800">
            Resultados o productos del proyecto
          </h4>
          {editable && (
            <Button color="primary" onPress={() => setActiveModal("result")}>
              Agregar
            </Button>
          )}
        </div>

        <Table aria-label="Resultados">
          <TableHeader>
            <TableColumn>Resultado / Producto</TableColumn>
            <TableColumn>Criterio de aceptación</TableColumn>
            <TableColumn>Indicador</TableColumn>
            <TableColumn>Beneficiario</TableColumn>
            <TableColumn>Opción</TableColumn>
          </TableHeader>

          <TableBody>
            {data.results?.length > 0 ? (
              data.results.map((r: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{r.product || "-"}</TableCell>
                  <TableCell>{r.acceptanceCriteria || "-"}</TableCell>
                  <TableCell>{r.indicator || "-"}</TableCell>
                  <TableCell>{r.beneficiary || "-"}</TableCell>
                  <TableCell>
                    {editable ? (
                      <Button
                        color="danger"
                        size="sm"
                        variant="flat"
                        onPress={() => handleDelete("result", index)}
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
                <TableCell colSpan={5} className="text-center text-gray-400 italic">
                  No hay resultados registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );

  const renderImpactsTable = () => (
    <Card className="mb-6 shadow-sm border border-gray-100">
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-gray-800">
            Impactos esperados del proyecto
          </h4>
          {editable && (
            <Button color="primary" onPress={() => setActiveModal("impact")}>
              Agregar
            </Button>
          )}
        </div>

        <Table aria-label="Impactos">
          <TableHeader>
            <TableColumn>Impacto esperado</TableColumn>
            <TableColumn>Plazo</TableColumn>
            <TableColumn>Indicadores</TableColumn>
            <TableColumn>Supuestos</TableColumn>
            <TableColumn>Opción</TableColumn>
          </TableHeader>

          <TableBody>
            {data.impacts?.length > 0 ? (
              data.impacts.map((imp: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{imp.expectedImpact || "-"}</TableCell>
                  <TableCell>{imp.term || "-"}</TableCell>
                  <TableCell>{imp.indicators || "-"}</TableCell>
                  <TableCell>{imp.assumptions || "-"}</TableCell>
                  <TableCell>
                    {editable ? (
                      <Button
                        color="danger"
                        size="sm"
                        variant="flat"
                        onPress={() => handleDelete("impact", index)}
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
                <TableCell colSpan={5} className="text-center text-gray-400 italic">
                  No hay impactos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );

  // 🌀 Spinner general de guardado
  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner color="danger" label="Guardando cambios..." labelColor="danger" size="lg" />
    </div>
  );

  return (
    <div className="p-6">
      {alert && (
        <Alert color="success" className="mb-4" variant="flat">
          {alert}
        </Alert>
      )}

      {/* Si está guardando, mostrar spinner */}
      {saving ? (
        renderSpinner()
      ) : (
        <>
          {renderResultsTable()}
          {renderImpactsTable()}

          {editable && (
            <div className="flex justify-end mt-6">
              <Button color="danger" onPress={handleSave}>
                Guardar
              </Button>
            </div>
          )}

          {/* Modales */}
          <ResultadoImpactoModal
            type="result"
            isOpen={activeModal === "result"}
            onClose={() => setActiveModal(null)}
            onSave={(item: any) => handleAdd("result", item)}
          />

          <ResultadoImpactoModal
            type="impact"
            isOpen={activeModal === "impact"}
            onClose={() => setActiveModal(null)}
            onSave={(item: any) => handleAdd("impact", item)}
          />
        </>
      )}
    </div>
  );
}
