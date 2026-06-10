import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent, Chip } from "@/components/ui/HeroUICompat";
import { motion } from "framer-motion";
import { 
  Zap, Wrench, Hammer, PaintBucket, Key, Wind, Leaf, Flame, Sparkles, HardHat, HelpCircle, ArrowRight, Briefcase 
} from "lucide-react";
import { usePageTitle } from "@/hooks";
import { ROUTES } from "@/constants";
import { technicianService } from "@/services";

const CATEGORY_DETAILS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; description: string; price: string }> = {
  electricista: { icon: Zap, color: "bg-yellow-100 text-yellow-600", description: "Instalaciones eléctricas, tableros, iluminación y más.", price: "Desde $45.000/hr" },
  plomero: { icon: Wrench, color: "bg-blue-100 text-blue-600", description: "Reparación de fugas, sanitarios y tuberías.", price: "Desde $40.000/hr" },
  carpintero: { icon: Hammer, color: "bg-amber-100 text-amber-700", description: "Muebles a medida, pisos y estructuras de madera.", price: "Desde $50.000/hr" },
  pintor: { icon: PaintBucket, color: "bg-purple-100 text-purple-600", description: "Pintura de interiores, exteriores y texturas.", price: "Desde $35.000/hr" },
  cerrajero: { icon: Key, color: "bg-gray-100 text-gray-700", description: "Apertura de puertas, cerraduras digitales y más.", price: "Desde $55.000/hr" },
  climatizacion: { icon: Wind, color: "bg-cyan-100 text-cyan-600", description: "Instalación y mantenimiento de aires acondicionados.", price: "Desde $60.000/hr" },
  jardinero: { icon: Leaf, color: "bg-green-100 text-green-600", description: "Diseño de jardines, poda y mantenimiento.", price: "Desde $28.000/hr" },
  soldador: { icon: Flame, color: "bg-red-100 text-red-600", description: "Soldadura en estructura metálica y rejas.", price: "Desde $48.000/hr" },
  albanil: { icon: HardHat, color: "bg-orange-100 text-orange-700", description: "Trabajos de albañilería, colocación de ladrillos y reformas.", price: "Desde $42.000/hr" },
  limpieza: { icon: Sparkles, color: "bg-teal-100 text-teal-600", description: "Servicios de limpieza profunda para casas y oficinas.", price: "Desde $25.000/hr" },
};

export default function ServicesPage() {
  usePageTitle("Servicios");
  const [categories, setCategories] = useState<{ key: string; label: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    technicianService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error al cargar categorías desde el backend:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <Chip color="secondary" variant="flat" size="sm" className="mb-3 font-medium">Catálogo</Chip>
        <h1 className="text-4xl font-black text-text-primary">
          Todos nuestros <span className="gradient-text-orange">servicios</span>
        </h1>
        <p className="text-text-secondary mt-3 max-w-xl mx-auto">
          Profesionales verificados para cada necesidad de tu hogar o empresa
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => {
            const keyLower = cat.key?.toLowerCase() || "";
            const labelLower = cat.label?.toLowerCase() || "";
            const details = CATEGORY_DETAILS[keyLower] || CATEGORY_DETAILS[labelLower] || {
              icon: Briefcase,
              color: "bg-gray-100 text-gray-600",
              description: `Servicios profesionales de ${cat.label}.`,
              price: "Consultar tarifa",
            };
            const Icon = details.icon;
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -6 }}
              >
                <Card className="h-full bg-white border border-gray-100 shadow-brand-sm hover:shadow-brand transition-shadow">
                  <CardContent className="p-6 flex flex-col">
                    <div className={`w-14 h-14 rounded-2xl ${details.color} flex items-center justify-center mb-4 text-xl`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h2 className="text-lg font-bold text-text-primary mb-2">{cat.label}</h2>
                    <p className="text-sm text-text-secondary leading-relaxed flex-1">{details.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-blue">{details.price}</span>
                      <Link to={`${ROUTES.TECHNICIANS}?category=${cat.key}`}>
                        <Button
                          size="sm"
                          className="bg-brand-gradient text-white font-bold rounded-xl text-xs h-9 px-4 shadow-brand hover:shadow-brand-lg transition-all"
                          endContent={<ArrowRight className="w-3 h-3" />}
                        >
                          Ver técnicos
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
