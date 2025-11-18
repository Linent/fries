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

import { getTokenPayload } from "@/utils/auth";
import { getUserById } from "@/services/userServices";
import { routeNames } from "@/types";
import { DEFAULT_IMAGE } from "@/types/types";
import { LogoutIcon } from "./icons";
type TopbarProps = {
  toggleSidebar: () => void; // 👈 función para abrir/cerrar el sidebar
};
export default function Topbar({ toggleSidebar }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState(DEFAULT_IMAGE);
  const [breadcrumbsLabel, setBreadcrumbsLabel] = useState(null);

  // 🧩 Decodificar token
  const tokenUser = getTokenPayload(); // { id, name, role }

  useEffect(() => {
    if (!tokenUser?.id) return;

    const loadUser = async () => {
      try {
        const user = await getUserById(tokenUser.id);

        // 👉 Si backend retorna profileImage, úsala
        setUserImage(user.profileImage || DEFAULT_IMAGE);
        setUserName(user.name);
      } catch (error) {
        console.error("Error cargando usuario:", error);
      }
    };

    loadUser();
  }, []);

  // 🧭 Breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    let label =
      routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    return { href, label };
  });

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <HeroUINavbar
      className="flex items-center justify-between bg-white shadow px-4 py-3 md:px-6 w-full"
      maxWidth="full"
      position="sticky"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-700 hover:text-red-600"
        >
          <Menu size={22} />
        </button>

        <Breadcrumbs>
          {breadcrumbs.length ? (
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

      {/* 👤 Menú usuario */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-700 hidden sm:block">
          {userName || "Usuario"}
        </span>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="cursor-pointer transition-transform"
              size="sm"
              name={userName || "U"}
              src={userImage} // ← FOTO REAL DEL USUARIO
            />
          </DropdownTrigger>

          <DropdownMenu aria-label="Perfil" variant="flat">
            <DropdownItem
              key="perfil"
              onPress={() => router.push("/user/profile")}
            >
              Mi perfil
            </DropdownItem>
            <DropdownItem key="ajustes" isDisabled >Ajustes <em>(proximamente)</em></DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              onPress={handleLogout}
              startContent={<LogoutIcon size={18} />}
            >
              Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </HeroUINavbar>
  );
}
