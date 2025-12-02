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
  fixedRole: "director" | "coautor" | "estudiante";
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

  // ---------------------------------------------------
  // 🔥 FILTRO POR TIPO DE MODAL
  // ---------------------------------------------------
  const filterByRole = (data: any[]) => {
    return data.filter((u) => {
      const roles: string[] = u.roles ?? [];

      if (fixedRole === "estudiante") {
        return roles.includes("estudiante");
      }

      // Director o Coautor → solo docentes
      if (fixedRole === "coautor" || fixedRole === "director") {
        return roles.includes("docente");
      }

      return false;
    });
  };

  // ---------------------------------------------------
  // 🔹 Cargar usuarios (con filtro incluido)
  // ---------------------------------------------------
  const loadUsers = async (search = query, currentPage = page) => {
    setLoading(true);
    try {
      const data = await getUsers(search);

      const filtered = filterByRole(data || []);

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

  // ---------------------------------------------------
  // 🔹 Miembros ya vinculados
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // 🔹 Buscar con debounce
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // 🔹 Validar si ya está vinculado
  // ---------------------------------------------------
  const isAlreadyLinked = (user: any): boolean => {
    const uid = String(user._id);

    const inCoauthors = projectMembers.coauthors?.some((m: any) => String(m._id) === uid);
    const inStudents = projectMembers.students?.some((m: any) => String(m._id) === uid);
    const isDirector = projectMembers.director && String(projectMembers.director._id) === uid;

    if (fixedRole === "director") return isDirector;
    if (fixedRole === "coautor") return inCoauthors;
    if (fixedRole === "estudiante") return inStudents;

    return false;
  };

  // ---------------------------------------------------
  // 🔹 Ejecutar cuando abra modal
  // ---------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      (async () => {
        await loadMembers();
        await loadUsers(query, page);
      })();
    }
  }, [isOpen, page, rowsPerPage, fixedRole]);

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------
  const title =
    fixedRole === "estudiante"
      ? "Seleccionar Estudiante"
      : fixedRole === "director"
      ? "Seleccionar Director"
      : "Seleccionar Coautor";

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>

        <ModalBody>
          <Input
            placeholder="Buscar por nombre o correo..."
            value={query}
            onChange={handleSearch}
          />

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner color="primary" />
            </div>
          ) : (
            <>
              <Table removeWrapper className="mt-3">
                <TableHeader>
                  <TableColumn>Nombre</TableColumn>
                  <TableColumn>Email</TableColumn>
                  <TableColumn>Roles</TableColumn>
                  <TableColumn>Acción</TableColumn>
                </TableHeader>

                <TableBody emptyContent="No hay usuarios disponibles">
                  {users.map((user) => {
                    const alreadyLinked = isAlreadyLinked(user);
                    return (
                      <TableRow key={user._id}>
                        <TableCell>
                          {user.firstName} {user.firstLastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.roles?.map((r: string) => r).join(", ")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color={alreadyLinked ? "default" : "primary"}
                            disabled={alreadyLinked}
                            onPress={() => !alreadyLinked && onSelect(user._id)}
                          >
                            {alreadyLinked ? "Ya vinculado" : "Seleccionar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* PAGINACIÓN */}
              <div className="flex justify-between items-center mt-4">
                <Select
                  size="sm"
                  selectedKeys={[rowsPerPage.toString()]}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-[90px]"
                >
                  {[5, 10, 15, 20].map((n) => (
                    <SelectItem key={`${n}`}>{n}</SelectItem>
                  ))}
                </Select>

                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                  color="primary"
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
