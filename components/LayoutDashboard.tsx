// LayoutDashboard.tsx
"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/utils/auth";

export default function LayoutDashboard({
  children,
  headerTitle, // 👈 nuevo prop
}: {
  children: React.ReactNode;
  headerTitle?: string; 
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && isTokenExpired()) {
      localStorage.removeItem("token");
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-col flex-1 md:ml-64">
        
        {/* 🔝 Topbar con título dinámico */}
        <div className="fixed top-0 left-0 w-full z-30 md:pl-64 bg-white">
          <Topbar
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            headerTitle={headerTitle}
          />
        </div>

        <main className="flex-1 p-6 mt-20 md:mt-24 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
