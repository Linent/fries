"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Switch,
} from "@heroui/react";
import { useState, useEffect } from "react";

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, visibleToFormulator: boolean) => Promise<void>;
  initialText: string;
  initialVisible: boolean;
  canEditVisibility: boolean; // fries y admin
}

export default function EditCommentModal({
  isOpen,
  onClose,
  onSubmit,
  initialText,
  initialVisible,
  canEditVisibility,
}: EditCommentModalProps) {
  const [text, setText] = useState(initialText);
  const [visibleToFormulator, setVisibleToFormulator] =
    useState(initialVisible);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setText(initialText);
    setVisibleToFormulator(initialVisible);
  }, [initialText, initialVisible]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setLoading(true);

    await onSubmit(text, visibleToFormulator);
    setLoading(false);
  };

  const handleClose = () => {
    setText(initialText);
    setVisibleToFormulator(initialVisible);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      size="lg"
      backdrop="blur"
      placement="center"
    >
      <ModalContent>
        <ModalHeader>Editar comentario</ModalHeader>

        <ModalBody>
          <Input
            label="Comentario"
            placeholder="Escribe tu comentario"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {canEditVisibility && (
            <Switch
              isSelected={visibleToFormulator}
              onValueChange={setVisibleToFormulator}
              color="danger"
            >
              Visible para el formulador
            </Switch>
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
            isDisabled={!text.trim()}
          >
            Guardar cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
