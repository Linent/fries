"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Spinner,
} from "@heroui/react";
import { EyeIcon, UploadIcon, Trash2Icon } from "lucide-react";
import {
  getProjectDocuments,
  uploadProjectDocument,
  deleteProjectDocument,
} from "@/services/proyectServices";
import UploadDocumentModal from "@/components/ProyectExtension/tabs/Documentos/UploadDocumentModal";
import EditDocumentModal from "./EditDocumentModal";

export default function DocumentosTab({
  project,
  editable,
}: {
  project: { _id: string };
  editable: boolean;
}) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null); 
  const didRun = useRef(false);

  const openEditModal = (doc: any) => {
  setSelectedDoc(doc);
  setEditModalOpen(true);
  };
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await getProjectDocuments(project._id);
      setDocuments(data);
    } catch (e) {
      console.error(e);
      setMsg({ type: "danger", text: "Error cargando documentos" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    loadDocuments();
  }, [project._id]);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const handleUpload = async (file: File, name: string) => {
    try {
      await uploadProjectDocument(project._id, file, name);
      setMsg({ type: "success", text: "Documento subido correctamente" });
      await loadDocuments();
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      setMsg({ type: "danger", text: "Error al subir documento" });
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("¿Deseas eliminar este documento?")) return;
    try {
      await deleteProjectDocument(project._id, docId);
      setMsg({ type: "success", text: "Documento eliminado correctamente" });
      await loadDocuments();
    } catch {
      setMsg({ type: "danger", text: "No se pudo eliminar el documento" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {msg && <Alert color={msg.type}>{msg.text}</Alert>}

      <Card className="shadow-sm border border-gray-100 bg-white">
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Documentos del proyecto
          </h3>
          {editable && (
            <Button
              color="primary"
              startContent={<UploadIcon size={16} />}
              onPress={() => setModalOpen(true)}
            >
              Subir documento
            </Button>
          )}
        </CardHeader>

        <CardBody>
          <Table
            aria-label="Archivos del proyecto"
            removeWrapper
            classNames={{
              base: "border border-gray-200 rounded-2xl shadow-sm overflow-hidden bg-white",
              thead: "bg-gray-50 text-gray-700 text-sm font-semibold",
              th: "px-4 py-3 text-left",
              tr: "hover:bg-gray-50 transition-colors duration-200",
              td: "px-4 py-3 text-sm text-gray-700 align-middle",
            }}
          >
            <TableHeader>
              <TableColumn>Nombre</TableColumn>
              <TableColumn>Tipo</TableColumn>
              <TableColumn>Fecha</TableColumn>
              <TableColumn>Acciones</TableColumn>
            </TableHeader>

            <TableBody
              isLoading={loading}
              emptyContent={loading ? "Cargando..." : "No hay documentos registrados."}
            >
              {documents.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell className="font-medium text-gray-800">
                    {doc.name}
                  </TableCell>
                  <TableCell className="capitalize">{doc.type}</TableCell>
                  <TableCell>
                    {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-start">
                      {/* 🔵 Ver documento */}
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<EyeIcon size={16} />}
                        as="a"
                        href={doc.url}
                        target="_blank"
                      >
                        Ver documento
                      </Button>
                      {editable && (
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        startContent={<UploadIcon size={16} />}
                        onPress={() => openEditModal(doc)}
                      >
                        Editar
                      </Button>
                      )}
                      {/* 🔴 Eliminar (solo si editable) */}
                      {editable && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<Trash2Icon size={16} />}
                          onPress={() => handleDelete(doc._id)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal separado */}
      <UploadDocumentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
      />
      {selectedDoc && (
      <EditDocumentModal
      isOpen={editModalOpen}
      onClose={() => setEditModalOpen(false)}
      projectId={project._id}
      document={selectedDoc}
      onUpdated={loadDocuments}
  />
)}
    </div>
  );
}
