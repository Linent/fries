"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/utils/auth";

export default function LayoutDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && isTokenExpired()) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* 🧱 Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* 🧭 Contenedor principal */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-64"
        }`}
      >
        {/* 🔝 Topbar fijo */}
        <div className="fixed top-0 left-0 w-full z-30 md:pl-64 bg-white">
          <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>

        {/* 📦 Contenido principal */}
        <main className="flex-1 p-6 mt-20 md:mt-24 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
