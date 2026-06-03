import { useState, useEffect } from "react";
import { Card, CardContent, Avatar, Button, Tabs, Tab } from "@/components/ui/HeroUICompat";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Calendar, MapPin, DollarSign, FileText, ChevronDown, ChevronUp, AlertTriangle, X, Briefcase, Clock } from "lucide-react";
import { requestService } from "@/services";
import { useAuthStore, useUIStore } from "@/store";
import type { ServiceRequest, RequestStatus } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePageTitle } from "@/hooks";
import { formatDate, formatCurrency } from "@/utils";
import { CATEGORY_LABELS } from "@/constants";

const PESTANAS: { key: RequestStatus | "all"; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "accepted", label: "Aceptadas" },
  { key: "in_progress", label: "En Proceso" },
  { key: "completed", label: "Completadas" },
  { key: "cancelled", label: "Canceladas" },
];

export default function RequestsPage() {
  usePageTitle("Mis Solicitudes");
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [solicitudes, setSolicitudes] = useState<ServiceRequest[]>([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    requestService.getByClientId(user.id).then((data) => {
      setSolicitudes(data);
      setEstaCargando(false);
    });
  }, [user?.id]);

  const solicitudesFiltradas = pestanaActiva === "all"
    ? solicitudes
    : solicitudes.filter((r) => r.status === pestanaActiva);

  const handleCancel = async (reqId: string) => {
    setCancellingId(reqId);
    try {
      const updated = await requestService.updateStatus(reqId, "cancelled");
      setSolicitudes((prev) =>
        prev.map((r) => (String(r.id) === String(reqId) ? updated : r))
      );
      addToast({
        type: "success",
        title: "Solicitud cancelada",
        message: "La solicitud ha sido cancelada exitosamente.",
      });
      setConfirmCancelId(null);
    } catch (error: any) {
      console.error("Error al cancelar solicitud:", error);
      addToast({
        type: "error",
        title: "Error al cancelar",
        message: error.message || "No se pudo cancelar la solicitud.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getCategoryLabel = (category: string) => {
    return (CATEGORY_LABELS as any)[category] || category;
  };

  const getPriceDisplay = (req: ServiceRequest) => {
    if (req.agreedRate && req.agreedRate > 0) {
      return { label: "Total acordado", value: formatCurrency(req.agreedRate) };
    }
    if (req.budget && req.budget > 0) {
      return { label: "Presupuesto", value: formatCurrency(req.budget) };
    }
    return { label: "Precio", value: "Por acordar" };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Mis Solicitudes</h1>
          <p className="text-text-secondary mt-1">Gestiona y haz seguimiento a tus servicios contratados</p>
        </div>
        <div className="bg-brand-blue/5 px-4 py-2 rounded-xl border border-brand-blue/10">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">Total: {solicitudes.length} servicios</span>
        </div>
      </div>

      <Tabs
        selectedKey={pestanaActiva}
        onSelectionChange={(clave) => setPestanaActiva(clave as string)}
        variant="underlined"
        className="mb-8"
        classNames={{ 
          tabList: "gap-8 border-b border-gray-100",
          tab: "pb-4 font-bold text-sm transition-all data-[selected=true]:text-brand-blue data-[selected=true]:border-b-2 data-[selected=true]:border-brand-blue" 
        }}
      >
        {PESTANAS.map(({ key, label }) => {
          const cantidad = key === "all" ? solicitudes.length : solicitudes.filter(r => r.status === key).length;
          return (
            <Tab 
              key={key} 
              title={
                <div className="flex items-center gap-2">
                  <span>{label}</span>
                  {cantidad > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-black group-data-[selected=true]:bg-brand-blue group-data-[selected=true]:text-white transition-colors">
                      {cantidad}
                    </span>
                  )}
                </div>
              } 
            />
          );
        })}
      </Tabs>

      {estaCargando ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-brand-sm border border-gray-100 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-10 bg-gray-50 rounded mt-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin solicitudes"
          description="No tienes solicitudes en esta categoría aún."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {solicitudesFiltradas.map((req, i) => {
              const price = getPriceDisplay(req);
              const isExpanded = expandedId === String(req.id);
              const isConfirmingCancel = confirmCancelId === String(req.id);

              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="bg-white border border-gray-100 shadow-brand-sm hover:shadow-brand-lg transition-all duration-300 group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl" />
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row gap-8">
                        <div className="relative flex-shrink-0">
                          <Avatar
                            src={req.technicianAvatar}
                            name={req.technicianName}
                            className="w-20 h-20 rounded-2xl shadow-brand-sm ring-4 ring-white"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-black text-text-primary group-hover:text-brand-blue transition-colors leading-tight">
                                  {req.title}
                                </h3>
                                <StatusBadge status={req.status} />
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-base font-bold text-text-primary">{req.technicianName}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-sm text-text-secondary">{getCategoryLabel(req.category)}</span>
                              </div>
                            </div>
                            <div className="text-right bg-brand-blue/5 p-3 rounded-xl border border-brand-blue/10 min-w-[140px]">
                              <span className="text-[10px] text-brand-blue block uppercase font-black tracking-widest mb-1">{price.label}</span>
                              <span className="text-xl font-black text-brand-blue">
                                {price.value}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-text-secondary mt-4 leading-relaxed line-clamp-2 italic">
                            "{req.description}"
                          </p>

                          {/* Expandable Detail Panel */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100 space-y-4">
                                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-brand-blue" />
                                    Detalles de la Solicitud
                                  </h4>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Description */}
                                    <div className="sm:col-span-2 bg-white rounded-lg p-3 border border-gray-100">
                                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Descripción</span>
                                      <p className="text-sm text-text-primary leading-relaxed">{req.description}</p>
                                    </div>

                                    {/* Address */}
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                      <div className="flex items-center gap-2 mb-1">
                                        <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Dirección</span>
                                      </div>
                                      <p className="text-sm text-text-primary font-medium">{req.address || "No especificada"}</p>
                                    </div>

                                    {/* Category */}
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Briefcase className="w-3.5 h-3.5 text-brand-purple" />
                                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Categoría</span>
                                      </div>
                                      <p className="text-sm text-text-primary font-medium">{getCategoryLabel(req.category)}</p>
                                    </div>

                                    {/* Budget */}
                                    {req.budget != null && req.budget > 0 && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                          <DollarSign className="w-3.5 h-3.5 text-green-500" />
                                          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Presupuesto estimado</span>
                                        </div>
                                        <p className="text-sm text-text-primary font-bold">{formatCurrency(req.budget)}</p>
                                      </div>
                                    )}

                                    {/* Agreed Rate */}
                                    {req.agreedRate != null && req.agreedRate > 0 && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                          <DollarSign className="w-3.5 h-3.5 text-brand-blue" />
                                          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total acordado</span>
                                        </div>
                                        <p className="text-sm text-brand-blue font-black">{formatCurrency(req.agreedRate)}</p>
                                      </div>
                                    )}

                                    {/* Scheduled Date */}
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Fecha programada</span>
                                      </div>
                                      <p className="text-sm text-text-primary font-medium">
                                        {req.scheduledDate ? formatDate(req.scheduledDate) : "Sin fecha programada"}
                                      </p>
                                    </div>

                                    {/* Completed Date */}
                                    {req.completedDate && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Clock className="w-3.5 h-3.5 text-green-500" />
                                          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Fecha completada</span>
                                        </div>
                                        <p className="text-sm text-text-primary font-medium">{formatDate(req.completedDate)}</p>
                                      </div>
                                    )}

                                    {/* Created / Updated */}
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Fecha de creación</span>
                                      </div>
                                      <p className="text-sm text-text-primary font-medium">{formatDate(req.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex flex-wrap items-center justify-between mt-6 pt-6 border-t border-gray-50 gap-4">
                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Calendar className="w-4 h-4 text-brand-blue" />
                                <span className="font-semibold">
                                  {req.scheduledDate ? formatDate(req.scheduledDate) : formatDate(req.createdAt)}
                                </span>
                              </div>
                              <span className="text-xs">ID: #{req.id}</span>
                            </div>

                            <div className="flex gap-3">
                              {/* Cancel button */}
                              {req.status === "pending" && !isConfirmingCancel && (
                                <Button
                                  variant="flat"
                                  color="danger"
                                  className="font-bold h-10 px-6 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                  onPress={() => setConfirmCancelId(String(req.id))}
                                >
                                  Cancelar
                                </Button>
                              )}

                              {/* Cancel confirmation */}
                              {isConfirmingCancel && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    ¿Seguro?
                                  </span>
                                  <Button
                                    variant="flat"
                                    size="sm"
                                    className="font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all h-8 px-4 text-xs"
                                    isLoading={cancellingId === String(req.id)}
                                    onPress={() => handleCancel(String(req.id))}
                                  >
                                    Sí, cancelar
                                  </Button>
                                  <Button
                                    variant="flat"
                                    size="sm"
                                    className="font-bold rounded-lg bg-gray-100 text-text-secondary hover:bg-gray-200 transition-all h-8 px-4 text-xs"
                                    onPress={() => setConfirmCancelId(null)}
                                    startContent={<X className="w-3 h-3" />}
                                  >
                                    No
                                  </Button>
                                </div>
                              )}

                              {/* View details toggle */}
                              <Button
                                variant="flat"
                                color="primary"
                                className="font-bold h-10 px-6 rounded-xl bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-all"
                                onPress={() => toggleExpand(String(req.id))}
                                endContent={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              >
                                {isExpanded ? "Ocultar" : "Ver detalles"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
