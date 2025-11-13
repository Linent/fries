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
import { useState } from "react";
import FileDropzone from "@/components/FileDropzone"; // 👈 1. Importa el componente TSX

// 1. Definimos los tipos para las props del Modal
interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, name: string) => Promise<void>;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onUpload,
}: UploadDocumentModalProps) {
  // 2. Tipamos los estados
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 3. Tipamos el parámetro de la función
  const handleFileAccepted = (selectedFile: File) => {
    setFile(selectedFile);
    if (!fileName.trim()) {
      const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
      setFileName(nameWithoutExtension);
    }
  };

  const handleSubmit = async () => {
    if (!file || !fileName.trim()) return;
    setLoading(true);
    await onUpload(file, fileName);
    setLoading(false);
    // Limpiamos el estado al terminar
    setFile(null);
    setFileName("");
  };

  const handleClose = () => {
    setFile(null);
    setFileName("");
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
        <ModalHeader>Subir documento</ModalHeader>
        <ModalBody>
          <Input
            label="Nombre del documento"
            placeholder="Ej. Acta de inicio"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            description="El nombre que tendrá el documento en el sistema."
            className="mb-4"
          />

          {/* 4. Usamos el componente FileDropzone */}
          <FileDropzone
            onFileAccepted={handleFileAccepted}
            selectedFile={file}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" color="danger" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={!file || !fileName.trim() || loading}
          >
            Subir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}