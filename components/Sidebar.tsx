"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { siteConfig } from "@/config/site";
import { getTokenPayload } from "@/utils/auth";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type SidebarSubItem = {
  label: string;
  href: string;
  roles: string[];
};

type SidebarItem = {
  label: string;
  icon?: string;
  href?: string;
  roles: string[];
  subItems?: SidebarSubItem[];
};

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const router = useRouter();

  // 📦 Obtener rol del usuario
  useEffect(() => {
    const tokenData = getTokenPayload();
    if (tokenData?.role) setUserRole(tokenData.role);
  }, []);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const visibleItems: SidebarItem[] = siteConfig.sidebarItems.filter(
    (item: SidebarItem) => !userRole || item.roles.includes(userRole)
  );

  return (
    <>
      {/* Sidebar con transición */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-red-600 to-red-700 text-white flex flex-col z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div
          className="px-6 py-4 font-bold text-lg border-b border-red-500 cursor-pointer"
          onClick={() => {
            router.push("/dashboard");
            setIsOpen(false);
          }}
        >
          Siprex
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="mt-4 space-y-2">
            {visibleItems.map((item) => {
              const Icon =
                (Icons as Record<string, any>)[item.icon || "FileText"] ||
                Icons.FileText;

              if (item.subItems && item.subItems.length > 0) {
                const visibleSubItems = item.subItems.filter(
                  (sub) => !userRole || sub.roles.includes(userRole)
                );
                if (visibleSubItems.length === 0) return null;

                return (
                  <li key={item.label}>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className="flex justify-between w-full px-4 py-2 hover:bg-red-500"
                    >
                      <span className="flex items-center">
                        <Icon className="w-5 h-5 mr-2" />
                        {item.label}
                      </span>
                      {openMenu === item.label ? (
                        <Icons.ChevronDown />
                      ) : (
                        <Icons.ChevronRight />
                      )}
                    </button>

                    {openMenu === item.label && (
                      <ul className="ml-6 mt-2 space-y-1">
                        {visibleSubItems.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              className="block px-4 py-1 hover:bg-red-500 rounded transition-all"
                              onClick={() => setIsOpen(false)}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <Link
                    href={item.href || "#"}
                    className="flex items-center px-4 py-2 hover:bg-red-500 rounded transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
