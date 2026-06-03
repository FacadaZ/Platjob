import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Card, CardContent, Separator, Select, SelectItem } from "@/components/ui/HeroUICompat";
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import { usePageTitle } from "@/hooks";
import logoImg from "@/assets/logo/logo.png";

const registerSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  role: z.enum(["client", "technician"]),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  usePageTitle("Crear Cuenta");
  const [showPassword, setShowPassword] = useState(false);
  const { register: storeRegister, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, setError, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "client" },
  });

  const roleValue = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    try {
      await storeRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
      });
      navigate(ROUTES.HOME);
    } catch (error: any) {
      if (error.message.toLowerCase().includes("correo") || error.message.toLowerCase().includes("email") || error.message.toLowerCase().includes("registrado")) {
        setError("email", { type: "server", message: error.message });
      } else {
        setError("root", { type: "server", message: error.message });
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
        <CardContent className="p-8 space-y-5">
          <div className="flex justify-center">
            <img src={logoImg} alt="PlatJob" className="h-10 w-auto object-contain" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">Crea tu cuenta</h1>
            <p className="text-text-secondary text-sm mt-1">Únete a la comunidad PlatJob</p>
          </div>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {errors.root && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.root.message}
              </div>
            )}
            <Input
              {...register("name")}
              label="Nombre completo"
              placeholder="Carlos Mendoza"
              startContent={<User className="w-4 h-4 text-text-secondary" />}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              variant="bordered"
            />

            <Input
              {...register("email")}
              type="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              startContent={<Mail className="w-4 h-4 text-text-secondary" />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              variant="bordered"
            />

            <Input
              {...register("phone")}
              type="tel"
              label="Teléfono (opcional)"
              placeholder="+57 300 123 4567"
              startContent={<Phone className="w-4 h-4 text-text-secondary" />}
              variant="bordered"
            />

            <Select
              selectedKey={roleValue}
              onSelectionChange={(val) => {
                const key = typeof val === "object" && val !== null ? Array.from(val as any)[0] : val;
                setValue("role", (key as any) || "client", { shouldValidate: true });
              }}
              label="Tipo de cuenta"
              placeholder="Selecciona tu perfil"
              variant="bordered"
              isInvalid={!!errors.role}
              errorMessage={errors.role?.message}
              startContent={<User className="w-4 h-4 text-text-secondary" />}
            >
              <SelectItem id="client" key="client" textValue="Soy cliente — busco técnicos" className="rounded-lg text-sm p-2 cursor-pointer hover:bg-gray-50 focus:bg-brand-blue/5 outline-none">
                Soy cliente — busco técnicos
              </SelectItem>
              <SelectItem id="technician" key="technician" textValue="Soy técnico — ofrezco servicios" className="rounded-lg text-sm p-2 cursor-pointer hover:bg-gray-50 focus:bg-brand-blue/5 outline-none">
                Soy técnico — ofrezco servicios
              </SelectItem>
            </Select>

            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              label="Contraseña"
              placeholder="••••••••"
              startContent={<Lock className="w-4 h-4 text-text-secondary" />}
              endContent={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                </button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              variant="bordered"
            />

            <Input
              {...register("confirmPassword")}
              type={showPassword ? "text" : "password"}
              label="Confirmar contraseña"
              placeholder="••••••••"
              startContent={<Lock className="w-4 h-4 text-text-secondary" />}
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
              variant="bordered"
            />

            <Button
              type="submit"
              className="w-full bg-brand-gradient text-white font-semibold h-12 rounded-xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all"
              isLoading={isLoading}
              size="lg"
            >
              Crear cuenta gratis
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary">
            ¿Ya tienes cuenta?{" "}
            <Link to={ROUTES.LOGIN} className="text-brand-orange font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
