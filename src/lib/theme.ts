/** Centralized PlatJob Design Tokens */
export const COLORS = {
  brand: {
    blue: "#032C73",
    blueLight: "#0A4DB5",
    blueMuted: "#1A3A6B",
    orange: "#FF7A00",
    orangeLight: "#FF9A40",
    orangeDark: "#CC6200",
  },
  surface: {
    default: "#F5F7FA",
    card: "#FFFFFF",
    dark: "#0A1628",
    darkCard: "#0F1E36",
  },
  text: {
    primary: "#032C73",
    secondary: "#6B7280",
    muted: "#9CA3AF",
    inverse: "#FFFFFF",
  },
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
} as const;

export const HEROUI_THEME = {
  colors: {
    primary: {
      DEFAULT: COLORS.brand.blue,
      foreground: COLORS.text.inverse,
      50: "#E8EEF9",
      100: "#C5D4F0",
      200: "#9CB5E5",
      300: "#7296DA",
      400: "#4977CE",
      500: COLORS.brand.blue,
      600: "#02245E",
      700: "#011C49",
      800: "#011434",
      900: "#000C1F",
    },
    secondary: {
      DEFAULT: COLORS.brand.orange,
      foreground: COLORS.text.inverse,
      50: "#FFF3E8",
      100: "#FFE0C5",
      200: "#FFCC9C",
      300: "#FFB773",
      400: "#FFA84A",
      500: COLORS.brand.orange,
      600: "#CC6200",
      700: "#994A00",
      800: "#663100",
      900: "#331900",
    },
  },
} as const;
