"use client";

import { useEffect, useState, useRef } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";
import EntitiesTable from "@/components/Entities/EntitiesTable";
import { getEntities } from "@/services/entityService";
import { useRouter } from "next/navigation";

export default function EntitiesPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<any[]>([]);
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

    const fetchEntities = async () => {
      try {
        const data = await getEntities();
        setEntities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando entidades:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <LayoutDashboard>
      <h1 className="text-2xl font-bold text-gray-700 mb-4">
        Gestión de Entidades
      </h1>
      <div className="bg-white rounded-xl shadow p-4">
        <EntitiesTable entities={entities} loading={loading} />
      </div>
    </LayoutDashboard>
  );
}
