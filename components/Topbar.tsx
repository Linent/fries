// Topbar.tsx
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

export default function Topbar({
  toggleSidebar,
  headerTitle,
}: {
  toggleSidebar: () => void;
  headerTitle?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState(DEFAULT_IMAGE);

  const tokenUser = getTokenPayload();
  const roles: string[] = tokenUser?.roles ?? [];
  const isRestrictedUser =
    !roles.includes("fries") && !roles.includes("administrador");

  useEffect(() => {
    if (!tokenUser?.id) return;

    getUserById(tokenUser.id)
      .then((user) => {
        setUserImage(user.profileImage || DEFAULT_IMAGE);
        setUserName(user.name);
      })
      .catch(() => {});
  }, []);

  // Breadcrumbs normales, pero reemplazando el ID por headerTitle cuando existe
  const safePath = pathname ?? "";
  const segments = safePath.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");

    // Si estamos en /extension/[id] sustituimos por el título enviado desde el layout
    if (segments[0] === "extension" && index === 1 && headerTitle) {
      return { href, label: headerTitle };
    }

    return {
      href,
      label:
        routeNames[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1),
    };
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("userName");
    router.push("/");
  };

  return (
    <HeroUINavbar
      className="flex items-end justify-between bg-white shadow px-4 py-3 md:px-6 w-full"
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
          {breadcrumbs.map((bc) => {
            const isUserBreadcrumb = bc.href === "/user";
            const disabled = isUserBreadcrumb && isRestrictedUser;

            return (
              <BreadcrumbItem
                key={bc.href}
                href={disabled ? undefined : bc.href}
                className={
                  disabled
                    ? "text-gray-400 cursor-not-allowed pointer-events-none"
                    : ""
                }
              >
                {bc.label}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumbs>
      </div>

      {/* 👤 Menú usuario */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-700 hidden sm:block">
          {userName}
        </span>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              className="cursor-pointer"
              size="sm"
              src={userImage}
            />
          </DropdownTrigger>

          <DropdownMenu variant="flat">
            <DropdownItem
              key="perfil"
              onPress={() => router.push("/user/profile")}
            >
              Mi perfil
            </DropdownItem>

            <DropdownItem
              key="logout"
              color="danger"
              startContent={<LogoutIcon size={18} />}
              onPress={handleLogout}
            >
              Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </HeroUINavbar>
  );
}
