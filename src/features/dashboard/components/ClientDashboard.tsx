import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, CardContent, Chip, Separator } from "@/components/ui/HeroUICompat";
import { motion } from "framer-motion";
import {
  ClipboardList, TrendingUp, Star, Shield, MapPin,
  ArrowRight, Search, MessageSquare, DollarSign, Calendar, Clock,
  ShieldCheck, ShieldAlert
} from "lucide-react";
import { requestService, technicianService, reviewService, chatService } from "@/services";
import { StarRating } from "@/components/ui/StarRating";
import { formatCurrency, formatDate } from "@/utils";
import { useUIStore } from "@/store";
import type { User, ServiceRequest, Technician } from "@/types";

interface PropsPanelCliente {
  usuario: User;
}

export function ClientDashboard({ usuario }: PropsPanelCliente) {
  const navegar = useNavigate();
  const [pestanaActiva, setPestanaActiva] = useState<"all" | "active" | "completed">("all");
  const [solicitudesCliente, setSolicitudesCliente] = useState<ServiceRequest[]>([]);
  const [tecnicosRecomendados, setTecnicosRecomendados] = useState<Technician[]>([]);
  const { addToast } = useUIStore();

  const [calificandoRequestId, setCalificandoRequestId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [comentario, setComentario] = useState("");
  const [reseñasEnviadas, setReseñasEnviadas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!usuario.id) return;
    Promise.all([
      requestService.getByClientId(usuario.id),
      technicianService.getAll(),
      reviewService.getByClientId(usuario.id)
    ])
      .then(([listaSolicitudes, listaTecnicos, listaResenas]) => {
        const misSolicitudes = listaSolicitudes.filter((req) => req.clientId === usuario.id);
        setSolicitudesCliente(misSolicitudes);
        setTecnicosRecomendados(
          listaTecnicos.filter((t) => t.isVerified && t.rating >= 4.5).slice(0, 4)
        );
        
        const resenasMapa: Record<string, boolean> = {};
        listaResenas.forEach(r => {
          resenasMapa[r.requestId] = true;
        });
        setReseñasEnviadas(resenasMapa);
      })
      .catch((err) => {
        console.error("Error loading ClientDashboard data:", err);
      });
  }, [usuario.id]);

  // Calculate client metrics
  const conteoActivos = solicitudesCliente.filter(
    (r) => r.status === "pending" || r.status === "accepted" || r.status === "in_progress"
  ).length;

  const conteoCompletados = solicitudesCliente.filter((r) => r.status === "completed").length;

  const totalGastado = solicitudesCliente
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + (r.agreedRate || 0), 0);

  const solicitudesFiltradas = solicitudesCliente.filter((r) => {
    if (pestanaActiva === "active") {
      return r.status === "pending" || r.status === "accepted" || r.status === "in_progress";
    }
    if (pestanaActiva === "completed") {
      return r.status === "completed";
    }
    return true;
  });

  const coloresEstado = {
    pending: "warning",
    accepted: "primary",
    in_progress: "secondary",
    completed: "success",
    cancelled: "default",
  } as const;

  const etiquetasEstado = {
    pending: "Pendiente",
    accepted: "Aceptado",
    in_progress: "En Proceso",
    completed: "Finalizado",
    cancelled: "Cancelado",
  } as const;

  const handleCalificar = async (reqId: string) => {
    try {
      await reviewService.createReview({ requestId: reqId, rating: ratingValue, comment: comentario });
      addToast({ type: "success", title: "Reseña enviada", message: "¡Gracias por calificar al técnico!" });
      setCalificandoRequestId(null);
      setReseñasEnviadas(prev => ({ ...prev, [reqId]: true }));
    } catch (error) {
      addToast({ type: "error", title: "Error", message: "No se pudo enviar la calificación." });
    }
  };

  const handleOpenChat = async (technicianId: string, reqId: string | number) => {
    try {
      const conv = await chatService.startConversation(technicianId, reqId);
      navegar("/chat", { state: { activeConversationId: conv.id } });
    } catch (error) {
      addToast({ type: "error", title: "Error", message: "No se pudo iniciar el chat." });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-brand-gradient text-white rounded-3xl p-8 overflow-hidden shadow-brand-lg"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Panel de Cliente
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              ¡Hola, {usuario.name}!
            </h1>
            <p className="text-white/85 text-sm max-w-xl">
              Bienvenido de nuevo a PlatJob. Gestiona tus contrataciones vigentes, revisa historiales de trabajo o encuentra al próximo técnico calificado.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/technicians">
              <Button
                className="bg-white text-brand-purple font-black h-12 px-6 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-sm shadow-brand"
              >
                <Search className="w-4 h-4" /> Buscar Técnicos
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Servicios Activos", value: conteoActivos, icon: Clock, color: "bg-blue-50 text-blue-600 border-blue-100" },
          { label: "Servicios Finalizados", value: conteoCompletados, icon: ClipboardList, color: "bg-green-50 text-green-600 border-green-100" },
          { label: "Total Invertido", value: formatCurrency(totalGastado || 0), icon: DollarSign, color: "bg-amber-50 text-amber-600 border-amber-100" },
          { label: "Técnicos Contratados", value: solicitudesCliente.length, icon: TrendingUp, color: "bg-purple-50 text-purple-600 border-purple-100" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`bg-white border ${color.split(" ")[2]} shadow-brand-sm hover:shadow-brand hover:-translate-y-0.5 transition-all`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${color.split(" ").slice(0, 2).join(" ")} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-text-primary">{value}</p>
                  <p className="text-xs text-text-secondary font-medium">{label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Panel: Requests History ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-text-primary flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-brand-purple" /> Mis Solicitudes de Servicio
            </h2>

            {/* Custom Tab Filter */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold gap-1">
              {[
                { key: "all", label: "Todos" },
                { key: "active", label: "Activos" },
                { key: "completed", label: "Finalizados" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPestanaActiva(key as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${pestanaActiva === key
                    ? "bg-white text-brand-purple shadow-brand-sm"
                    : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {solicitudesFiltradas.length === 0 ? (
              <Card className="bg-white border border-gray-100 shadow-brand-sm py-12 text-center">
                <CardContent className="space-y-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-text-muted">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-text-primary text-base">Sin solicitudes en esta categoría</h3>
                  <p className="text-text-secondary text-sm max-w-sm mx-auto">
                    ¿Necesitas reparar algo en casa? Encuentra a un especialista verificado hoy mismo.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Link to="/technicians">
                      <Button className="bg-brand-purple text-white font-bold rounded-xl px-8 h-11 shadow-brand hover:shadow-brand-lg transition-all">
                        Explorar técnicos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              solicitudesFiltradas.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="bg-white border border-gray-100 shadow-brand-sm hover:shadow-brand transition-all">
                    <CardContent className="p-6 space-y-4">
                      {/* Top Row: Tech Profile & Status */}
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={req.technicianAvatar}
                            name={req.technicianName}
                            size="md"
                            className="ring-2 ring-brand-purple/10 flex-shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-text-primary hover:text-brand-purple transition-colors">
                              <Link to={`/technicians/${req.technicianId}`}>{req.technicianName}</Link>
                            </h4>
                            <p className="text-xs text-brand-orange font-semibold">{req.category}</p>
                          </div>
                        </div>
                        <Chip
                          color={coloresEstado[req.status as keyof typeof coloresEstado]}
                          variant="flat"
                          size="sm"
                          className="font-bold"
                        >
                          {etiquetasEstado[req.status as keyof typeof etiquetasEstado]}
                        </Chip>
                      </div>

                      <Separator className="opacity-50" />

                      {/* Middle Content */}
                      <div>
                        <h5 className="font-bold text-sm text-text-primary">{req.title}</h5>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">{req.description}</p>
                      </div>

                      {/* Bottom row: Meta & Actions */}
                      <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                        <div className="flex items-center gap-4 text-xs text-text-secondary font-medium">
                          {req.scheduledDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-text-muted" />
                              <span>{formatDate(req.scheduledDate)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-text-muted" />
                            <span>Tarifa acordada: <strong className="text-brand-purple">{formatCurrency(req.agreedRate || req.budget || 0)}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            className="bg-brand-purple/10 text-brand-purple font-bold h-9 px-4 rounded-lg hover:bg-brand-purple/20 transition-all flex items-center gap-2 text-xs"
                            onPress={() => handleOpenChat(req.technicianId, req.id)}
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Mensaje
                          </Button>
                          {req.status === "completed" && !reseñasEnviadas[req.id] && (
                            calificandoRequestId === req.id ? (
                              <div className="absolute right-6 bottom-6 bg-white border border-gray-200 shadow-brand-lg p-4 rounded-xl z-10 w-72 animate-in fade-in slide-in-from-bottom-2">
                                <span className="text-sm font-bold text-text-primary block mb-2">Calificar a {req.technicianName}</span>
                                <div className="flex items-center gap-1 mb-3">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={`w-6 h-6 cursor-pointer transition-colors ${ratingValue >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-200'}`}
                                      onClick={() => setRatingValue(star)}
                                    />
                                  ))}
                                </div>
                                <textarea
                                  className="w-full text-sm p-3 rounded-lg border border-gray-200 resize-none outline-none focus:border-brand-purple bg-gray-50 focus:bg-white transition-colors"
                                  rows={2}
                                  placeholder="Escribe tu opinión..."
                                  value={comentario}
                                  onChange={(e) => setComentario(e.target.value)}
                                />
                                <div className="flex items-center justify-end gap-2 mt-3">
                                  <Button size="sm" variant="flat" onPress={() => setCalificandoRequestId(null)} className="h-8 font-bold text-xs bg-gray-100 rounded-lg">Cancelar</Button>
                                  <Button size="sm" color="primary" onPress={() => handleCalificar(req.id)} className="h-8 font-bold text-xs bg-amber-500 text-white hover:bg-amber-600 rounded-lg">Enviar</Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-amber-500 text-white font-bold h-9 px-4 rounded-lg hover:bg-amber-600 transition-all flex items-center gap-1.5 text-xs shadow-brand-sm"
                                onPress={() => {
                                  setCalificandoRequestId(req.id);
                                  setRatingValue(5);
                                  setComentario("");
                                }}
                              >
                                <Star className="w-3.5 h-3.5 fill-current" /> Calificar
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* ── Sidebar: Recommendations & Stats ── */}
        <div className="space-y-6">
          {/* Quick Stats Summary Card */}
          <Card className="bg-white border border-gray-100 shadow-brand-sm p-6 space-y-4">
            <h3 className="font-black text-text-primary text-base border-b border-gray-100 pb-3">
              Información de Cuenta
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-text-secondary font-medium">Ubicación principal:</span>
                <span className="text-text-primary font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-purple" /> {usuario.location || "Bolivia, Bol"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary font-medium">Miembro desde:</span>
                <span className="text-text-primary font-bold">{formatDate(usuario.createdAt)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary font-medium">Cuenta verificada:</span>
                <span className="text-text-primary font-bold text-green-500 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Sí
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              {usuario.role === "admin" && (
                <Link to="/admin">
                  <Button className="w-full bg-brand-purple text-white font-bold h-10 rounded-xl shadow-brand hover:shadow-brand-lg transition-all text-xs flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" /> Ir a Administración
                  </Button>
                </Link>
              )}
              <Link to="/profile/edit">
                <Button className="w-full bg-gray-100 hover:bg-gray-200 text-text-primary font-bold h-10 rounded-xl transition-all text-xs">
                  Configurar mi Perfil
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recommended Technicians List */}
          <div className="space-y-3">
            <h3 className="font-black text-text-primary text-base flex items-center justify-between">
              <span>Técnicos recomendados</span>
              <Link to="/technicians" className="text-xs text-brand-purple hover:underline font-bold flex items-center gap-0.5">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </h3>

            <div className="space-y-3">
              {tecnicosRecomendados.map((tech) => (
                <Card
                  key={tech.id}
                  className="bg-white border border-gray-100 shadow-brand-sm hover:shadow-brand transition-all cursor-pointer"
                  onClick={() => navegar(`/technicians/${tech.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar src={tech.avatar} name={tech.name} size="sm" className="flex-shrink-0 ring-2 ring-brand-orange/10" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-text-primary truncate">{tech.name}</h4>
                        {tech.isVerified ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary">
                        <StarRating rating={tech.rating} size="sm" />
                        <span className="font-semibold text-text-primary">{tech.rating}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-text-secondary">Por hr</p>
                      <p className="font-bold text-sm text-brand-purple">{formatCurrency(tech.hourlyRate)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
