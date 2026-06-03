export type ServiceCategory =
  | "electrician"
  | "plumber"
  | "carpenter"
  | "mason"
  | "painter"
  | "locksmith"
  | "hvac"
  | "cleaner"
  | "gardener"
  | "welder";

export interface Technician {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  category: ServiceCategory;
  categoryLabel?: string;
  specialties: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  hourlyRate: number;
  location: string;
  isAvailable: boolean;
  isVerified: boolean;
  responseTime: string; // e.g. "~15 min"
  joinedAt: string;
  portfolio?: PortfolioItem[];
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
}

export interface TechnicianFilters {
  category?: ServiceCategory | "";
  location?: string;
  minRating?: number;
  maxRate?: number;
  isAvailable?: boolean;
  query?: string;
}
