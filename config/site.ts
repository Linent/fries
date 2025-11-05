export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Sistema de Extensión UFPS", // ✅ nombre del sitio
  description: "Plataforma de gestión de proyectos de extensión universitaria.", // ✅ descripción del sitio

  sidebarItems: [
    {
      label: "Inicio",
      icon: "Home",
      href: "/dashboard",
      roles: ["administrador", "fries", "formulador", "decano", "director"],
    },
    {
      label: "Proyectos de Extensión",
      href: "/extension",
      roles: ["administrador", "fries", "formulador", "decano", "director"],
    },
    {
      label: "Facultades",
      href: "/faculty",
      roles: ["administrador", "fries"],
    },
    {
      label: "Usuarios",
      icon: "Users",
      href: "/user",
      roles: ["administrador", "fries"],
    },
    {
      label: "Consultoría",
      href: "/consultoria",
      roles: ["administrador", "fries"],
    },
    {
      label: "Actividad / evento cultural",
      href: "/actividad-cultural",
      roles: ["administrador", "fries"],
    },
    {
      label: "Educación continua",
      href: "/educacion-continua",
      roles: ["administrador", "fries"],
    },
    {
      label: "Servicios",
      href: "/servicios",
      roles: ["administrador", "fries", "formulador"],
    },

    {
      label: "Entidades",
      href: "entidades",
      roles: ["administrador", "fries"],
    },
  ],
};
