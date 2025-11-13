"use client";

import {
  Navbar as HeroUINavbar,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Breadcrumbs,
  BreadcrumbItem,
} from "@heroui/react";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { routeNames } from "@/types";
import { getProjectById } from "@/services/proyectServices";

type TopbarProps = {
  toggleSidebar: () => void; // 👈 función para abrir/cerrar el sidebar
};

export default function Topbar({ toggleSidebar }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);

  // 🧭 Cargar nombre del usuario desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) setUserName(storedName);
    }
  }, []);

  // 🧭 Si estamos en /extension/[id], obtener el título del proyecto
  useEffect(() => {
    if (!pathname) return;

    const match = pathname.match(/extension\/([a-f0-9]{24})/);
    if (match && match[1]) {
      const projectId = match[1];
      getProjectById(projectId)
        .then(() => setProjectName("Detalle del proyecto"))
        .catch(() => setProjectName("Detalle del proyecto"));
    } else {
      setProjectName(null);
    }
  }, [pathname]);

  // 🚪 Cerrar sesión
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("role");
      router.push("/");
    }
  };

  // 🧭 Generar breadcrumbs dinámicos
  const pathSegments =
    pathname?.split("/").filter((segment) => segment !== "") || [];

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");

    let label =
      routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    // 🔹 Si el segmento es un ObjectId, mostrar el nombre del proyecto
    if (segment.match(/^[a-f0-9]{24}$/)) {
      label = projectName || "Cargando...";
    }

    return { href, label };
  });

  return (
    <HeroUINavbar
      className="flex items-center justify-between bg-white shadow px-4 py-3 md:px-6 w-full"
      maxWidth="full"
      position="sticky"
    >
      <div className="flex items-center gap-4">
        {/* 🔹 Botón hamburguesa (visible solo en móviles) */}
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-700 hover:text-red-600 transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* 🧭 Breadcrumb dinámico */}
        <Breadcrumbs>
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((bc) => (
              <BreadcrumbItem key={bc.href} href={bc.href}>
                {bc.label}
              </BreadcrumbItem>
            ))
          ) : (
            <BreadcrumbItem>Inicio</BreadcrumbItem>
          )}
        </Breadcrumbs>
      </div>

      {/* 👤 Menú de usuario */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-700 hidden sm:block">
          {userName || "Usuario"}
        </span>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform cursor-pointer"
              name={userName || "U"}
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Perfil de usuario" variant="flat">
            <DropdownItem key="perfil">Perfil</DropdownItem>
            <DropdownItem key="ajustes">Ajustes</DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={handleLogout}>
              Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </HeroUINavbar>
  );
}
