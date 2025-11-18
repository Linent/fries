"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutDashboard from "@/components/LayoutDashboard";
import UserProfileContent from "@/components/user/UserProfileContent";

import { getUserById } from "@/services/userServices";
import { getTokenPayload } from "@/utils/auth";

export default function ProfilePage() {
  const router = useRouter();
  const didRun = useRef(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }

    const auth = getTokenPayload();
    if (!auth?.id) {
      router.replace("/");
      return;
    }

    setIsAuthenticated(true);

    const loadUser = async () => {
      try {
        const res = await getUserById(auth.id);
        setUserData(res);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <LayoutDashboard>
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Mi Perfil</h1>

      <div className="bg-white rounded-xl shadow p-4">
        <UserProfileContent user={userData} loading={loading} />
      </div>
    </LayoutDashboard>
  );
}
