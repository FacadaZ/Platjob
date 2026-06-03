import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { RootLayout } from "@/components/layouts/RootLayout";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { PageLoader } from "@/components/ui/PageLoader";

// ── Lazy Pages ────────────────────────────────────────────────
const HomePage = lazy(() => import("@/features/home/pages/HomePage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const TechniciansPage = lazy(() => import("@/features/technicians/pages/TechniciansPage"));
const TechnicianDetailPage = lazy(() => import("@/features/technicians/pages/TechnicianDetailPage"));
const ServicesPage = lazy(() => import("@/features/services/pages/ServicesPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));
const ProfileEditPage = lazy(() => import("@/features/profile/pages/ProfileEditPage"));
const ChatPage = lazy(() => import("@/features/chat/pages/ChatPage"));
const RequestsPage = lazy(() => import("@/features/requests/pages/RequestsPage"));
const ReviewsPage = lazy(() => import("@/features/reviews/pages/ReviewsPage"));
const AdminDashboardPage = lazy(() => import("@/features/admin/pages/AdminDashboardPage"));
const NotFoundPage = lazy(() => import("@/features/home/pages/NotFoundPage"));

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={ROUTES.HOME} replace />,
  },
  // ── Auth routes (no navbar) ────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: withSuspense(<LoginPage />),
      },
      {
        path: ROUTES.REGISTER,
        element: withSuspense(<RegisterPage />),
      },
    ],
  },
  // ── App layout wrapper (renders navbar) ───────────────────
  {
    element: <RootLayout />,
    children: [
      // Public routes accessible without login
      { path: ROUTES.HOME, element: withSuspense(<HomePage />) },
      { path: ROUTES.TECHNICIANS, element: withSuspense(<TechniciansPage />) },
      { path: "/technicians/:id", element: withSuspense(<TechnicianDetailPage />) },
      { path: ROUTES.SERVICES, element: withSuspense(<ServicesPage />) },

      // Protected routes that require login
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.DASHBOARD, element: withSuspense(<DashboardPage />) },
          { path: ROUTES.PROFILE, element: withSuspense(<ProfilePage />) },
          { path: ROUTES.PROFILE_EDIT, element: withSuspense(<ProfileEditPage />) },
          { path: ROUTES.CHAT, element: withSuspense(<ChatPage />) },
          { path: ROUTES.REQUESTS, element: withSuspense(<RequestsPage />) },
          { path: ROUTES.REVIEWS, element: withSuspense(<ReviewsPage />) },
        ],
      },
      // Admin routes (require admin role)
      {
        element: <AdminRoute />,
        children: [
          { path: ROUTES.ADMIN, element: withSuspense(<AdminDashboardPage />) },
        ],
      },
    ],
  },
  // ── 404 ────────────────────────────────────────────────────
  {
    path: "*",
    element: withSuspense(<NotFoundPage />),
  },
]);
