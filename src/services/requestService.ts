import { apiClient } from "@/lib/axios";
import type { ServiceRequest, Review, RequestStatus } from "@/types";

const mapStatusToFrontend = (status: string): RequestStatus => {
  if (status === "PENDING" || status === "pending") return "pending";
  if (status === "ACCEPTED" || status === "accepted") return "accepted";
  if (status === "IN_PROGRESS" || status === "in_progress") return "in_progress";
  if (status === "COMPLETED" || status === "completed") return "completed";
  if (status === "CANCELLED" || status === "cancelled") return "cancelled";
  return status ? (status.toLowerCase() as RequestStatus) : "pending";
};

const mapStatusToBackend = (status: string): string => {
  if (status === "in_progress") return "IN_PROGRESS";
  return status.toUpperCase();
};

const mapRequestToFrontend = (req: any): ServiceRequest => {
  const techName = req.technicianName || req.technician?.name || req.technician?.user?.name || "Técnico";
  return {
    id: req.id,
    clientId: req.clientId || req.client?.id || "",
    technicianId: req.technicianId || req.technician?.id || "",
    technicianName: techName,
    technicianAvatar: req.technicianAvatar || req.technician?.avatar || req.technician?.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${techName}`,
    category: req.category || "",
    title: req.title || "",
    description: req.description || "",
    status: mapStatusToFrontend(req.status),
    scheduledDate: req.scheduledDate,
    completedDate: req.completedDate,
    address: req.address || "",
    budget: req.budget ? Number(req.budget) : undefined,
    agreedRate: req.agreedRate ? Number(req.agreedRate) : undefined,
    createdAt: req.createdAt || new Date().toISOString(),
    updatedAt: req.updatedAt || new Date().toISOString(),
  };
};

const mapReviewToFrontend = (rev: any): Review => {
  const cName = rev.clientName || rev.client?.name || rev.user?.name || "Cliente";
  return {
    id: rev.id,
    requestId: rev.requestId || "",
    clientId: rev.clientId || rev.client?.id || rev.userId || "",
    clientName: cName,
    clientAvatar: rev.clientAvatar || rev.client?.avatar || rev.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cName}`,
    technicianId: rev.technicianId || "",
    rating: Number(rev.rating) || 5,
    comment: rev.comment || "",
    createdAt: rev.createdAt || new Date().toISOString(),
  };
};

export const requestService = {
  async getByClientId(clientId: string): Promise<ServiceRequest[]> {
    try {
      void clientId; // Use authentic JWT filter instead of client query
      const response = await apiClient.get<any[]>("/service-requests");
      return response.data.map(mapRequestToFrontend);
    } catch (error) {
      console.error("Error in requestService.getByClientId:", error);
      return [];
    }
  },

  async getById(id: string): Promise<ServiceRequest | undefined> {
    try {
      const response = await apiClient.get(`/service-requests/${id}`);
      return mapRequestToFrontend(response.data);
    } catch (error) {
      console.error(`Error in requestService.getById(${id}):`, error);
      return undefined;
    }
  },

  async createRequest(payload: {
    technicianId: string;
    category: string;
    title: string;
    description: string;
    address: string;
    budget?: number;
    scheduledDate?: string;
  }): Promise<ServiceRequest> {
    const response = await apiClient.post("/service-requests", payload);
    return mapRequestToFrontend(response.data);
  },

  async updateStatus(id: string, status: RequestStatus, agreedRate?: number): Promise<ServiceRequest> {
    const response = await apiClient.patch(`/service-requests/${id}/status`, {
      status: mapStatusToBackend(status),
      agreedRate,
    });
    return mapRequestToFrontend(response.data);
  },
};

export const reviewService = {
  async getByTechnicianId(technicianId: string): Promise<Review[]> {
    try {
      const response = await apiClient.get<any[]>(`/reviews/technician/${technicianId}`);
      return response.data.map(mapReviewToFrontend);
    } catch (error) {
      console.error(`Error in reviewService.getByTechnicianId(${technicianId}):`, error);
      return [];
    }
  },

  async getByClientId(clientId: string): Promise<Review[]> {
    try {
      // If backend has no direct GET /reviews/client/{clientId}, we can return empty or filter if we get all.
      // But according to platjob_backend.md, we can write reviews or get them per technician.
      // Let's call /reviews/technician/{id} if needed, or query if available.
      // Since it's only for "My Reviews", let's return a simulated or empty array if not directly supported,
      // or assume we get requests and find reviews. Let's try GET /reviews if it exists, otherwise return empty array.
      const response = await apiClient.get<any[]>("/reviews").catch(() => ({ data: [] }));
      return response.data.filter((r: any) => r.clientId === clientId).map(mapReviewToFrontend);
    } catch (error) {
      console.error("Error in reviewService.getByClientId:", error);
      return [];
    }
  },

  async createReview(payload: { requestId: string; rating: number; comment: string }): Promise<Review> {
    const response = await apiClient.post("/reviews", payload);
    return mapReviewToFrontend(response.data);
  },
};

