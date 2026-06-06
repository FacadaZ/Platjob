import { apiClient } from "@/lib/axios";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "CLIENT" | "TECHNICIAN" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: number;
  key: string;
  label: string;
  createdAt?: string;
}

export const adminService = {
  /** Obtener listado de todos los usuarios registrados */
  async listUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUser[]>("/admin/users");
    return response.data;
  },

  /** Bloquear o reactivar la cuenta de un usuario */
  async toggleUserBlock(id: number, status: "ACTIVE" | "BLOCKED", suspensionReason?: string, suspendedUntil?: string): Promise<AdminUser> {
    const payload: any = { status };
    if (status === "BLOCKED") {
      payload.suspensionReason = suspensionReason;
      payload.suspendedUntil = suspendedUntil;
    }
    const response = await apiClient.patch<AdminUser>(`/admin/users/${id}/block`, payload);
    return response.data;
  },

  /** Crear una nueva categoría profesional */
  async createCategory(key: string, label: string): Promise<AdminCategory> {
    const response = await apiClient.post<AdminCategory>("/admin/categories", { key, label });
    return response.data;
  },

  /** Eliminar una categoría existente */
  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  /** Actualizar una categoría existente */
  async updateCategory(id: number, key: string, label: string): Promise<AdminCategory> {
    const response = await apiClient.put<AdminCategory>(`/admin/categories/${id}`, { key, label });
    return response.data;
  },
};
