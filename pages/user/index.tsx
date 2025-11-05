"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutDashboard from "@/components/LayoutDashboard";
import { fetchUsers } from "@/services/userServices";
import UsersTable from "@/components/user/UsersTable";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    setIsAuthenticated(true);

    const loadUsers = async () => {
      try {
        const data = await fetchUsers(); // usa tu service
        setUsers(data);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <LayoutDashboard>
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Gestión de Usuarios</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <UsersTable users={users} loading={loading} />
      </div>
    </LayoutDashboard>
  );
}
