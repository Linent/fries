"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import LayoutDashboard from "@/components/LayoutDashboard";
import ProgramTable from "@/components/Programs/ProgramTable";
import { usePrograms } from "@/components/Programs/hooks/usePrograms";

export default function ProgramPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Evita doble ejecución en modo estricto
  const didRun = useRef(false);

  // Hook personalizado para CRUD de programas
  const {
    programs,
    loading,
    create,
    update,
    remove,
    reload,
  } = usePrograms();

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <LayoutDashboard>
      <h1 className="text-2xl font-bold text-gray-700 mb-4">
        Programas Académicos
      </h1>

      <div className="bg-white rounded-xl shadow p-4">
        <ProgramTable
          programs={programs}
          loading={loading}
          onCreate={create}
          onEdit={update}
          onDelete={remove}
          onRefresh={reload}
        />
      </div>
    </LayoutDashboard>
  );
}
