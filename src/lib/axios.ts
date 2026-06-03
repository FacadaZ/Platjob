import axios from "axios";

/**
 * Axios instance pre-configured for PlatJob API.
 * In mock mode all requests are intercepted by mock handlers.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://api.platjob.app/v1",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request Interceptor ──────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("platjob_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns a successful API wrapper, unwrap it globally for frontend services
    if (response.data && typeof response.data === "object" && response.data.success === true && "data" in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("platjob_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
