import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent, Avatar, Chip } from "@/components/ui/HeroUICompat";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Zap, Wrench, Hammer, PaintBucket, Key, Wind, Leaf, Flame,
  ArrowRight, Shield, Star, CheckCircle, TrendingUp, Clock
} from "lucide-react";
import { usePageTitle } from "@/hooks";
import { ROUTES, CATEGORY_LABELS } from "@/constants";
import { technicianService } from "@/services";
import { StarRating } from "@/components/ui/StarRating";
import { formatCurrency } from "@/utils";
import type { Technician } from "@/types";
import LogoSlogan from "@/assets/logo/slogan.png";
import { HeroSequenceCanvas } from "@/features/home/components/HeroSequenceCanvas";
import { HeroConnectionsCanvas } from "@/features/home/components/HeroConnectionsCanvas";

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, { icon: any, color: string }> = {
  electrician: { icon: Zap, color: "bg-brand-purple/10 text-brand-purple" },
  plumber: { icon: Wrench, color: "bg-brand-purple/10 text-brand-purple" },
  carpenter: { icon: Hammer, color: "bg-brand-purple/10 text-brand-purple" },
  painter: { icon: PaintBucket, color: "bg-brand-purple/10 text-brand-purple" },
  locksmith: { icon: Key, color: "bg-brand-purple/10 text-brand-purple" },
  hvac: { icon: Wind, color: "bg-brand-purple/10 text-brand-purple" },
  gardener: { icon: Leaf, color: "bg-brand-purple/10 text-brand-purple" },
  welder: { icon: Flame, color: "bg-brand-purple/10 text-brand-purple" },
};

export const STATS = [
  { label: "Técnicos verificados", value: "2,500+", icon: Shield },
  { label: "Trabajos completados", value: "18,000+", icon: CheckCircle },
  { label: "Calificación promedio", value: "4.8★", icon: Star },
  { label: "Tiempo de respuesta", value: "< 15 min", icon: Clock },
];

