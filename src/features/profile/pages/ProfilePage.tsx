import { Avatar, Button, Card, CardContent, Separator } from "@/components/ui/HeroUICompat";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Edit, MapPin, Phone, Mail, Calendar, TrendingUp, Star, ClipboardList, Shield, Share2, Briefcase } from "lucide-react";
import { useAuthStore } from "@/store";
import { usePageTitle } from "@/hooks";
import { ROUTES } from "@/constants";
import { formatDate } from "@/utils";
import { useState, useEffect } from "react";
import { requestService, technicianService } from "@/services";

export default function ProfilePage() {
  usePageTitle("Mi Perfil");
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [requestsCount, setRequestsCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [rating, setRating] = useState("0.0");
  const [isVerified, setIsVerified] = useState("Sí");
  const [loading, setLoading] = useState(true);
  const [techCategory, setTechCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    const requestsPromise = requestService.getByClientId(user.id)
      .then((list) => {
        setRequestsCount(list.length);
        setCompletedCount(list.filter((r) => r.status === "completed").length);
      })
      .catch((err) => console.error("Error al cargar solicitudes:", err));

    const techPromise = user.role === "technician"
      ? technicianService.getOwnProfile()
        .then((profile) => {
          if (profile) {
            setRating(profile.rating !== undefined && profile.rating !== null ? profile.rating.toFixed(1) : "0.0");
            setIsVerified(profile.isVerified ? "Sí" : "No");
            setTechCategory(profile.categoryLabel || profile.category || null);
          }
        })
        .catch((err) => console.error("Error al cargar perfil técnico:", err))
      : Promise.resolve();

    // Para clientes: el sistema actual no soporta calificaciones de técnico a cliente,
    // así que mostramos "Sin reseñas" directamente.
    const clientRatingPromise = user.role === "client"
      ? Promise.resolve().then(() => setRating("Sin reseñas"))
      : Promise.resolve();

    Promise.all([requestsPromise, techPromise, clientRatingPromise])
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-text-primary self-start sm:self-auto">Mi Perfil</h1>
        <div className="flex flex-row w-full sm:w-auto gap-3">
          <Button
            onPress={() => navigate(ROUTES.PROFILE_EDIT)}
            className="flex-1 sm:flex-none bg-brand-gradient text-white font-bold h-11 px-4 sm:px-6 rounded-xl shadow-brand hover:shadow-brand-lg transition-all"
            startContent={<Edit className="w-4 h-4" />}
          >
            Editar Perfil
          </Button>
          <Button
            variant="flat"
            className="flex-1 sm:flex-none bg-gray-100 text-text-primary font-bold h-11 px-4 sm:px-6 rounded-xl hover:bg-gray-200 transition-all"
            startContent={<Share2 className="w-4 h-4" />}
          >
            Compartir
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white border border-gray-100 shadow-brand-sm overflow-hidden">
          <div className="h-24 bg-hero-gradient" />
          <CardContent className="pt-0 px-8 pb-8">
            <div className="-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 relative z-10 px-4">
              <div className="relative group">
                <Avatar
                  src={user?.avatar}
                  name={user?.name}
                  className="w-32 h-32 ring-8 ring-white shadow-brand-xl"
                />
                <div className="absolute inset-0 rounded-full ring-1 ring-black/5" />
              </div>
              <div className="pb-2 flex flex-col items-center sm:items-start text-center sm:text-left mt-4 sm:mt-0">
                <h2 className="text-3xl font-black text-text-primary tracking-tight leading-tight mb-2">{user?.name}</h2>
                <span className="text-xs text-white bg-brand-blue/90 px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                  {user?.role === "client" ? "Cliente" : user?.role === "admin" ? "Admin" : "Técnico"}
                </span>
                {user?.role === "technician" && techCategory && (
                  <span className="flex items-center gap-1.5 text-xs text-white/80 font-medium mt-1 drop-shadow-sm">
                    <Briefcase className="w-3.5 h-3.5" />
                    {techCategory}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-text-secondary">
              {user?.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-text-muted" />{user.email}</div>}
              {user?.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-text-muted" />{user.phone}</div>}
              {user?.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-text-muted" />{user.location}</div>}
              {user?.createdAt && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-text-muted" />Desde {formatDate(user.createdAt)}</div>}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Solicitudes", value: loading ? "..." : String(requestsCount), icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
          { label: "Completadas", value: loading ? "..." : String(completedCount), icon: TrendingUp, color: "bg-green-50 text-green-600" },
          { label: "Calificación", value: loading ? "..." : rating, icon: Star, color: "bg-amber-50 text-amber-600" },
          { label: "Verificado", value: user?.role === "technician" ? (loading ? "..." : isVerified) : "Sí", icon: Shield, color: "bg-purple-50 text-purple-600" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="bg-white border border-gray-100 shadow-brand-sm hover:shadow-brand hover:-translate-y-1 transition-all">
              <CardContent className="p-5 text-center">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-text-primary">{value}</p>
                <p className="text-xs text-text-secondary mt-0.5">{label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-white border border-gray-100 shadow-brand-sm">
        <CardContent className="p-6">
          <h3 className="font-bold text-text-primary mb-3">Acceso rápido</h3>
          {[
            { label: "Mis solicitudes", href: ROUTES.REQUESTS, icon: ClipboardList },
            { label: "Mis reseñas", href: ROUTES.REVIEWS, icon: Star },
            { label: "Mensajes", href: ROUTES.CHAT, icon: Mail },
          ].map(({ label, href, icon: Icon }) => (
            <div key={href}>
              <Link to={href} className="flex items-center justify-between py-3 text-sm font-medium text-text-primary hover:text-brand-orange transition-colors group">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-text-muted group-hover:text-brand-orange transition-colors" />
                  {label}
                </div>
                <span className="text-text-muted group-hover:text-brand-orange">→</span>
              </Link>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
