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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { routeNames } from "@/types";
import { getProjectById } from "@/services/proyectServices"; // asegúrate de que sea el nombre correcto

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname(); // puede ser null durante SSR
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
    if (!pathname) return; // ⚡ Evitar error si pathname es null

    const match = pathname.match(/extension\/([a-f0-9]{24})/);
    if (match && match[1]) {
      const projectId = match[1];
      getProjectById(projectId)
        .then((data) => {
          setProjectName("Detalle del proyecto");
        })
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
      routeNames[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);

    // 🔹 Si el segmento es un ObjectId, mostrar el nombre del proyecto
    if (segment.match(/^[a-f0-9]{24}$/)) {
      label = projectName || "Cargando...";
    }

    return { href, label };
  });

  return (
    <HeroUINavbar className="flex items-center justify-between bg-white shadow px-6 py-3" maxWidth="full" position="sticky">
    
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

      {/* 👤 Menú de usuario */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-700">
          {userName || "Usuario"}
        </span>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
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
