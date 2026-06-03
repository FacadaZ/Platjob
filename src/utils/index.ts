/** Format a number as currency (BOB by default) */
export const formatCurrency = (
  amount: number,
  currency = "BOB",
  locale = "es-BO"
): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

/** Format ISO date string to readable Spanish locale */
export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaults: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString("es-CO", options ?? defaults);
};

/** Format ISO date string to relative time (e.g. "hace 2 días") */
export const formatRelativeTime = (dateString: string): string => {
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const diff = (new Date(dateString).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diff) >= seconds) {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }
  return "justo ahora";
};

/** Simulate async network delay */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Clamp a number between min and max */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Truncate text with ellipsis */
export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;

/** Generate initials from a full name */
export const getInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/** Normalize text for search (remove accents, lowercase) */
export const normalizeSearch = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
