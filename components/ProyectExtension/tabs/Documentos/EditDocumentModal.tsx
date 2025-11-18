"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from "@heroui/react";
import { useState, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import { updateProjectDocument } from "@/services/proyectServices";

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  document: any;
  onUpdated: () => void;
}

export default function EditDocumentModal({
  isOpen,
  onClose,
  projectId,
  document,
  onUpdated,
}: EditDocumentModalProps) {
  const [name, setName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Cargar datos actuales del documento
  useEffect(() => {
    if (document) {
      setName(document.name || "");
      setFile(null); // archivo solo cuando el usuario suba uno nuevo
    }
  }, [document]);

  const handleFileAccepted = (selected: File) => {
    setFile(selected);
  };

  const handleSave = async () => {
    if (!name.trim() && !file) return;

    setLoading(true);
    try {
      await updateProjectDocument(projectId, document._id, {
        name: name.trim(),
        file: file ?? undefined,
      });

      onUpdated(); // actualizar lista
      onClose(); // cerrar modal
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el documento");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setName(document?.name || "");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      size="3xl"
      backdrop="blur"
      placement="center"
    >
      <ModalContent>
        <ModalHeader>Editar documento</ModalHeader>

        <ModalBody className="space-y-4">
          <em className="text-sm text-gray-500 not-italic">
            Puede editar el nombre o subir un nuevo archivo. Si modifica solo el
            nombre, el archivo actual se conservará. Si carga un archivo nuevo,
            reemplazará al existente pero tendra el mismo nombre.
          </em>
          <Input
            label="Nombre del documento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del documento"
          />

          {/* Mostrar el archivo actual */}
          {!file && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Archivo actual:</span>{" "}
              <a
                href={document.url}
                target="_blank"
                className="text-blue-600 underline"
              >
                {document.name}.{document.type}
              </a>
            </div>
          )}

          {/* Dropzone para subir un nuevo archivo */}
          <FileDropzone
            onFileAccepted={handleFileAccepted}
            selectedFile={file}
          />

          {file && (
            <p className="text-sm text-gray-600 italic">
              Se reemplazará el archivo actual.
            </p>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" color="danger" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={loading}
            isDisabled={!name.trim() || loading}
          >
            Guardar cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
