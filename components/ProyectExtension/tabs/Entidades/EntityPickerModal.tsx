"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner,
  Pagination,
  Select,
  SelectItem,
} from "@heroui/react";
import debounce from "lodash.debounce";
import { getEntities } from "@/services/entityService";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

export default function EntityPickerModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    entityId: string;
    aporteEspecie: number;
    aporteEfectivo: number;
  }) => void;
}) {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [aporteEspecie, setAporteEspecie] = useState("");
  const [aporteEfectivo, setAporteEfectivo] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  // 📄 Paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // 🔍 Búsqueda con debounce (500ms)
  const fetchEntities = useMemo(
    () =>
      debounce(async (query: string) => {
        setLoading(true);
        try {
          const data = await getEntities(query);
          setEntities(data);
          setPage(1); // reiniciar página al buscar
        } catch (error) {
          console.error("Error al buscar entidades:", error);
          setMessage({
            type: "danger",
            text: "No se pudieron cargar las entidades.",
          });
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  // 🧹 Limpiar debounce cuando se desmonte
  useEffect(() => {
    return () => {
      fetchEntities.cancel();
    };
  }, [fetchEntities]);

  // 🧠 Llamar la búsqueda cuando cambia el texto o se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedEntity(null);
      fetchEntities(search.trim());
    }
  }, [isOpen, search, fetchEntities]);

  // 🧮 Calcular entidades visibles en la página actual
  const paginatedEntities = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return entities.slice(start, start + rowsPerPage);
  }, [entities, page, rowsPerPage]);

  const totalPages = Math.ceil(entities.length / rowsPerPage);

  // 🔗 Vincular entidad
  const handleVincular = () => {
    if (!selectedEntity) {
      setMessage({
        type: "danger",
        text: "Por favor, selecciona una entidad.",
      });
      return;
    }
    onConfirm({
      entityId: selectedEntity._id,
      aporteEspecie: Number(aporteEspecie) || 0,
      aporteEfectivo: Number(aporteEfectivo) || 0,
    });
  };

  return (
    <>
      {/* 🔔 Toast de notificación */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${
              message.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
            <button
              className="ml-2 text-white/80 hover:text-white"
              onClick={() => setMessage(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧩 Modal principal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="text-lg font-semibold text-gray-800 mt-2">
            Vincular entidad existente
          </ModalHeader>

          <ModalBody className="bg-gray-50 rounded-xl p-6">
            {/* 🔍 Campos de búsqueda */}
            <div className="flex flex-wrap md:flex-nowrap gap-3 mb-6 items-end">
              <Input
                variant="bordered"
                radius="lg"
                label="Buscar entidad"
                placeholder="Nombre o NIT"
                value={search}
                onValueChange={setSearch}
              />
              <Input
                variant="bordered"
                radius="lg"
                label="Aporte en especie"
                type="number"
                placeholder="0"
                value={aporteEspecie}
                onValueChange={setAporteEspecie}
              />
              <Input
                variant="bordered"
                radius="lg"
                label="Aporte en efectivo"
                type="number"
                placeholder="0"
                value={aporteEfectivo}
                onValueChange={setAporteEfectivo}
              />
            </div>

            {/* 📋 Tabla de entidades */}
            {loading ? (
              <div className="flex justify-center py-10">
                <Spinner label="Buscando entidades..." color="danger" />
              </div>
            ) : (
              <>
                <Table
                  aria-label="Tabla de entidades"
                  removeWrapper
                  classNames={{
                    base: "border border-gray-200 rounded-2xl shadow-sm overflow-hidden bg-white",
                    thead: "bg-gray-50 text-gray-700 text-sm font-semibold",
                    th: "px-4 py-3 text-left",
                    tr: "hover:bg-gray-50 transition-colors duration-200",
                    td: "px-4 py-3 text-sm text-gray-700",
                  }}
                >
                  <TableHeader>
                    <TableColumn>Nombre</TableColumn>
                    <TableColumn>NIT</TableColumn>
                    <TableColumn>Tipo</TableColumn>
                    <TableColumn>Sector</TableColumn>
                    <TableColumn>Seleccionar</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={"No se encontraron entidades."}>
                    {paginatedEntities.map((entity) => (
                      <TableRow
                        key={entity._id}
                        className={
                          selectedEntity?._id === entity._id
                            ? "bg-green-50"
                            : ""
                        }
                      >
                        <TableCell className="font-medium text-gray-900">
                          {entity.name}
                        </TableCell>
                        <TableCell>{entity.nit}</TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                            {entity.typeEntity}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize">
                          {entity.sector || "otro"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color={
                              selectedEntity?._id === entity._id
                                ? "success"
                                : "default"
                            }
                            variant={
                              selectedEntity?._id === entity._id
                                ? "solid"
                                : "flat"
                            }
                            onPress={() => setSelectedEntity(entity)}
                          >
                            {selectedEntity?._id === entity._id
                              ? "Seleccionada"
                              : "Elegir"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 📄 Controles de paginación */}
                <div className="flex justify-between items-center mt-4 px-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Filas por página:</span>
                    <Select
                      size="sm"
                      selectedKeys={[rowsPerPage.toString()]}
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                      className="w-[80px]"
                    >
                      {[5, 10, 20, 50, 100].map((num) => (
                        <SelectItem key={num}>{num}</SelectItem>
                      ))}
                    </Select>
                    <span className="ml-3">
                      Mostrando {paginatedEntities.length} de {entities.length}
                    </span>
                  </div>

                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    color="danger"
                    showControls
                  />
                </div>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleVincular}>
              Vincular
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
