// src/components/FileDropzone.tsx (o donde lo quieras poner)
"use client";

import { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { UploadCloud } from "lucide-react";

// 1. Definimos los tipos para las props
interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  selectedFile: File | null;
}

// 2. Definimos los tipos de archivo aceptados
const acceptedFileTypes: Accept = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/zip": [".zip"],
  "application/vnd.rar": [".rar"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

export default function FileDropzone({
  onFileAccepted,
  selectedFile,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Solo tomamos el primer archivo
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // Solo permitir un archivo a la vez
    accept: acceptedFileTypes, // Usamos la variable de tipos
  });

  // Clases de CSS para los estilos (Tailwind)
  const baseStyle =
    "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out";
  const activeStyle = "border-blue-500 bg-blue-50";
  const inactiveStyle = "border-gray-300 hover:border-blue-400";
  const fileSelectedStyle = "border-green-500 bg-green-50";

  // Determinar el estilo
  let style = `${baseStyle} ${inactiveStyle}`;
  if (isDragActive) {
    style = `${baseStyle} ${activeStyle}`;
  } else if (selectedFile) {
    style = `${baseStyle} ${fileSelectedStyle}`;
  }

  return (
    <div {...getRootProps()} className={style}>
      <input {...getInputProps()} />

      <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />

      {isDragActive ? (
        <p className="text-blue-600 font-semibold">¡Suelta el archivo aquí!</p>
      ) : selectedFile ? (
        <>
          <p className="text-green-700 font-semibold">Archivo seleccionado:</p>
          <p className="text-sm text-gray-800">{selectedFile.name}</p>
        </>
      ) : (
        <>
          <p className="text-gray-600">
            <span className="font-semibold text-blue-600">Haz clic</span> o
            arrastra y suelta un archivo
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, DOCX, XLSX, ZIP, Imágenes, etc.
          </p>
        </>
      )}
    </div>
  );
}