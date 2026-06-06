import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Button, 
  Input, 
  Card, 
  CardContent, 
  Separator, 
  TextField, 
  Label, 
  FieldError,
  Spinner
} from "@/components/ui/HeroUICompat";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import { usePageTitle } from "@/hooks";
import logoIcon from "@/assets/logo/logo.png";
import logoTexto from "@/assets/logo/logo-texto.png";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  usePageTitle("Iniciar Sesión");
  const [showPassword, setShowPassword] = useState(false);
  const [suspensionData, setSuspensionData] = useState<{ reason: string; suspendedUntil: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [canRetry, setCanRetry] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from ?? ROUTES.HOME;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({ 
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  useEffect(() => {
    if (!suspensionData?.suspendedUntil) return;
    
    const targetDate = new Date(suspensionData.suspendedUntil).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeRemaining("00:00:00");
        setCanRetry(true);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysStr = d > 0 ? `${d}d ` : '';
        setTimeRemaining(`${daysStr}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [suspensionData]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (error: any) {
      if (error.errors && error.errors[0]?.code === 'USER_SUSPENDED') {
        setSuspensionData({
          reason: error.errors[0].reason,
          suspendedUntil: error.errors[0].suspendedUntil
        });
        setCanRetry(false);
      } else {
        setError("email", { message: error.message || "Credenciales inválidas." });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md relative z-10"
    >
      <Card className="bg-white/95 backdrop-blur-xl shadow-brand-xl border-0">
        <CardContent className="p-8 space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <img src={logoIcon} alt="Icono PlatJob" className="h-10 w-auto object-contain" />
            <img src={logoTexto} alt="PlatJob" className="h-6 w-auto object-contain" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">Bienvenido de nuevo</h1>
            <p className="text-text-secondary text-sm mt-1">Accede a tu cuenta PlatJob</p>
          </div>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField isInvalid={!!errors.email} className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-text-primary">Correo electrónico</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Mail className="w-4 h-4 text-text-secondary" />
                    </div>
                    <Input
                      {...field}
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10 w-full h-10 rounded-lg border border-gray-200 hover:border-brand-blue focus:border-brand-blue outline-none transition-all"
                    />
                  </div>
                  <FieldError className="text-xs text-red-500">{errors.email?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField isInvalid={!!errors.password} className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-text-primary">Contraseña</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Lock className="w-4 h-4 text-text-secondary" />
                    </div>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 w-full h-10 rounded-lg border border-gray-200 hover:border-brand-blue focus:border-brand-blue outline-none transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4 text-text-secondary" />
                        : <Eye className="w-4 h-4 text-text-secondary" />
                      }
                    </button>
                  </div>
                  <FieldError className="text-xs text-red-500">{errors.password?.message}</FieldError>
                </TextField>
              )}
            />

            <div className="flex justify-end">
              <button type="button" className="text-xs text-brand-orange hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-gradient text-white font-semibold h-12 rounded-xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              isDisabled={isLoading}
            >
              {isLoading && <Spinner size="sm" color="current" />}
              <span>Iniciar sesión</span>
            </Button>
          </form>

          {/* Demo hint */}
          <div className="bg-brand-blue/5 border border-brand-blue/15 rounded-xl p-3 text-xs text-center text-text-secondary">
            🔐 Demo: <strong>carlos@example.com</strong> / cualquier contraseña
          </div>

          <p className="text-center text-sm text-text-secondary">
            ¿No tienes cuenta?{" "}
            <Link to={ROUTES.REGISTER} className="text-brand-orange font-semibold hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Suspension Modal */}
      {suspensionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-text-primary mb-2">
              Cuenta Suspendida
            </h3>
            <p className="text-text-secondary mb-6 text-sm">
              Tu acceso a PlatJob ha sido temporalmente restringido.
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3 mb-6">
              <div>
                <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">Motivo</span>
                <span className="text-sm font-medium text-text-primary">{suspensionData.reason}</span>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">Tiempo Restante</span>
                <span className="text-xl font-mono font-black text-red-500 block mt-1">{timeRemaining || "Calculando..."}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {canRetry ? (
                <Button
                  color="primary"
                  className="w-full font-bold shadow-brand bg-brand-gradient h-12 rounded-xl"
                  onClick={() => {
                    setSuspensionData(null);
                    // trigger login attempt again
                    handleSubmit(onSubmit)();
                  }}
                >
                  Volver a intentar
                </Button>
              ) : (
                <Button
                  isDisabled
                  className="w-full font-bold h-12 rounded-xl bg-gray-100 text-gray-400"
                >
                  Bloqueado
                </Button>
              )}
              <Button
                variant="light"
                className="font-semibold text-text-muted"
                onClick={() => setSuspensionData(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
