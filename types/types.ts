export interface IUser {
  _id?: string;
  codigo: string;
  tipo_documento:
    | "CC"
    | "TI"
    | "CE"
    | "PA"
    | "RC"
    | "PEP"
    | "NIT"
    | "CD"
    | "NUIP"
    | "DNI";
  dni: string;
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName?: string;
  celular: string;
  email: string;
  dateofBirth?: string;
  dateofExpedition?: string;
  placeofExpedition?: string;
  civilStatus?:
    | "soltero"
    | "casado"
    | "union libre"
    | "separado"
    | "divorciado"
    | "viudo";
  direction?: string;
  academic_program?: string;
  faculty?: string;
  grupo_investigacion?: string;
  institucion?: string;
  password: string;
  role:
    | "director_programa"
    | "decano"
    | "fries"
    | "vicerrectoria"
    | "docente"
    | "estudiante"
    | "formulador"
    | "administrador";
  enable?: boolean;
  createdAt?: string;
}
export interface Faculty {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

// Program types
export interface ProgramDirector {
  _id?: string;
  firstName?: string;
  firstLastName?: string;
  email?: string;
}

export interface Program {
  _id: string;
  code: string;
  name: string;
  faculty?: Faculty | { _id: string; name: string; code?: string } | null;
  director?: ProgramDirector | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramUpsertDTO {
  name: string;
  code: string;
  faculty: string; // faculty id
  director: string; // director id
  onSave?: (data: ProgramUpsertDTO) => void | Promise<void>;
}

export interface ProgramTableProps {
  programs: Program[];
  loading: boolean;
  onEdit: (id: string, data: ProgramUpsertDTO) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onCreate: (data: ProgramUpsertDTO) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
  onSave?: (programId: string, directorId: string) => void | Promise<void>;
}

export interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
  onSave: (data: ProgramUpsertDTO) => void | Promise<void>;
}

export type DirectorSummary = Pick<IUser, "_id" | "firstName" | "firstLastName" | "email">;

export interface AssignDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (programId: string, directorId: string) => void | Promise<void>;
  program: Program | null;
}
export interface UserDocente {
  tipo_documento: string;
  codigo: string;
  dni: string;
  firstName: string;
  secondName: string;
  firstLastName: string;
  secondLastName: string;
  academic_program: string;
  celular: string;
  email: string;
  dateofBirth: string;
  password: string;
  role: string;
}


export interface Department {
  departamento: string;
  ciudades: string[];
}

export const routeNames: Record<string, string> = {
  dashboard: "Estadísticas",
  extension: "Proyectos de Extensión",
  proyectos: "Proyectos Formulados",
  listar: "Lista de Proyectos",
  registrar: "Registrar Proyecto",
  "educacion-continua": "Educación Continua",
  "actividad-cultural": "Actividad Cultural",
  consultoria: "Consultoría",
  user: "Usuarios",
  profile: "Perfil",
  faculty: "Facultades",
  entidades: "Entidades",
  program: "Programas Académicos",
  servicios: "Servicios",
};
export const CHART_COLORS = [
  "#6366F1", // Indigo
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
];

// config/projectStatus.ts
export const projectStatusMap: Record<
  string,
  { label: string; color: string }
> = {
  en_formulacion: {
    label: "En formulación",
    color: "bg-blue-100 text-blue-800",
  },
  en_revision_director: {
    label: "En revisión por director",
    color: "bg-yellow-100 text-yellow-800",
  },
  en_revision_decano: {
    label: "En revisión por decano",
    color: "bg-yellow-100 text-yellow-800",
  },
  en_revision_fries: {
    label: "En revisión por FRIES",
    color: "bg-orange-100 text-orange-800",
  },
  aprobado: {
    label: "Aprobado",
    color: "bg-green-100 text-green-800",
  },
  rechazado: {
    label: "Rechazado",
    color: "bg-red-100 text-red-800",
  },
};

export interface ProjectPerson {
  firstName?: string;
  firstLastName?: string;
  email?: string;
}

export interface PopulationEntry {
  name?: string;
  numberOfPeople?: number;
}

export interface ProjectPopulations {
  ciclo_vital?: PopulationEntry[];
  condicion?: PopulationEntry[];
  grupo?: PopulationEntry[];
}

export interface ProjectResult {
  product?: string;
  indicator?: string;
}

export interface ProjectImpact {
  expectedImpact?: string;
  term?: string;
}

export interface ProjectEntityRef {
  entity?: {
    _id?: string;
    name?: string;
    typeEntity?: string;
  };
}

export interface ProjectDocument {
  name?: string;
  type?: string;
}

export interface Project {
  _id?: string;
  id?: string;
  code: string;
  title: string;
  status: string;
  description?: string;
  justification?: string;
  objectiveGeneral?: string;
  createdAt: string | Date;
  faculty?: {
    name?: string;
    code?: string;
    decano ?: { _id: string, firstName: string; firstLastName: string}
  } | null;
  createdBy?: { _id: string, firstName: string, firstLastName: string } | string;
  typeProject?: "Remunerado" | "Solidario" | string;
  year?: number | string;
  semester?: string | number;
  director?: ProjectPerson | null;
  coauthors?: ProjectPerson[];
  students?: ProjectPerson[];
  populations?: ProjectPopulations;
  results?: ProjectResult[];
  impacts?: ProjectImpact[];
  entity?: ProjectEntityRef[];
  documents?: ProjectDocument[];
  program?: {
    name?: string;
    code?: string;
    director?: { _id: string; firstName: string; firstLastName: string };
  } | null;
  totalValue?: number;
}

export interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  onCreate?: (project?: Project) => void;
}

export interface EntityDTO {
  _id?: string;
  name: string;
  nit: string;
  typeEntity:
    | "pública"
    | "privada"
    | "mixta"
    | "internacional"
    | "comunitaria"
    | "institucional";
  sector?:
    | "educación"
    | "salud"
    | "tecnología"
    | "cultural"
    | "ambiental"
    | "agropecuario"
    | "turismo"
    | "otro";
  representative?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export const DEFAULT_IMAGE= "https://res.cloudinary.com/dhaxrwwio/image/upload/v1747070979/Captura-de-pantalla-2025-05-12-122646_zrk4ft.webp";

export const tipoDocumentoOptions = [
  { label: "Cédula de ciudadanía", value: "CC" },
  { label: "Tarjeta de identidad", value: "TI" },
  { label: "Cédula de extranjería", value: "CE" },
  { label: "Pasaporte", value: "PA" },
  { label: "Registro civil de nacimiento", value: "RC" },
  { label: "Permiso especial de permanencia", value: "PEP" },
  {
    label: "Número de Identificación Tributaria (para personas jurídicas)",
    value: "NIT",
  },
  { label: "Carné diplomático", value: "CD" },
  { label: "Número único de identificación personal", value: "NUIP" },
  { label: "Documento nacional de identidad (otros países)", value: "DNI" },
];
export interface ProjectEntityDTO {
  _id?: string;
  project: string;
  entity: string | { _id: string; name: string; nit: string };
  aporteEspecie?: number;
  aporteEfectivo?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const poblacionCicloVital = [
  { label: "Primera Infancia (0-5 años)", value: "primera_infancia" },
  { label: "Niñez (6-11 años)", value: "ninez" },
  { label: "Jóvenes (12-26 años)", value: "jovenes" },
  { label: "Adultos (26-60 años)", value: "adultos" },
  { label: "Adultos Mayores (Mayores de 60 años)", value: "adultos_mayores" },
];

export const poblacionCondicion = [
  {
    label: "Vulnerabilidad social - Violencia intrafamiliar",
    value: "violencia_intrafamiliar",
  },
  {
    label: "Vulnerabilidad social - Violencia sexual",
    value: "violencia_sexual",
  },
  {
    label: "Vulnerabilidad social - Riesgo o abandono",
    value: "riesgo_abandono",
  },
  {
    label: "Vulnerabilidad social - Habitante de la calle",
    value: "habitante_calle",
  },
  {
    label: "Vulnerabilidad social - Mujeres cabeza de familia",
    value: "mujeres_cabeza_familia",
  },
  { label: "Vulnerabilidad económica - Desempleo", value: "desempleo" },
  {
    label: "Vulnerabilidad económica - Explotación laboral",
    value: "explotacion_laboral",
  },
  {
    label: "Vulnerabilidad económica - Tráfico de personas",
    value: "trafico_personas",
  },
  { label: "Vulnerabilidad económica - Prostitución", value: "prostitucion" },
  {
    label: "Necesidades educativas especiales - Discapacidad",
    value: "discapacidad",
  },
  {
    label: "Necesidades educativas especiales - Talentos excepcionales",
    value: "talentos_excepcionales",
  },
  {
    label: "Afectados por la violencia - Desplazamiento",
    value: "desplazamiento",
  },
  {
    label: "Afectados por la violencia - Reincorporación",
    value: "reincorporacion",
  },
  {
    label: "Afectados por la violencia - Desmovilización",
    value: "desmovilizacion",
  },
  { label: "Grupos Étnicos - Indígenas", value: "indigenas" },
  { label: "Grupos Étnicos - Afrocolombianos", value: "afrocolombianos" },
  { label: "Grupos Étnicos - Rrom o Gitano", value: "rrom" },
  { label: "Otro", value: "otro" },
];

export const poblacionGrupo = [
  { label: "Familia", value: "familia" },
  { label: "Géneros", value: "generos" },
  { label: "Profesionales", value: "profesionales" },
  { label: "Grupos étnicos", value: "grupos_etnicos" },
  { label: "Campesinos", value: "campesinos" },
  { label: "Mujeres", value: "mujeres" },
  { label: "Empleados", value: "empleados" },
  { label: "Comunidades", value: "comunidades" },
  { label: "Empresas, Mipymes", value: "mipymes" },
  { label: "Entidades gubernamentales", value: "gubernamentales" },
  { label: "Otro", value: "otro" },
];

export const statusFlow = [
  "en_formulacion",
  "en_revision_director",
  "en_revision_decano",
  "en_revision_fries",
  "en_revision_vicerrectoria",
  "aprobado",
  "rechazado",
];

