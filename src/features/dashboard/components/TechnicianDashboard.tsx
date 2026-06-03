import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, CardContent, Chip, Separator } from "@/components/ui/HeroUICompat";
import { motion } from "framer-motion";
import {
  ClipboardList, TrendingUp, Star, MapPin,
  MessageSquare, DollarSign, Calendar, Clock, Check, X, AlertCircle,
  ShieldCheck, ShieldAlert
} from "lucide-react";
import { technicianService, requestService, reviewService, chatService } from "@/services";
import { StarRating } from "@/components/ui/StarRating";
import { formatCurrency, formatDate } from "@/utils";
import { useUIStore } from "@/store";
import type { User, Technician, ServiceRequest, Review } from "@/types";

interface PropsPanelTecnico {
  usuario: User;
}

export function TechnicianDashboard({ usuario }: PropsPanelTecnico) {
  const { addToast } = useUIStore();
  const navegar = useNavigate();

  const [perfilTecnico, setPerfilTecnico] = useState<Technician | null>(null);
  const [estaDisponible, setEstaDisponible] = useState(false);
  const [solicitudes, setSolicitudes] = useState<ServiceRequest[]>([]);
  const [resenasTecnico, setResenasTecnico] = useState<Review[]>([]);
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    if (!usuario.id) return;
    setEstaCargando(true);

    // Fetch technician own profile first
    technicianService.getOwnProfile()
      .then((perfil) => {
        if (perfil) {
          setPerfilTecnico(perfil);
          setEstaDisponible(perfil.isAvailable);

          // Then fetch requests and reviews in parallel
          return Promise.all([
            requestService.getByClientId(usuario.id),
            reviewService.getByTechnicianId(perfil.id)
          ]).then(([listaSolicitudes, listaResenas]) => {
            // Filter requests assigned to this technician profile
            setSolicitudes(listaSolicitudes.filter((r) => r.technicianId === perfil.id));
            setResenasTecnico(listaResenas);
          });
        }
      })
      .catch((err) => {
        console.error("Error loading TechnicianDashboard data:", err);
      })
      .finally(() => {
        setEstaCargando(false);
      });
  }, [usuario.id]);

  // Toggle availability state via backend
  const manejarCambioDisponibilidad = async () => {
    if (!perfilTecnico) return;
    const siguienteEstado = !estaDisponible;
    try {
      await technicianService.updateOwnProfile({ isAvailable: siguienteEstado });
      setEstaDisponible(siguienteEstado);
      addToast({
        type: siguienteEstado ? "success" : "info",
        title: siguienteEstado ? "¡Estás disponible!" : "Has pausado tu disponibilidad",
        message: siguienteEstado
          ? "Los clientes ahora te verán en el catálogo y podrán contratarte de inmediato."
          : "Tu perfil aparecerá como 'No disponible' temporalmente.",
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Error al actualizar disponibilidad",
        message: err.message || "Ocurrió un error inesperado.",
      });
    }
  };

  // Handle request state transition in real-time on backend
  const actualizarEstadoSolicitud = async (id: string, nuevoEstado: "accepted" | "in_progress" | "completed" | "cancelled") => {
    try {
      await requestService.updateStatus(id, nuevoEstado);
      setSolicitudes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nuevoEstado } : r))
      );

      const mensajes = {
        accepted: "Has aceptado el trabajo. El cliente ha sido notificado.",
        in_progress: "¡Trabajo iniciado! Reporta novedades al cliente en el chat.",
        completed: "¡Felicidades por finalizar el trabajo! Tus ganancias han sido registradas.",
        cancelled: "Has rechazado la solicitud de servicio.",
      };

      addToast({
        type: nuevoEstado === "completed" ? "success" : nuevoEstado === "cancelled" ? "warning" : "info",
        title: `Estado actualizado: ${nuevoEstado === "completed" ? "Trabajo Completado" : nuevoEstado === "accepted" ? "Aceptado" : nuevoEstado === "in_progress" ? "En Proceso" : "Rechazado"}`,
        message: mensajes[nuevoEstado],
      });

      if (nuevoEstado === "completed") {
        setPerfilTecnico(prev => prev ? { ...prev, jobsCompleted: prev.jobsCompleted + 1 } : prev);
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Error al actualizar estado",
        message: err.message || "No se pudo actualizar el estado de la solicitud.",
      });
    }
  };

  const handleOpenChat = async (clientId: string, reqId: string | number) => {
    try {
      const conv = await chatService.startConversation(clientId, reqId);
      navegar("/chat", { state: { activeConversationId: conv.id } });
    } catch (error) {
      addToast({ type: "error", title: "Error", message: "No se pudo iniciar el chat." });
    }
  };

  // Safe fallback if profile is not loaded yet
  if (estaCargando || !perfilTecnico) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Stats calculation
  const gananciasTotales = solicitudes
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + (r.agreedRate || 0), 0);

  const trabajosActivos = solicitudes.filter(
    (r) => r.status === "pending" || r.status === "accepted" || r.status === "in_progress"
  ).length;

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
  const esPerfilIncompleto =
    !perfilTecnico.category ||
    perfilTecnico.category.toLowerCase() === "general" ||
    perfilTecnico.hourlyRate === 0;

  return (
    <div className="space-y-6">
      {/* ── Onboarding / Perfil Incompleto Banner ── */}
      {esPerfilIncompleto && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-3xl p-6 overflow-hidden shadow-brand-sm flex flex-col md:flex-row items-center justify-between gap-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-amber-800 text-base flex items-center gap-1.5">
                ¡Casi listo! ⚠️
              </h3>
              <p className="text-amber-700 text-xs md:text-sm leading-relaxed max-w-2xl font-medium">
                Para empezar a recibir ofertas y aparecer en las búsquedas de los clientes, por favor completa tu perfil añadiendo tu categoría y tu tarifa por hora.
              </p>
            </div>
          </div>
          <Link to="/profile/edit" className="w-full md:w-auto">
            <Button
              className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 px-6 rounded-2xl transition-all shadow-brand-sm hover:-translate-y-0.5 text-xs whitespace-nowrap"
            >
              Completar Perfil
            </Button>
          </Link>
        </motion.div>
      )}

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-brand-gradient text-white rounded-3xl p-8 overflow-hidden shadow-brand-lg"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="space-y-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
                Panel Profesional 
                {perfilTecnico.isVerified ? (
                  <span className="text-white flex items-center gap-1 bg-green-500/80 px-2 py-0.5 rounded-full shadow-brand-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                  </span>
                ) : (
                  <span className="text-white/90 flex items-center gap-1 bg-amber-500/80 px-2 py-0.5 rounded-full shadow-brand-sm">
                    <ShieldAlert className="w-3.5 h-3.5" /> Pendiente
                  </span>
                )}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              ¡Hola, {perfilTecnico.name}!
            </h1>
            <p className="text-white/85 text-sm max-w-xl">
              Aquí tienes el resumen de tu actividad laboral. Administra tus cotizaciones de servicio, chatea con tus clientes activos y cambia tu estado de disponibilidad.
            </p>
          </div>

          {/* Availability Toggle Box */}
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 flex flex-col items-center gap-2 text-center min-w-[200px] shadow-brand-sm">
            <span className="text-xs font-bold text-white/95 uppercase tracking-wider">Mi Disponibilidad</span>
            <Chip
              color={estaDisponible ? "success" : "default"}
              variant="solid"
              className={`font-black uppercase tracking-wider text-xs px-3 py-1.5 rounded-xl ${estaDisponible ? "bg-green-400 text-brand-blue" : "bg-gray-400 text-white"}`}
            >
              {estaDisponible ? "Disponible Ahora" : "No Disponible"}
            </Chip>
            <Button
              onPress={manejarCambioDisponibilidad}
              size="sm"
              className={`mt-1 font-bold h-9 px-4 rounded-xl transition-all shadow-brand-sm ${estaDisponible
                  ? "bg-white text-brand-purple hover:bg-gray-100"
                  : "bg-brand-purple text-white hover:bg-brand-purple-dark"
                }`}
            >
              {estaDisponible ? "Pausar Trabajo" : "Activar Trabajo"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos Totales", value: formatCurrency(gananciasTotales), icon: DollarSign, color: "bg-green-50 text-green-600 border-green-100" },
          { label: "Trabajos Realizados", value: perfilTecnico.jobsCompleted, icon: TrendingUp, color: "bg-blue-50 text-blue-600 border-blue-100" },
          { label: "Calificación Promedio", value: `${perfilTecnico.rating} ★`, icon: Star, color: "bg-amber-50 text-amber-600 border-amber-100" },
          { label: "Órdenes Activas", value: trabajosActivos, icon: Clock, color: "bg-purple-50 text-purple-600 border-purple-100" },
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
        {/* ── Main Panel: Active/Incoming Orders ── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-text-primary flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand-purple" /> Solicitudes de Trabajo Asignadas
          </h2>

          <div className="space-y-3">
            {solicitudes.length === 0 ? (
              <Card className="bg-white border border-gray-100 shadow-brand-sm py-12 text-center">
                <CardContent className="space-y-2">
                  <AlertCircle className="w-10 h-10 text-text-muted mx-auto" />
                  <h3 className="font-bold text-text-primary">No tienes solicitudes todavía</h3>
                  <p className="text-text-secondary text-sm max-w-sm mx-auto">
                    Asegúrate de estar disponible para que los clientes puedan enviarte solicitudes directas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              solicitudes.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="bg-white border border-gray-100 shadow-brand-sm hover:shadow-brand transition-all">
                    <CardContent className="p-6 space-y-4">
                      {/* Customer Row */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-brand-purple/10 rounded-full flex items-center justify-center font-bold text-brand-purple text-sm">
                            {req.title.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-text-primary">{req.title}</h4>
                            <span className="text-xs text-text-secondary">Ubicación: {req.address}</span>
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

                      <p className="text-xs text-text-secondary leading-relaxed">{req.description}</p>

                      <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                        <div className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-text-muted" />
                            <span>Tarifa: <strong className="text-brand-purple">{formatCurrency(req.agreedRate || req.budget || 0)}</strong></span>
                          </div>
                          {req.scheduledDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-text-muted" />
                              <span>{formatDate(req.scheduledDate)}</span>
                            </div>
                          )}
                          {req.status === "completed" && resenasTecnico.find(r => r.requestId === req.id) && (
                            <div className="flex items-center gap-1">
                              <span className="text-amber-500 font-bold flex items-center gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {resenasTecnico.find(r => r.requestId === req.id)?.rating}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Interactive status buttons for technician */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            className="bg-brand-blue/10 text-brand-blue font-bold h-9 px-3 rounded-lg hover:bg-brand-blue/20 transition-all flex items-center gap-1 text-xs"
                            onPress={() => handleOpenChat(req.clientId, req.id)}
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Chat
                          </Button>

                          {req.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500 text-white font-bold h-9 px-3 rounded-lg hover:bg-green-600 transition-all flex items-center gap-1 text-xs"
                                onClick={() => actualizarEstadoSolicitud(req.id, "accepted")}
                              >
                                <Check className="w-3.5 h-3.5" /> Aceptar
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-500 text-white font-bold h-9 px-3 rounded-lg hover:bg-red-600 transition-all flex items-center gap-1 text-xs"
                                onClick={() => actualizarEstadoSolicitud(req.id, "cancelled")}
                              >
                                <X className="w-3.5 h-3.5" /> Rechazar
                              </Button>
                            </>
                          )}

                          {req.status === "accepted" && (
                            <Button
                              size="sm"
                              className="bg-brand-purple text-white font-bold h-9 px-3 rounded-lg hover:bg-brand-purple-dark transition-all flex items-center gap-1 text-xs shadow-brand-sm"
                              onClick={() => actualizarEstadoSolicitud(req.id, "in_progress")}
                            >
                              Iniciar Trabajo
                            </Button>
                          )}

                          {req.status === "in_progress" && (
                            <Button
                              size="sm"
                              className="bg-green-500 text-white font-bold h-9 px-3 rounded-lg hover:bg-green-600 transition-all flex items-center gap-1 text-xs shadow-brand-sm"
                              onClick={() => actualizarEstadoSolicitud(req.id, "completed")}
                            >
                              Finalizar Trabajo
                            </Button>
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

        {/* ── Sidebar: Reviews & Stats ── */}
        <div className="space-y-6">
          {/* Quick Stats Panel */}
          <Card className="bg-white border border-gray-100 shadow-brand-sm p-6 space-y-4">
            <h3 className="font-black text-text-primary text-base border-b border-gray-100 pb-3">
              Información Profesional
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-text-secondary font-medium">Categoría:</span>
                <span className="text-brand-purple font-bold uppercase tracking-wider text-xs">
                  {perfilTecnico.category === "electrician" ? "Electricista" : perfilTecnico.category}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary font-medium">Tarifa base por hr:</span>
                <span className="text-text-primary font-bold">{formatCurrency(perfilTecnico.hourlyRate)}/hr</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary font-medium">Tiempo respuesta:</span>
                <span className="text-text-primary font-bold">{perfilTecnico.responseTime}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary font-medium">Ubicación:</span>
                <span className="text-text-primary font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-purple" /> {perfilTecnico.location}
                </span>
              </div>
            </div>

            <Separator />

            <Link to="/profile/edit" className="block">
              <Button className="w-full bg-gray-100 hover:bg-gray-200 text-text-primary font-bold h-10 rounded-xl transition-all text-xs">
                Configurar mis Servicios
              </Button>
            </Link>
          </Card>

          {/* Recent Reviews Summary */}
          <div className="space-y-3">
            <h3 className="font-black text-text-primary text-base flex items-center justify-between">
              <span>Reseñas de Clientes ({resenasTecnico.length})</span>
            </h3>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {resenasTecnico.map((rev) => (
                <Card key={rev.id} className="bg-white border border-gray-100 shadow-brand-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={rev.clientAvatar} name={rev.clientName} size="xs" className="flex-shrink-0 ring-1 ring-gray-100" />
                        <span className="font-bold text-xs text-text-primary truncate max-w-[120px]">{rev.clientName}</span>
                      </div>
                      <StarRating rating={rev.rating} size="sm" />
                    </div>
                    <p className="text-[11px] text-text-secondary italic leading-relaxed line-clamp-3">
                      "{rev.comment}"
                    </p>
                    <div className="text-[10px] text-text-muted text-right">
                      {formatDate(rev.createdAt)}
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
