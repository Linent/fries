"use client";

import { useEffect, useState, useRef } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";
import FacultiesTable from "@/components/Faculties/FacultiesTable";
import { getFaculties } from "@/services/facultyService";
import { useRouter } from "next/navigation";

export default function FacultiesPage() {
  const router = useRouter();
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }

    setIsAuthenticated(true);

    const fetchFaculties = async () => {
      try {
        const data = await getFaculties();
        setFaculties(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando facultades:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <LayoutDashboard>
      <h1 className="text-2xl font-bold text-gray-700 mb-4">
        Gestión de Facultades
      </h1>
      <div className="bg-white rounded-xl shadow p-4">
        <FacultiesTable faculties={faculties} loading={loading} />
      </div>
    </LayoutDashboard>
  );
}
