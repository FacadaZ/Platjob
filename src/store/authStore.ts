import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthState, LoginCredentials, RegisterPayload, UserRole } from "@/types";
import { STORAGE_KEYS } from "@/constants";
import { apiClient } from "@/lib/axios";

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const mapRoleToFrontend = (backendRole: string): UserRole => {
  if (backendRole === "CLIENT" || backendRole === "client") return "client";
  if (backendRole === "TECHNICIAN" || backendRole === "technician") return "technician";
  return backendRole ? (backendRole.toLowerCase() as UserRole) : "client";
};

const mapUserToFrontend = (user: any): User => {
  if (!user) return null as any;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`,
    role: mapRoleToFrontend(user.role),
    phone: user.phone,
    location: user.location,
    createdAt: user.createdAt,
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (isLoading) => set({ isLoading }),

      login: async ({ email, password }: LoginCredentials) => {
        set({ isLoading: true });
        try {
          // 1. Post to login
          const response = await apiClient.post<{ token: string; user?: any }>("/auth/login", {
            email,
            password,
          });
          const token = response.data.token;
          
          // Store token in localStorage immediately so subsequent requests automatically include it
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);

          // 2. Fetch authenticated user profile using token
          const meResponse = await apiClient.get("/auth/me");
          const frontendUser = mapUserToFrontend(meResponse.data);

          set({
            user: frontendUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          throw new Error(error.response?.data?.message || "Credenciales inválidas");
        }
      },

      register: async (payload: RegisterPayload) => {
        set({ isLoading: true });
        try {
          // Convert role to uppercase as expected by backend ("CLIENT" or "TECHNICIAN")
          const backendPayload: any = {
            ...payload,
            role: payload.role.toUpperCase(),
          };

          if (payload.role === "technician") {
            backendPayload.category = "General";
            backendPayload.hourlyRate = 0;
          }

          // 1. Post registration
          const response = await apiClient.post<{ token: string; user?: any }>("/auth/register", backendPayload);
          const token = response.data.token;

          // Store token in localStorage
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);

          // 2. Fetch authenticated user profile
          const meResponse = await apiClient.get("/auth/me");
          const frontendUser = mapUserToFrontend(meResponse.data);

          set({
            user: frontendUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          throw new Error(error.response?.data?.message || "Error en el registro");
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
