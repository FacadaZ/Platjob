import type { ServiceCategory } from "@/types";

export const APP_NAME = "PlatJob";
export const APP_TAGLINE = "Tu plataforma de técnicos de confianza";

export const STORAGE_KEYS = {
  TOKEN: "platjob_token",
  USER: "platjob_user",
  THEME: "platjob_theme",
} as const;

export const ROUTES = {
  HOME: "/home",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  TECHNICIANS: "/technicians",
  TECHNICIAN_DETAIL: (id: string) => `/technicians/${id}`,
  SERVICES: "/services",
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  CHAT: "/chat",
  REQUESTS: "/requests",
  REVIEWS: "/reviews",
  NOT_FOUND: "/not-found",
  ADMIN: "/admin",
} as const;

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  electrician: "Electricista",
  plumber: "Plomero",
  carpenter: "Carpintero",
  mason: "Albañil",
  painter: "Pintor",
  locksmith: "Cerrajero",
  hvac: "Climatización",
  cleaner: "Limpieza",
  gardener: "Jardinero",
  welder: "Soldador",
};

export const CATEGORY_ICONS: Record<ServiceCategory, string> = {
  electrician: "⚡",
  plumber: "🔧",
  carpenter: "🪚",
  mason: "🧱",
  painter: "🎨",
  locksmith: "🔑",
  hvac: "❄️",
  cleaner: "🧹",
  gardener: "🌿",
  welder: "🔥",
};

export const REQUEST_STATUS_LABELS = {
  pending: "Pendiente",
  accepted: "Aceptado",
  in_progress: "En Proceso",
  completed: "Finalizado",
  cancelled: "Cancelado",
} as const;

export const REQUEST_STATUS_COLORS = {
  pending: "warning",
  accepted: "primary",
  in_progress: "secondary",
  completed: "success",
  cancelled: "danger",
} as const;

export const PAGINATION_PAGE_SIZE = 12;

export const MOCK_DELAY_MS = 600;
