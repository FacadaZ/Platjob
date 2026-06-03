import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Input, Select, SelectItem, Button, Chip } from "@/components/ui/HeroUICompat";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { technicianService } from "@/services";
import { TechnicianGridSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "@/components/ui/StarRating";
import { useDebounce, usePageTitle } from "@/hooks";
import { CATEGORY_LABELS, ROUTES } from "@/constants";
import { formatCurrency } from "@/utils";
import type { Technician, ServiceCategory, TechnicianFilters } from "@/types";
import { Avatar, Card, CardContent } from "@/components/ui/HeroUICompat";
import { ShieldCheck, ShieldAlert, TrendingUp, Clock, MapPin } from "lucide-react";

export default function PaginaTecnicos() {
  usePageTitle("Técnicos");
  const [parametrosBusqueda, setParametrosBusqueda] = useSearchParams();
  const [tecnicos, setTecnicos] = useState<Technician[]>([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [categories, setCategories] = useState<{ key: string; label: string; icon: string }[]>([]);

  const [busqueda, setBusqueda] = useState(parametrosBusqueda.get("q") ?? "");
  const [categoria, setCategoria] = useState<ServiceCategory | "">(
    (parametrosBusqueda.get("category") as ServiceCategory) ?? ""
  );
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  useEffect(() => {
    technicianService.getCategories().then((data) => {
      setCategories(data);
    });
  }, []);

  const busquedaDiferida = useDebounce(busqueda, 400);

  const cargarTecnicos = useCallback(async () => {
    setEstaCargando(true);
    const filtros: TechnicianFilters = {
      query: busquedaDiferida || undefined,
      category: categoria || undefined,
      isAvailable: soloDisponibles ? true : undefined,
    };
    const datos = await technicianService.getAll(filtros);
    setTecnicos(datos);
    setEstaCargando(false);
  }, [busquedaDiferida, categoria, soloDisponibles]);

  useEffect(() => { cargarTecnicos(); }, [cargarTecnicos]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoria("");
    setSoloDisponibles(false);
    setParametrosBusqueda({});
  };

  const hayFiltrosActivos = busqueda || categoria || soloDisponibles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-text-primary">Encontrar Técnicos</h1>
        <p className="text-text-secondary mt-1">
          {estaCargando ? "Buscando..." : `${tecnicos.length} técnico${tecnicos.length !== 1 ? "s" : ""} disponibles`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-brand-sm border border-gray-100 mb-6">
        <div className="flex gap-3 flex-col sm:flex-row">
          <Input
            value={busqueda}
            onValueChange={setBusqueda}
            placeholder="Buscar por nombre, especialidad..."
            startContent={<Search className="w-4 h-4 text-text-secondary" />}
            variant="bordered"
            className="flex-1"
            classNames={{ inputWrapper: "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue h-12" }}
            isClearable
            onClear={() => setBusqueda("")}
          />
          <Select
            placeholder="Categoría"
            selectedKey={categoria || undefined}
            onSelectionChange={(val) => {
              const key = typeof val === "object" && val !== null ? Array.from(val as any)[0] : val;
              setCategoria((key as ServiceCategory) ?? "");
            }}
            variant="bordered"
            className="sm:w-52"
            classNames={{ trigger: "border-gray-200 hover:border-brand-blue h-12" }}
          >
            {categories.map((cat) => (
              <SelectItem id={cat.key} key={cat.key} textValue={cat.label}>
                {cat.label}
              </SelectItem>
            ))}
          </Select>
          <Button
            onPress={() => setMostrarFiltros(!mostrarFiltros)}
            variant="flat"
            className="bg-gray-100 text-text-primary h-12 px-6 rounded-xl font-bold hover:bg-gray-200 transition-all"
            startContent={<SlidersHorizontal className="w-4 h-4" />}
          >
            Filtros
          </Button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {mostrarFiltros && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-100 mt-4">
                <Button
                  size="sm"
                  variant={soloDisponibles ? "solid" : "bordered"}
                  color={soloDisponibles ? "success" : "default"}
                  onPress={() => setSoloDisponibles(!soloDisponibles)}
                  className="rounded-full"
                >
                  Solo disponibles ahora
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active filter chips */}
      {hayFiltrosActivos && (
        <div className="flex flex-wrap gap-2 mb-6">
          {busqueda && (
            <Chip
              onClose={() => setBusqueda("")}
              variant="flat"
              color="primary"
              size="sm"
            >
              "{busqueda}"
            </Chip>
          )}
          {categoria && (
            <Chip
              onClose={() => setCategoria("")}
              variant="flat"
              color="secondary"
              size="sm"
            >
              {CATEGORY_LABELS[categoria]}
            </Chip>
          )}
          {soloDisponibles && (
            <Chip
              onClose={() => setSoloDisponibles(false)}
              variant="flat"
              color="success"
              size="sm"
            >
              Disponibles
            </Chip>
          )}
          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" /> Limpiar filtros
          </button>
        </div>
      )}

      {/* Results */}
      {estaCargando ? (
        <TechnicianGridSkeleton count={6} />
      ) : tecnicos.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No encontramos técnicos"
          description="Intenta con otros términos de búsqueda o ajusta los filtros"
          action={
            <Button onPress={limpiarFiltros} color="primary" variant="flat" className="font-bold h-11 bg-brand-blue/10 text-brand-blue px-6 rounded-xl">
              Limpiar búsqueda
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {tecnicos.map((tech, i) => (
              <motion.div
                key={tech.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link to={ROUTES.TECHNICIAN_DETAIL(tech.id)} className="block h-full">
                  <Card
                    className="h-full bg-white border border-gray-100 shadow-brand-sm hover:shadow-brand transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <Avatar src={tech.avatar} name={tech.name} size="md" className="ring-2 ring-brand-orange/20" />
                          {tech.isAvailable && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h2 className="font-bold text-text-primary truncate">{tech.name}</h2>
                            {tech.isVerified ? (
                              <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-brand-orange font-medium">{tech.categoryLabel || CATEGORY_LABELS[tech.category] || tech.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={tech.rating} size="sm" />
                            <span className="text-xs font-bold text-text-primary">{tech.rating}</span>
                            <span className="text-xs text-text-secondary">({tech.reviewCount})</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-text-secondary mt-3 line-clamp-2 leading-relaxed">{tech.bio}</p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {tech.specialties.slice(0, 2).map((s) => (
                          <span key={s} className="text-xs bg-brand-blue/6 text-brand-blue px-2 py-0.5 rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-text-secondary gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{tech.location.split(",")[0]}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tech.responseTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {tech.jobsCompleted} trabajos
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-text-secondary">Tarifa desde</span>
                          <p className="font-black text-brand-blue">{formatCurrency(tech.hourlyRate)}<span className="text-xs font-normal text-text-secondary">/hr</span></p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tech.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {tech.isAvailable ? "Disponible" : "Ocupado"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
