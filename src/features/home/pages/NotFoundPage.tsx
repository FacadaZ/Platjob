import { Link } from "react-router-dom";
import { Button } from "@/components/ui/HeroUICompat";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants";
import { usePageTitle } from "@/hooks";

export default function NotFoundPage() {
  usePageTitle("Página no encontrada");
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-[120px] font-black leading-none gradient-text-orange mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-3">Página no encontrada</h1>
        <p className="text-white/60 mb-10">
          Lo sentimos, la página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to={ROUTES.HOME}>
            <Button
              className="bg-brand-orange text-white font-bold px-6 rounded-xl"
              startContent={<Home className="w-4 h-4" />}
            >
              Ir al inicio
            </Button>
          </Link>
          <Button
            variant="bordered"
            className="border-white/30 text-white font-semibold px-6 rounded-xl"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={() => history.back()}
          >
            Volver
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
