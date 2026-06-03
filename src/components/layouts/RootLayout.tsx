import { Outlet } from "react-router-dom";
import { AppNavbar } from "@/components/shared/AppNavbar";
import { ToastStack } from "@/components/ui/ToastStack";

/** Main authenticated app layout with navbar */
export function RootLayout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AppNavbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <ToastStack />
    </div>
  );
}
