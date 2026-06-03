import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card, CardContent, Avatar, Select, SelectItem } from "@/components/ui/HeroUICompat";
import { User, Mail, Phone, MapPin, ArrowLeft, Save, Briefcase, DollarSign, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore, useUIStore } from "@/store";
import { usePageTitle } from "@/hooks";
import { ROUTES } from "@/constants";
import { useState, useEffect } from "react";
import { technicianService } from "@/services";

const editSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  location: z.string().optional(),
  // Campos de técnicos
  category: z.string().optional(),
  hourlyRate: z.any().optional(),
  bio: z.string().optional(),
  specialties: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

export default function ProfileEditPage() {
  usePageTitle("Editar Perfil");
  const { user, updateUser } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ key: string; label: string; icon: string }[]>([]);

  useEffect(() => {
    technicianService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error al cargar categorías:", err);
      });
  }, []);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      location: user?.location ?? "",
      category: "",
      hourlyRate: 0,
      bio: "",
      specialties: "",
    },
  });

  const watchCategory = watch("category");

  useEffect(() => {
    if (user) {
      const baseData = {
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        location: user.location ?? "",
        category: "",
        hourlyRate: 0,
        bio: "",
        specialties: "",
      };

      if (user.role === "technician") {
        setLoading(true);
        technicianService.getOwnProfile()
          .then((profile) => {
            if (profile) {
              reset({
                ...baseData,
                category: profile.category,
                hourlyRate: profile.hourlyRate,
                bio: profile.bio || "",
                specialties: (profile.specialties || []).join(", "),
              });
            } else {
              reset(baseData);
            }
          })
          .catch((err) => {
            console.error("Error al cargar el perfil de técnico:", err);
            reset(baseData);
          })
          .finally(() => setLoading(false));
      } else {
        reset(baseData);
      }
    }
  }, [user, reset]);

  const onSubmit = async (data: EditForm) => {
    setLoading(true);
    try {
      if (user?.role === "technician") {
        const specialtiesArray = data.specialties
          ? data.specialties.split(",").map((s) => s.trim()).filter(Boolean)
          : [];

        const updatedTech = await technicianService.updateOwnProfile({
          name: data.name,
          phone: data.phone,
          location: data.location,
          category: data.category as any,
          hourlyRate: Number(data.hourlyRate || 0),
          bio: data.bio,
          specialties: specialtiesArray,
        } as any);

        updateUser({
          name: updatedTech.name,
          phone: data.phone,
          location: updatedTech.location,
        });
      } else {
        updateUser(data);
      }

      addToast({
        type: "success",
        title: "Perfil actualizado",
        message: "Los cambios han sido guardados con éxito en la base de datos.",
      });

      navigate(ROUTES.PROFILE);
    } catch (error: any) {
      console.error("Error al guardar cambios del perfil:", error);
      addToast({
        type: "error",
        title: "Error al guardar cambios",
        message: error.message || "Ocurrió un error inesperado al actualizar.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-brand-blue transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al perfil
      </button>

      <h1 className="text-3xl font-black text-text-primary mb-6">Editar Perfil</h1>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white border border-gray-100 shadow-brand-sm">
          <CardContent className="p-8">
            {/* Sección de Avatar */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <Avatar src={user?.avatar} name={user?.name} className="w-16 h-16 ring-4 ring-brand-orange/20" />
              <div>
                <p className="font-bold text-text-primary">{user?.name}</p>
                <Button size="sm" variant="flat" color="primary" className="mt-2 rounded-lg text-xs font-semibold">
                  Cambiar foto
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                {...register("name")}
                label="Nombre completo"
                startContent={<User className="w-4 h-4 text-text-secondary" />}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
                variant="bordered"
                classNames={{ inputWrapper: "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue" }}
              />
              <Input
                {...register("email")}
                type="email"
                label="Correo electrónico"
                startContent={<Mail className="w-4 h-4 text-text-secondary" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                variant="bordered"
                classNames={{ inputWrapper: "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue" }}
              />
              <Input
                {...register("phone")}
                type="tel"
                label="Teléfono"
                startContent={<Phone className="w-4 h-4 text-text-secondary" />}
                variant="bordered"
                classNames={{ inputWrapper: "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue" }}
              />
              <Input
                {...register("location")}
                label="Ubicación"
                placeholder="Ciudad, País"
                startContent={<MapPin className="w-4 h-4 text-text-secondary" />}
                variant="bordered"
                classNames={{ inputWrapper: "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue" }}
              />

              {/* Campos específicos de Técnico */}
              {user?.role === "technician" && (
                <div className="space-y-5 pt-5 mt-5 border-t border-gray-100">
                  <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-purple" /> Información Profesional
                  </h3>

                  <Select
                    label="Categoría Profesional"
                    placeholder="Selecciona tu categoría"
                    variant="bordered"
                    classNames={{ trigger: "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue" }}
                    startContent={<Briefcase className="w-4 h-4 text-text-secondary" />}
                    selectedKey={watchCategory}
                    onSelectionChange={(val) => {
                      const key = typeof val === "object" && val !== null ? Array.from(val as any)[0] : val;
                      setValue("category", (key as string) || "", { shouldDirty: true });
                    }}
                  >
                    {categories.map((cat) => (
                      <SelectItem id={cat.key} key={cat.key} textValue={cat.label} className="rounded-lg text-sm p-2 cursor-pointer hover:bg-gray-50 focus:bg-brand-blue/5 outline-none">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    {...register("hourlyRate")}
                    type="number"
                    label="Tarifa por hora"
                    placeholder="25"
                    startContent={<DollarSign className="w-4 h-4 text-text-secondary" />}
                    isInvalid={!!errors.hourlyRate}
                    errorMessage={errors.hourlyRate?.message ? String(errors.hourlyRate.message) : undefined}
                    variant="bordered"
                    classNames={{ inputWrapper: "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue" }}
                  />

                  <Input
                    {...register("specialties")}
                    label="Especialidades (separadas por comas)"
                    placeholder="Grifería, Fugas, Calentadores de agua"
                    startContent={<Sparkles className="w-4 h-4 text-text-secondary" />}
                    variant="bordered"
                    classNames={{ inputWrapper: "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue" }}
                  />

                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-text-secondary" />
                      Biografía Profesional
                    </label>
                    <textarea
                      {...register("bio")}
                      placeholder="Cuéntale a tus clientes sobre tu experiencia, certificaciones y el tipo de servicios que ofreces con excelencia..."
                      rows={4}
                      className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-blue hover:border-gray-300 transition-all bg-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="flat"
                  onPress={() => navigate(-1)}
                  className="flex-1 bg-gray-100 text-text-secondary font-bold h-12 rounded-xl hover:bg-gray-200 transition-all"
                  isDisabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="flex-1 bg-brand-gradient text-white font-bold h-12 rounded-xl shadow-brand hover:shadow-brand-lg transition-all"
                  startContent={<Save className="w-4 h-4" />}
                >
                  Guardar cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
