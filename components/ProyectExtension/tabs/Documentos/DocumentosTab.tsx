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
import { useProjectPermissions } from "@/components/ProyectExtension/tabs/Documentos/hooks/useProjectPermissions";

export default function DocumentosTab({ project, editable }: { project: any; editable: boolean }) {
  const { canUpload, canEdit, canDelete } = useProjectPermissions(project);

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<any>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

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
    } catch {
      setMsg({ type: "danger", text: "Error cargando documentos" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!didRun.current) {
      didRun.current = true;
      loadDocuments();
    }
  }, [project]);

  const handleUpload = async (file: File, name: string) => {
    try {
      await uploadProjectDocument(project._id, file, name);
      setMsg({ type: "success", text: "Documento cargado" });
      setModalOpen(false);
      loadDocuments();
    } catch {
      setMsg({ type: "danger", text: "Error al subir archivo" });
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("¿Eliminar documento?")) return;

    try {
      await deleteProjectDocument(project._id, docId);
      setMsg({ type: "success", text: "Documento eliminado" });
      loadDocuments();
    } catch {
      setMsg({ type: "danger", text: "No se pudo eliminar" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {msg && <Alert color={msg.type}>{msg.text}</Alert>}

      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            Documentos del proyecto
          </h3>

          {canUpload && (
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
          <Table removeWrapper>
            <TableHeader>
              <TableColumn>Nombre</TableColumn>
              <TableColumn>Tipo</TableColumn>
              <TableColumn>Fecha</TableColumn>
              <TableColumn>Acciones</TableColumn>
            </TableHeader>

            <TableBody
              isLoading={loading}
              emptyContent={loading ? "Cargando..." : "No hay documentos"}
            >
              {documents.map((doc) => {
                // 🔥 permisos por documento
                const { canEdit, canDelete } = useProjectPermissions(
                  project,
                  doc
                );

                return (
                  <TableRow key={doc._id}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>
                      {new Date(doc.uploadedAt).toLocaleDateString("es-CO")}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        {/* Ver siempre */}
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          as="a"
                          href={doc.url}
                          target="_blank"
                          startContent={<EyeIcon size={16} />}
                        >
                          Ver
                        </Button>

                        {/* Editar solo si tiene permiso */}
                        {canEdit && (
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

                        {/* Borrar solo si tiene permiso */}
                        {canDelete && (
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
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

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