export default function HomePage() {
  usePageTitle("Inicio");
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const techniciansRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = [statsRef, categoriesRef, techniciansRef];
    const ctxs = sections.map((ref) =>
      gsap.context(() => {
        // Reveal animations for text
        gsap.fromTo(
          ".will-reveal",
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.7, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
          }
        );

        // Continuous floating animation for icons
        gsap.to(".floating-service-icon", {
          y: "random(-20, 20)",
          x: "random(-20, 20)",
          rotation: "random(-15, 15)",
          duration: "random(4, 8)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }, ref)
    );

    // Mouse follow interaction for the hero section
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 40;
      const yPos = (clientY / window.innerHeight - 0.5) * 40;

      gsap.to(".mouse-blob", {
        x: xPos * 1.5,
        y: yPos * 1.5,
        duration: 2,
        ease: "power2.out"
      });

      gsap.to(".floating-service-icon", {
        x: (i) => xPos * (0.5 + i * 0.1),
        y: (i) => yPos * (0.5 + i * 0.1),
        duration: 1.5,
        ease: "power1.out"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      ctxs.forEach((ctx) => ctx.revert());
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const [featuredTechs, setFeaturedTechs] = useState<Technician[]>([]);
  const [categories, setCategories] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    technicianService.getCategories().then((data) => {
      setCategories(data.slice(0, 8));
    });

    technicianService.getAll({ isAvailable: true }).then((data) => {
      const sortedByRating = [...data].sort((a, b) => b.rating - a.rating);
      setFeaturedTechs(sortedByRating.slice(0, 3));
    });
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className="relative bg-brand-purple text-white min-h-[100vh] flex items-center pt-20 pb-24 overflow-hidden hero-section"
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,#7C3AED_0%,#4C1D95_45%,#2E1065_100%)]" />
        <HeroSequenceCanvas frameCount={2} />
        <HeroConnectionsCanvas />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          {/* Floating Service Icons */}
          {/* Dense floating icons across screen — higher opacity, less blur */}
          <div className="absolute top-[5%] left-[5%] floating-service-icon opacity-60">
            <Wrench className="w-12 h-12 text-white" />
          </div>
          <div className="absolute top-[8%] left-[20%] floating-service-icon opacity-50">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="absolute top-[12%] left-[35%] floating-service-icon opacity-45">
            <Hammer className="w-12 h-12 text-white" />
          </div>
          <div className="absolute top-[10%] right-[18%] floating-service-icon opacity-48">
            <PaintBucket className="w-11 h-11 text-white" />
          </div>
          <div className="absolute top-[18%] right-[30%] floating-service-icon opacity-40">
            <Leaf className="w-12 h-12 text-white" />
          </div>
          <div className="absolute top-[22%] left-[8%] floating-service-icon opacity-45">
            <Wind className="w-10 h-10 text-white" />
          </div>
          <div className="absolute top-[28%] left-[22%] floating-service-icon opacity-48">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <div className="absolute top-[30%] right-[22%] floating-service-icon opacity-42">
            <Zap className="w-9 h-9 text-white" />
          </div>
          <div className="absolute top-[38%] left-[12%] floating-service-icon opacity-44">
            <Hammer className="w-10 h-10 text-white" />
          </div>
          <div className="absolute top-[44%] right-[14%] floating-service-icon opacity-46">
            <PaintBucket className="w-9 h-9 text-white" />
          </div>
          <div className="absolute top-[50%] left-[30%] floating-service-icon opacity-40">
            <Leaf className="w-12 h-12 text-white" />
          </div>
          <div className="absolute top-[56%] right-[36%] floating-service-icon opacity-38">
            <Wind className="w-8 h-8 text-white" />
          </div>
          <div className="absolute bottom-[64%] left-[42%] floating-service-icon opacity-42">
            <Wrench className="w-9 h-9 text-white" />
          </div>
          <div className="absolute bottom-[54%] right-[8%] floating-service-icon opacity-45">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="absolute bottom-[44%] left-[18%] floating-service-icon opacity-40">
            <Hammer className="w-11 h-11 text-white" />
          </div>
          <div className="absolute bottom-[34%] right-[26%] floating-service-icon opacity-48">
            <PaintBucket className="w-9 h-9 text-white" />
          </div>
          <div className="absolute bottom-[24%] left-[48%] floating-service-icon opacity-42">
            <Leaf className="w-11 h-11 text-white" />
          </div>
          <div className="absolute bottom-[12%] right-[44%] floating-service-icon opacity-44">
            <Wind className="w-8 h-8 text-white" />
          </div>
          <div className="absolute left-1/2 top-1/4 floating-service-icon opacity-46">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <div className="absolute right-1/3 top-2/3 floating-service-icon opacity-40">
            <Zap className="w-9 h-9 text-white" />
          </div>


          <div className="absolute top-40 left-1/4 w-2 h-2 bg-brand-purple rounded-full animate-pulse" />
          <div className="absolute top-60 right-1/4 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-40 left-1/3 w-1 h-1 bg-brand-purple/60 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 hero-content-wrapper">
          <div className="max-w-3xl mx-auto text-center">
            <div className="hero-badge inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
              <span className="text-sm font-medium text-white/90">Plataforma #1 de técnicos en Bolivia</span>
            </div>


            <h1 className="hero-item text-5xl sm:text-7xl font-black leading-tight mb-6 drop-shadow-2xl">
              Técnicos de{" "}
              <span className="text-brand-purple">confianza</span>
              <br />a un toque
            </h1>

            <img
              src={LogoSlogan}
              alt="logo slogan platjob"
              className="hero-item h-12 w-auto object-contain mx-auto mb-4 filter brightness-0 invert"
            />

            <p className="hero-item text-lg text-white/75 mb-10 max-w-2xl mx-auto">
              Conectamos clientes con técnicos profesionales verificados. Electricistas, plomeros, carpinteros y más — disponibles en minutos.
            </p>

            <div className="hero-item flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={ROUTES.TECHNICIANS} className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  className="w-full bg-brand-purple text-white font-bold px-10 h-14 rounded-2xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all text-base"
                  endContent={<ArrowRight className="w-5 h-5" />}
                >
                  Encontrar técnicos
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER} className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  variant="flat"
                  className="w-full bg-white/20 backdrop-blur-md text-white font-bold px-10 h-14 rounded-2xl border border-white/30 hover:bg-white/30 transition-all text-base"
                >
                  Ofrece tus servicios
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </section>



      {/* ── Categories ───────────────────────────────────────── */}
      <section ref={categoriesRef as React.RefObject<HTMLElement>} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 will-reveal">
            <Chip color="secondary" variant="flat" size="sm" className="mb-3 font-medium">
              Categorías
            </Chip>
            <h2 className="text-4xl font-black text-text-primary">
              ¿Qué servicio{" "}
              <span className="text-brand-purple">necesitas?</span>
            </h2>
            <p className="text-text-secondary mt-3 max-w-xl mx-auto">
              Explora nuestras categorías de técnicos especializados y encuentra el profesional ideal para tu proyecto
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(({ key, label }, index) => {
              const iconData = ICON_MAP[key] || { icon: Wrench, color: "bg-brand-purple/10 text-brand-purple" };
              const Icon = iconData.icon;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link
                    to={`${ROUTES.TECHNICIANS}?category=${key}`}
                    className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-brand-purple/30 hover:shadow-brand bg-white hover:-translate-y-1 transition-all h-full"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconData.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-text-primary text-center leading-tight">
                      {label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Technicians ─────────────────────────────── */}
      <section ref={techniciansRef as React.RefObject<HTMLElement>} className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 will-reveal">
            <div>
              <Chip color="primary" variant="flat" size="sm" className="mb-3 font-medium">
                Destacados
              </Chip>
              <h2 className="text-4xl font-black text-text-primary">
                Técnicos{" "}
                <span className="text-brand-purple">top-rated</span>
              </h2>
            </div>
            <Link to={ROUTES.TECHNICIANS}>
              <Button
                variant="flat"
                color="primary"
                endContent={<ArrowRight className="w-4 h-4" />}
                className="font-bold h-11 rounded-xl bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition-all hidden sm:flex gap-3 px-6"
              >
                Ver todos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTechs.map((tech, index) => (
              <motion.div
                key={tech.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link to={ROUTES.TECHNICIAN_DETAIL(tech.id)} className="block">
                  <Card
                    className="bg-white border border-gray-100 shadow-brand-sm hover:shadow-brand transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <Avatar
                            src={tech.avatar}
                            name={tech.name}
                            size="md"
                            className="ring-2 ring-brand-purple/20"
                          />
                          {tech.isAvailable && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-text-primary truncate">{tech.name}</h3>
                            {tech.isVerified && (
                              <Shield className="w-4 h-4 text-brand-purple flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-text-secondary">{CATEGORY_LABELS[tech.category]}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={tech.rating} size="sm" />
                            <span className="text-xs font-semibold text-text-primary">{tech.rating}</span>
                            <span className="text-xs text-text-secondary">({tech.reviewCount})</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-text-secondary mt-3 line-clamp-2">{tech.bio}</p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <div>
                          <span className="text-xs text-text-secondary">Desde</span>
                          <p className="font-bold text-brand-purple">{formatCurrency(tech.hourlyRate)}/hr</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                          <TrendingUp className="w-3 h-3" />
                          {tech.jobsCompleted} trabajos
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link to={ROUTES.TECHNICIANS}>
              <Button
                variant="flat"
                color="primary"
                endContent={<ArrowRight className="w-4 h-4" />}
                className="font-semibold"
              >
                Ver todos los técnicos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="py-24 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              ¿Eres técnico profesional?
              <br />
              <span className="text-brand-purple">Únete y gana más</span>
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Accede a cientos de clientes verificados, gestiona tus solicitudes y haz crecer tu negocio con PlatJob.
            </p>
            <div className="flex justify-center">
              <Link to={ROUTES.REGISTER}>
                <Button
                  size="lg"
                  className="bg-brand-purple text-white font-bold px-12 h-14 rounded-2xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all text-base gap-3"
                  endContent={<ArrowRight className="w-5 h-5" />}
                >
                  Registrarme como técnico
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-brand-blue py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-white/50 text-sm text-center">
              © 2025 PlatJob. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
