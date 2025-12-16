"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { getUserById } from "@/services/userServices";
import { IUser } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function UserViewModal({ isOpen, onClose, userId }: Props) {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const data = await getUserById(userId);
        setUser(data);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };
    fetchData();
  }, [userId]);

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="5xl">
      <ModalContent>
        <ModalHeader className="text-xl font-semibold">
          Detalles del usuario
        </ModalHeader>
        <ModalBody className="grid grid-cols-2 gap-3">
          <p><strong>Código:</strong> {user.codigo}</p>
          <p><strong>Tipo Documento:</strong> {user.tipo_documento}</p>
          <p><strong>DNI:</strong> {user.dni}</p>
          <p><strong>Nombre:</strong> {user.firstName} {user.secondName} {user.firstLastName} {user.secondLastName}</p>
          <p><strong>Correo:</strong> {user.email}</p>
          <p><strong>Celular:</strong> {user.celular}</p>
          <p><strong>Rol:</strong> {user.roles}</p>
          <p><strong>Programa Académico:</strong> {user.academic_program || "N/A"}</p>
          <p><strong>Institución:</strong> {user.institucion || "Universidad Francisco de Paula Santander"}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
