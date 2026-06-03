import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import { PageLoader } from "@/components/ui/PageLoader";

/** Redirects users who are not administrators to the home page */
export function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <PageLoader />;
  
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
