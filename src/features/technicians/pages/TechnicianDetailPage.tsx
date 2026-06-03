import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Avatar, Button, Card, CardContent, Chip, Separator, Tab, Tabs
} from "@/components/ui/HeroUICompat";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, MapPin, Clock, TrendingUp,
  MessageSquare, Star, CheckCircle, Calendar, X, Briefcase
} from "lucide-react";
import { technicianService, reviewService, chatService, requestService } from "@/services";
import type { Technician, Review } from "@/types";
import { StarRating } from "@/components/ui/StarRating";
import { Skeleton } from "@/components/ui/Skeletons";
import { usePageTitle } from "@/hooks";
import { CATEGORY_LABELS, ROUTES } from "@/constants";
import { formatCurrency, formatRelativeTime } from "@/utils";
import { useAuthStore, useUIStore } from "@/store";

export default function TechnicianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tech, setTech] = useState<Technician | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [budget, setBudget] = useState<number | "">("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useUIStore();

  usePageTitle(tech?.name ?? "Técnico");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      technicianService.getById(id),
      reviewService.getByTechnicianId(id),
    ]).then(([techData, reviewData]) => {
      setTech(techData ?? null);
      setReviews(reviewData);
      setIsLoading(false);
    });
  }, [id]);

  const handleMessage = async () => {
    if (!isAuthenticated) {
      addToast({
        type: "warning",
        title: "Inicio de sesión requerido",
        message: "Por favor, inicia sesión para enviar un mensaje a este técnico.",
      });
      navigate(ROUTES.LOGIN, { state: { from: `/technicians/${tech?.id}` } });
    } else {
      try {
        if (!tech?.userId) return;
        const conv = await chatService.startConversation(tech.userId);
        navigate(ROUTES.CHAT, { state: { activeConversationId: conv.id } });
      } catch (err: any) {
        console.error("Error al iniciar chat:", err);
        addToast({
          type: "error",
          title: "Error al iniciar conversación",
          message: err.message || "Ocurrió un error inesperado al intentar chatear.",
        });
      }
    }
  };

  const handleHire = () => {
    if (!isAuthenticated) {
      addToast({
        type: "warning",
        title: "Inicio de sesión requerido",
        message: "Por favor, inicia sesión para solicitar la contratación de este técnico.",
      });
      navigate(ROUTES.LOGIN, { state: { from: `/technicians/${tech?.id}` } });
    } else {
      setAddress(user?.location || "");
      setIsHireModalOpen(true);
    }
  };

  const handleSubmitHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tech) return;
    if (!title.trim() || title.length < 5) {
      addToast({
        type: "error",
        title: "Título inválido",
        message: "El título debe tener al menos 5 caracteres.",
      });
      return;
    }
    if (!description.trim() || description.length < 10) {
      addToast({
        type: "error",
        title: "Descripción inválida",
        message: "La descripción debe tener al menos 10 caracteres.",
      });
      return;
    }
    if (!address.trim()) {
      addToast({
        type: "error",
        title: "Dirección requerida",
        message: "Por favor, ingresa la dirección para realizar el trabajo.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await requestService.createRequest({
        technicianId: tech.id,
        category: tech.category,
        title,
        description,
        address,
        budget: budget ? Number(budget) : undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      });

      addToast({
        type: "success",
        title: "¡Solicitud enviada con éxito!",
        message: `Tu solicitud de contratación para ${tech.name} ha sido registrada.`,
      });

      setIsHireModalOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setAddress("");
      setBudget("");
      setScheduledDate("");

      navigate(ROUTES.REQUESTS);
    } catch (error: any) {
      console.error("Error al crear solicitud de contratación:", error);
      addToast({
        type: "error",
        title: "Error al enviar solicitud",
        message: error.message || "Ocurrió un error inesperado al procesar tu solicitud.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="bg-white rounded-2xl p-8">
          <div className="flex gap-6">
            <Skeleton className="w-20 h-20" rounded="full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Técnico no encontrado.</p>
        <Link to={ROUTES.TECHNICIANS}>
          <Button className="mt-4" color="primary" variant="flat">
            Ver técnicos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-brand-blue transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Profile Card */}
        <Card className="bg-white border border-gray-100 shadow-brand-sm overflow-hidden">
          {/* Top gradient strip */}
          <div className="h-2 bg-brand-gradient" />
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative flex-shrink-0">
                <Avatar
                  src={tech.avatar}
                  name={tech.name}
                  className="w-20 h-20 text-xl ring-4 ring-brand-orange/20"
                />
                {tech.isAvailable && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-3 justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-black text-text-primary">{tech.name}</h1>
                      {tech.isVerified && (
                        <Chip
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<Shield className="w-3 h-3" />}
                        >
                          Verificado
                        </Chip>
                      )}
                    </div>
                    <p className="text-brand-orange font-semibold mt-0.5">
                      {tech.categoryLabel || CATEGORY_LABELS[tech.category] || tech.category}
                    </p>
                  </div>
                  <Chip
                    color={tech.isAvailable ? "success" : "default"}
                    variant="flat"
                    size="sm"
                  >
                    {tech.isAvailable ? "Disponible ahora" : "No disponible"}
                  </Chip>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={tech.rating} size="sm" showValue />
                    <span>({tech.reviewCount} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {tech.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Responde {tech.responseTime}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                  {[
                    { icon: TrendingUp, label: `${tech.jobsCompleted} trabajos` },
                    { icon: CheckCircle, label: `${tech.reviewCount} reseñas` },
                    { icon: Calendar, label: `Miembro desde ${new Date(tech.joinedAt).getFullYear()}` },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-gray-50 px-3 py-1.5 rounded-full">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <span className="text-text-secondary text-sm">Tarifa por hora</span>
                <p className="text-3xl font-black text-brand-blue">
                  {formatCurrency(tech.hourlyRate)}
                  <span className="text-base font-normal text-text-secondary">/hr</span>
                </p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                {!(user?.role === "technician" && String(tech?.userId) === String(user?.id)) ? (
                  <>
                    <Button
                      variant="flat"
                      className="flex-1 sm:flex-none bg-brand-blue/10 text-brand-blue font-bold h-12 rounded-xl hover:bg-brand-blue/20 transition-all gap-3 px-6"
                      startContent={<MessageSquare className="w-4 h-4" />}
                      onClick={handleMessage}
                    >
                      Mensaje
                    </Button>
                    <Button
                      className="flex-1 sm:flex-none bg-brand-gradient text-white font-bold h-12 rounded-xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all px-8"
                      onClick={handleHire}
                    >
                      Contratar ahora
                    </Button>
                  </>
                ) : (
                  <Link to={ROUTES.PROFILE_EDIT} className="flex-1 sm:flex-none">
                    <Button
                      className="w-full bg-brand-gradient text-white font-bold h-12 rounded-xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all px-8"
                    >
                      Editar Mi Perfil
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="bg-white border border-gray-100 shadow-brand-sm">
          <CardContent className="p-6">
            <Tabs color="primary" variant="underlined" classNames={{ tab: "font-semibold" }}>
              {/* About */}
              <Tab key="about" title="Acerca de">
                <div className="pt-4 space-y-6">
                  <div>
                    <h3 className="font-bold text-text-primary mb-2">Biografía</h3>
                    <p className="text-text-secondary leading-relaxed">{tech.bio}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary mb-3">Especialidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {tech.specialties.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1.5 bg-brand-blue/6 text-brand-blue text-sm font-medium rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab>

              {/* Reviews */}
              <Tab
                key="reviews"
                title={
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Reseñas ({reviews.length})
                  </div>
                }
              >
                <div className="pt-4 space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-text-secondary text-sm py-8 text-center">Sin reseñas aún.</p>
                  ) : (
                    reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 pb-4 border-b border-gray-50 last:border-0"
                      >
                        <Avatar src={review.clientAvatar} name={review.clientName} size="sm" className="flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-text-primary">{review.clientName}</span>
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-text-muted ml-auto">
                              {formatRelativeTime(review.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary mt-1 leading-relaxed">{review.comment}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Tab>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hiring Modal */}
      <AnimatePresence>
        {isHireModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop with blur and fade transition */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHireModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md"
            />

            {/* Modal Card container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-brand-2xl border border-gray-100 overflow-hidden z-10"
            >
              {/* Top accent bar */}
              <div className="h-2 bg-brand-gradient" />

              {/* Close Button */}
              <button
                onClick={() => setIsHireModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-all"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleSubmitHire} className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-text-primary">Solicitar Contratación</h2>
                    <p className="text-sm text-text-secondary">Contratar a <span className="font-semibold text-brand-orange">{tech.name}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Category info chip */}
                  <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-text-secondary font-medium">Categoría del Servicio:</span>
                    <span className="font-bold text-brand-blue bg-brand-blue/5 px-2.5 py-1 rounded-lg">
                      {tech.categoryLabel || CATEGORY_LABELS[tech.category] || tech.category}
                    </span>
                  </div>

                  {/* Title Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="request-title" className="text-sm font-bold text-text-primary flex items-center justify-between">
                      <span>Título del Servicio <span className="text-red-500">*</span></span>
                      <span className="text-xs font-normal text-text-muted">mín. 5 caract.</span>
                    </label>
                    <input
                      id="request-title"
                      type="text"
                      required
                      placeholder="Ej. Reparar fuga en grifería de cocina"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all text-sm text-text-primary"
                    />
                  </div>

                  {/* Description TextArea */}
                  <div className="space-y-1.5">
                    <label htmlFor="request-description" className="text-sm font-bold text-text-primary flex items-center justify-between">
                      <span>Detalles del Trabajo <span className="text-red-500">*</span></span>
                      <span className="text-xs font-normal text-text-muted">mín. 10 caract.</span>
                    </label>
                    <textarea
                      id="request-description"
                      required
                      rows={3}
                      placeholder="Describe a detalle el problema o tarea que deseas que realice..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all text-sm text-text-primary resize-none"
                    />
                  </div>

                  {/* Address Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="request-address" className="text-sm font-bold text-text-primary">
                      Dirección del Trabajo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-text-secondary" />
                      <input
                        id="request-address"
                        type="text"
                        required
                        placeholder="Ej. Calle Aroma #456, La Paz"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all text-sm text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Budget Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="request-budget" className="text-sm font-bold text-text-primary">
                        Presupuesto Estimado (Bs)
                      </label>
                      <input
                        id="request-budget"
                        type="number"
                        min="0"
                        placeholder="Ej. 150"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all text-sm text-text-primary"
                      />
                    </div>

                    {/* Date Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="request-date" className="text-sm font-bold text-text-primary flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                        <span>Fecha Programada</span>
                      </label>
                      <input
                        id="request-date"
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all text-sm text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="flat"
                    onClick={() => setIsHireModalOpen(false)}
                    className="flex-1 font-bold h-12 rounded-xl border border-gray-100 text-text-secondary hover:bg-gray-50 transition-all"
                    isDisabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-brand-gradient text-white font-bold h-12 rounded-xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    isDisabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Confirmar Contratación"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
