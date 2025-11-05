"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Pagination,
  Select,
  SelectItem,
} from "@heroui/react";
import debounce from "lodash.debounce";
import { getUsers } from "@/services/userServices";
import { getProjectMembers } from "@/services/projectMemberService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (userId: string) => void;
  fixedRole: "director" | "coautor" | "estudiante" | null;
  projectId?: string;
}

export default function UserPickerModal({
  isOpen,
  onClose,
  onSelect,
  fixedRole,
  projectId,
}: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<any>({
    director: null,
    coauthors: [],
    students: [],
  });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Cargar todos los usuarios
  const loadUsers = async (search = query, currentPage = page) => {
    setLoading(true);
    try {
      const data = await getUsers(search);
      let filtered = data || [];

      // 🔥 FILTRO LOCAL SEGÚN LA SECCIÓN
      if (fixedRole === "estudiante") {
        filtered = filtered.filter((u: any) => u.role === "estudiante");
      } else {
        // director o coautor → mostrar todos los docentes
        filtered = filtered.filter((u: any) => u.role === "docente");
      }

      const start = (currentPage - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      setUsers(filtered.slice(start, end));
      setTotalPages(Math.ceil(filtered.length / rowsPerPage));
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar miembros del proyecto
  const loadMembers = async () => {
    if (!projectId) return;
    try {
      const data = await getProjectMembers(projectId);
      setProjectMembers({
        director: data?.director || null,
        coauthors: Array.isArray(data?.coauthors) ? data.coauthors : [],
        students: Array.isArray(data?.students) ? data.students : [],
      });
    } catch (error) {
      console.error("Error cargando miembros:", error);
    }
  };

  // 🔹 Buscar con debounce
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setPage(1);
      loadUsers(value, 1);
    }, 400),
    [rowsPerPage, fixedRole]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // 🔹 Verificar si ya está vinculado
  const isAlreadyLinked = (user: any): boolean => {
    const uid = String(user._id);
    const inCoauthors = projectMembers.coauthors?.some((m: any) => String(m._id) === uid);
    const inStudents = projectMembers.students?.some((m: any) => String(m._id) === uid);
    const isDirector = projectMembers.director && String(projectMembers.director._id) === uid;

    // ✅ Nueva lógica combinada:
    // - Director: no puede ser otro director, pero sí coautor
    // - Coautor: no puede repetirse como coautor, pero sí ser director
    // - Estudiante: no puede repetirse como estudiante
    if (fixedRole === "director") return isDirector;
    if (fixedRole === "coautor") return inCoauthors;
    if (fixedRole === "estudiante") return inStudents;
    return false;
  };

  useEffect(() => {
    if (isOpen) {
      (async () => {
        await loadMembers();
        await loadUsers(query, page);
      })();
    }
  }, [isOpen, page, rowsPerPage, fixedRole]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          {fixedRole === "estudiante"
            ? "Seleccionar estudiante"
            : "Seleccionar docente"}
        </ModalHeader>

        <ModalBody>
          <Input
            placeholder="Buscar por nombre o correo"
            value={query}
            onChange={handleSearch}
          />

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spinner color="danger" />
            </div>
          ) : (
            <>
              <Table
                aria-label="Usuarios disponibles"
                removeWrapper
                className="w-full mt-3"
                classNames={{
                  base: "border border-gray-200 rounded-2xl shadow-sm overflow-hidden bg-white w-full",
                  thead: "bg-gray-50 text-gray-700 text-sm font-semibold",
                  th: "px-4 py-3 text-left",
                  tr: "hover:bg-gray-50 transition-colors duration-200",
                  td: "px-4 py-3 text-sm text-gray-700",
                }}
              >
                <TableHeader>
                  <TableColumn>Nombre</TableColumn>
                  <TableColumn>Email</TableColumn>
                  <TableColumn>Rol</TableColumn>
                  <TableColumn>Seleccionar</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No hay resultados">
                  {users.map((user) => {
                    const alreadyLinked = isAlreadyLinked(user);
                    return (
                      <TableRow key={user._id}>
                        <TableCell>
                          {user.firstName} {user.firstLastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.role}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color={alreadyLinked ? "default" : "primary"}
                            variant={alreadyLinked ? "flat" : "solid"}
                            disabled={alreadyLinked}
                            className={
                              alreadyLinked
                                ? "pointer-events-none opacity-70 cursor-not-allowed"
                                : ""
                            }
                            onPress={() => !alreadyLinked && onSelect(user._id)}
                          >
                            {alreadyLinked ? "Ya vinculado" : "Elegir"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* 📑 Paginación */}
              <div className="flex justify-between items-center mt-4 px-2 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Filas por página:</span>
                  <Select
                    size="sm"
                    selectedKeys={[rowsPerPage.toString()]}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="w-[90px]"
                    aria-label="Filas por página"
                  >
                    {[5, 10, 15, 20].map((num) => (
                      <SelectItem key={`${num}`} textValue={`${num}`}>
                        {num}
                      </SelectItem>
                    ))}
                  </Select>
                  <span className="ml-3">
                    Mostrando {users.length} de {totalPages * rowsPerPage}
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
          <Button variant="flat" color="danger" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
