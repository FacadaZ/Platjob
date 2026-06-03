import { useAuthStore } from "@/store";
import { usePageTitle } from "@/hooks";
import { ClientDashboard } from "../components/ClientDashboard";
import { TechnicianDashboard } from "../components/TechnicianDashboard";
import { Card, CardContent } from "@/components/ui/HeroUICompat";
import { ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  usePageTitle("Mi Panel de Control");
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Card className="bg-white border border-gray-100 shadow-brand-sm p-8 text-center">
          <CardContent className="space-y-3">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="font-bold text-text-primary text-xl">Acceso Denegado</h2>
            <p className="text-text-secondary text-sm">
              Por favor, inicia sesión para acceder al panel de control de tu cuenta.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {user.role === "technician" ? (
        <TechnicianDashboard usuario={user} />
      ) : (
        <ClientDashboard usuario={user} />
      )}
    </div>
  );
}
