import { apiClient } from "@/lib/axios";
import type { Technician, TechnicianFilters, PortfolioItem } from "@/types";

export const mapearTecnicoAlFrontend = (tecnico: any): Technician => {
  if (!tecnico) return null as any;

  // Soporta estructura Lista (User con technicianProfile) o Detalles (Profile con user)
  const profile = tecnico.technicianProfile || tecnico;
  const user = tecnico.technicianProfile ? tecnico : tecnico.user;

  const nombre = user?.name || profile.name || "Técnico";
  return {
    id: profile.id || tecnico.id,
    userId: profile.userId || user?.id || "",
    name: nombre,
    avatar:
      user?.avatar ||
      user?.avatarUrl ||
      profile.avatar ||
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${nombre}`,
    category: profile.categoryKey || (typeof profile.category === 'object' ? profile.category?.key : profile.category) || "electrician",
    categoryLabel: profile.category?.label || (typeof profile.category === 'object' ? profile.category?.label : undefined),
    specialties: profile.specialties || [],
    bio: profile.bio || "",
    rating: profile.rating !== undefined && profile.rating !== null ? Number(profile.rating) : 0.0,
    reviewCount:
      profile.reviewCount !== undefined
        ? profile.reviewCount
        : profile.reviews?.length || 0,
    jobsCompleted: profile.jobsCompleted || 0,
    hourlyRate: Number(profile.hourlyRate) || 0,
    location: user?.location || profile.location || "Bolivia, Bol",
    isAvailable: profile.isAvailable !== undefined ? profile.isAvailable : true,
    isVerified: profile.isVerified !== undefined ? profile.isVerified : true,
    responseTime: profile.responseTime || "~15 min",
    joinedAt: profile.joinedAt || user?.createdAt || new Date().toISOString(),
    portfolio: (profile.portfolioItems || profile.portfolio || []).map((p: any) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      title: p.title,
      description: p.description,
    })),
  };
};

export const technicianService = {
  /** Obtener categorías profesionales dinámicas desde el Backend */
  async getCategories(): Promise<{ key: string; label: string; icon: string }[]> {
    try {
      const respuesta = await apiClient.get<any>("/technicians/categories");
      return (Array.isArray(respuesta.data) ? respuesta.data : respuesta.data?.data) || [];
    } catch (error) {
      console.error("Error en technicianService.getCategories:", error);
      return [];
    }
  },

  /** Obtener lista de técnicos paginada y filtrada */
  async getAll(filtros?: TechnicianFilters): Promise<Technician[]> {
    try {
      const parametros: any = {};
      if (filtros?.query) parametros.query = filtros.query;
      if (filtros?.category) parametros.category = filtros.category;
      if (filtros?.isAvailable !== undefined)
        parametros.isAvailable = filtros.isAvailable;

      const respuesta = await apiClient.get<any[]>("/technicians", {
        params: parametros,
      });
      return respuesta.data.map(mapearTecnicoAlFrontend);
    } catch (error) {
      console.error("Error en technicianService.getAll:", error);
      return [];
    }
  },

  /** Obtener un solo técnico por ID */
  async getById(id: string): Promise<Technician | undefined> {
    try {
      const respuesta = await apiClient.get(`/technicians/${id}`);
      return mapearTecnicoAlFrontend(respuesta.data);
    } catch (error) {
      console.error(`Error en technicianService.getById(${id}):`, error);
      return undefined;
    }
  },

  /** Obtener perfil técnico propio */
  async getOwnProfile(): Promise<Technician | undefined> {
    try {
      const respuesta = await apiClient.get("/technicians/profile/me");
      return mapearTecnicoAlFrontend(respuesta.data);
    } catch (error) {
      console.error("Error en technicianService.getOwnProfile:", error);
      return undefined;
    }
  },

  /** Actualizar perfil técnico propio */
  async updateOwnProfile(datos: Partial<Technician>): Promise<Technician> {
    const respuesta = await apiClient.put("/technicians/profile/me", datos);
    return mapearTecnicoAlFrontend(respuesta.data);
  },

  /** Agregar elemento al portafolio */
  async addPortfolioItem(datos: {
    imageUrl: string;
    title: string;
    description?: string;
  }): Promise<PortfolioItem> {
    const respuesta = await apiClient.post("/technicians/portfolio", datos);
    return respuesta.data;
  },

  /** Eliminar elemento del portafolio */
  async deletePortfolioItem(id: string): Promise<void> {
    await apiClient.delete(`/technicians/portfolio/${id}`);
  },
};
