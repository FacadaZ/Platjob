import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Tabs,
  Tab,
  Avatar,
  Chip,
} from "@/components/ui/HeroUICompat";
import {
  Users,
  Layers,
  Search,
  Slash,
  Trash2,
  Plus,
  Shield,
  Filter,
  UserCheck,
  UserX,
  Edit3,
} from "lucide-react";
import { useUIStore, useAuthStore } from "@/store";
import { adminService, type AdminUser } from "@/services/adminService";
import { technicianService } from "@/services/technicianService";

export default function AdminDashboardPage() {
  const { addToast } = useUIStore();
  const { user: currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<string>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  // Users Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Category Form
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [newKey, setNewKey] = useState<string>("");
  const [newLabel, setNewLabel] = useState<string>("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState<boolean>(false);

  // Load Users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await adminService.listUsers();
      setUsers(data);
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "No se pudieron cargar los usuarios.",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load Categories
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await technicianService.getCategories();
      setCategories(data);
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudieron cargar las categorías.",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  // Block/Unblock User
  const handleToggleBlock = async (user: AdminUser) => {
    const targetStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const statusText = targetStatus === "BLOCKED" ? "bloquear" : "desbloquear";

    if (user.role === "ADMIN") {
      addToast({
        type: "error",
        title: "Acción no permitida",
        message: "No se puede bloquear a un administrador del sistema.",
      });
      return;
    }

    try {
      const updated = await adminService.toggleUserBlock(user.id, targetStatus);
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: updated.status } : u))
      );

      addToast({
        type: "success",
        title: `Usuario ${targetStatus === "BLOCKED" ? "bloqueado" : "desbloqueado"}`,
        message: `La cuenta de ${user.name} ha sido ${targetStatus === "BLOCKED" ? "suspendida" : "reactivada"} con éxito.`,
      });
    } catch (error: any) {
      addToast({
        type: "error",
        title: `Error al ${statusText} usuario`,
        message: error.response?.data?.message || `No se pudo cambiar el estado del usuario.`,
      });
    }
  };

  // Create / Edit Category
  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedKey = newKey.trim().toLowerCase();
    const normalizedLabel = newLabel.trim();

    if (!normalizedKey || !normalizedLabel) {
      addToast({
        type: "error",
        title: "Campos requeridos",
        message: "Por favor, completa todos los campos de la categoría.",
      });
      return;
    }

    const keyRegex = /^[a-z0-9_-]+$/;
    if (!keyRegex.test(normalizedKey)) {
      addToast({
        type: "error",
        title: "Clave inválida",
        message: "La clave debe contener solo letras minúsculas, números, guiones o guiones bajos, sin espacios.",
      });
      return;
    }

    setIsSubmittingCategory(true);
    try {
      if (editingCategoryId) {
        await adminService.updateCategory(editingCategoryId, normalizedKey, normalizedLabel);
        addToast({
          type: "success",
          title: "Categoría actualizada",
          message: `La categoría ha sido actualizada correctamente.`,
        });
      } else {
        await adminService.createCategory(normalizedKey, normalizedLabel);
        addToast({
          type: "success",
          title: "Categoría creada",
          message: `La categoría "${normalizedLabel}" ha sido creada correctamente.`,
        });
      }

      setEditingCategoryId(null);
      setNewKey("");
      setNewLabel("");
      fetchCategories();
    } catch (error: any) {
      addToast({
        type: "error",
        title: editingCategoryId ? "Error al actualizar" : "Error al crear categoría",
        message: error.response?.data?.message || "Ocurrió un error con la categoría.",
      });
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const startEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id);
    setNewKey(cat.key);
    setNewLabel(cat.label);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setNewKey("");
    setNewLabel("");
  };

  // Delete Category
  const handleDeleteCategory = async (id: number, label: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${label}"?`)) {
      return;
    }

    try {
      await adminService.deleteCategory(id);
      addToast({
        type: "success",
        title: "Categoría eliminada",
        message: `La categoría "${label}" fue eliminada del sistema.`,
      });
      fetchCategories();
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Error al eliminar",
        message: error.response?.data?.message || "No se puede eliminar una categoría asociada a perfiles técnicos.",
      });
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalUsersCount = users.length;
  const clientsCount = users.filter((u) => u.role === "CLIENT").length;
  const techniciansCount = users.filter((u) => u.role === "TECHNICIAN").length;
  const categoriesCount = categories.length;

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-brand-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-brand-purple" />
              Panel de Administración
            </h1>
            <p className="text-text-muted mt-1 text-sm sm:text-base">
              Gestiona categorías profesionales de técnicos y controla los accesos y estado de cuentas de usuarios.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-brand-purple/5 border border-brand-purple/10 px-4 py-2 rounded-xl text-sm font-semibold text-brand-purple self-start md:self-auto">
            <span>Rol Activo: Super Admin</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-brand-sm flex items-center gap-4 hover:shadow-brand transition-all duration-200">
            <div className="p-3 bg-brand-purple/10 text-brand-purple rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-text-muted font-medium block">Total Usuarios</span>
              <span className="text-2xl font-bold text-text-primary mt-0.5 block">
                {isLoadingUsers ? "..." : totalUsersCount}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-brand-sm flex items-center gap-4 hover:shadow-brand transition-all duration-200">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-text-muted font-medium block">Clientes</span>
              <span className="text-2xl font-bold text-text-primary mt-0.5 block">
                {isLoadingUsers ? "..." : clientsCount}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-brand-sm flex items-center gap-4 hover:shadow-brand transition-all duration-200">
            <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-text-muted font-medium block">Técnicos</span>
              <span className="text-2xl font-bold text-text-primary mt-0.5 block">
                {isLoadingUsers ? "..." : techniciansCount}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-brand-sm flex items-center gap-4 hover:shadow-brand transition-all duration-200">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-text-muted font-medium block">Categorías</span>
              <span className="text-2xl font-bold text-text-primary mt-0.5 block">
                {isLoadingCategories ? "..." : categoriesCount}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Layout with Tabs */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-brand-md overflow-hidden">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="solid"
            color="primary"
            classNames={{
              tabList: "flex gap-2 p-3 bg-gray-50/80 border-b border-gray-100",
              tab: "font-bold text-sm rounded-xl py-2.5 px-5 cursor-pointer hover:bg-gray-200/50 transition-all",
              panel: "p-6",
            }}
          >
            {/* TAB: USERS */}
            <Tab
              key="users"
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Control de Usuarios</span>
                </div>
              }
            >
              <div className="space-y-6">
                
                {/* Search & Filter Header */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Buscar por nombre o correo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 w-full"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <Filter className="w-4 h-4 text-text-muted" />
                    <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-brand-sm">
                      {["ALL", "CLIENT", "TECHNICIAN", "ADMIN"].map((role) => (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            roleFilter === role
                              ? "bg-brand-purple text-white shadow-brand-sm"
                              : "text-text-secondary hover:bg-gray-50"
                          }`}
                        >
                          {role === "ALL" ? "Todos" : role === "CLIENT" ? "Clientes" : role === "TECHNICIAN" ? "Técnicos" : "Admins"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-brand-sm">
                  <table className="min-w-full divide-y divide-gray-100 text-left">
                    <thead className="bg-gray-55 text-text-secondary text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Rol</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4">Fecha de Registro</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm text-text-primary">
                      {isLoadingUsers ? (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-text-muted">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                              <span>Cargando lista de usuarios...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-text-muted font-medium">
                            No se encontraron usuarios con los filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isBlocked = u.status === "BLOCKED";
                          const isSelf = currentUser?.id === String(u.id);
                          const isAdmin = u.role === "ADMIN";

                          return (
                            <tr key={u.id} className="hover:bg-gray-50/40 transition-all duration-150">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`}
                                    name={u.name}
                                    size="sm"
                                    className="ring-1 ring-gray-100"
                                  />
                                  <div>
                                    <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                                      {u.name}
                                      {isSelf && <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/10">Tú</span>}
                                    </div>
                                    <div className="text-xs text-text-muted font-medium">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Chip
                                  color={
                                    u.role === "ADMIN"
                                      ? "danger"
                                      : u.role === "TECHNICIAN"
                                      ? "warning"
                                      : "primary"
                                  }
                                  variant="flat"
                                  size="sm"
                                  className="font-bold text-[10px]"
                                >
                                  {u.role === "ADMIN" ? "Administrador" : u.role === "TECHNICIAN" ? "Técnico" : "Cliente"}
                                </Chip>
                              </td>
                              <td className="px-6 py-4">
                                <Chip
                                  color={isBlocked ? "danger" : "success"}
                                  variant="dot"
                                  size="sm"
                                  className="font-semibold text-xs"
                                >
                                  {isBlocked ? "Suspendida" : "Activa"}
                                </Chip>
                              </td>
                              <td className="px-6 py-4 text-text-muted text-xs font-semibold">
                                {new Date(u.createdAt).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isAdmin ? (
                                  <Button
                                    size="sm"
                                    variant="light"
                                    className="cursor-not-allowed opacity-40 font-semibold"
                                    isDisabled
                                    startContent={<Slash className="w-3 h-3" />}
                                  >
                                    Protegida
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant={isBlocked ? "flat" : "bordered"}
                                    color={isBlocked ? "success" : "danger"}
                                    onClick={() => handleToggleBlock(u)}
                                    className="font-bold text-xs shadow-brand-sm"
                                    startContent={
                                      isBlocked ? (
                                        <UserCheck className="w-3.5 h-3.5" />
                                      ) : (
                                        <UserX className="w-3.5 h-3.5" />
                                      )
                                    }
                                  >
                                    {isBlocked ? "Habilitar" : "Suspender"}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tab>

            {/* TAB: CATEGORIES */}
            <Tab
              key="categories"
              title={
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Gestión de Categorías</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Form Panel */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 self-start">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    {editingCategoryId ? (
                      <><Edit3 className="w-5 h-5 text-brand-purple" /> Editar Categoría</>
                    ) : (
                      <><Plus className="w-5 h-5 text-brand-purple" /> Nueva Categoría</>
                    )}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 font-medium">
                    {editingCategoryId ? "Actualiza los datos de la categoría profesional." : "Añade una nueva especialidad profesional. La clave se autocompletará en minúsculas y sin espacios."}
                  </p>

                  <form onSubmit={handleSubmitCategory} className="space-y-4 mt-6">
                    <div>
                      <Input
                        label="Nombre (Etiqueta)"
                        placeholder="ej. Jardinero"
                        value={newLabel}
                        onChange={(e) => {
                          setNewLabel(e.target.value);
                          // Auto-generate key from label for premium UX
                          if (!newKey) {
                            setNewKey(
                              e.target.value
                                .trim()
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "") // remove accents
                            );
                          }
                        }}
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <Input
                        label="Clave (ID único)"
                        placeholder="ej. jardinero"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                        className="w-full font-mono text-sm"
                        required
                      />
                      <span className="text-[10px] text-text-muted mt-1 block leading-tight font-medium">
                        Debe ser única y solo contener caracteres alfanuméricos o guiones (ej. climatizacion).
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        color="primary"
                        className="flex-1 font-bold shadow-brand bg-brand-gradient text-white rounded-xl h-11"
                        isDisabled={isSubmittingCategory}
                        isLoading={isSubmittingCategory}
                      >
                        {editingCategoryId ? "Guardar Cambios" : "Registrar Categoría"}
                      </Button>
                      {editingCategoryId && (
                        <Button
                          type="button"
                          variant="flat"
                          color="default"
                          className="font-bold rounded-xl h-11 px-4 bg-gray-200 text-gray-700"
                          onClick={cancelEditCategory}
                          isDisabled={isSubmittingCategory}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Right List Panel */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-purple" />
                    Categorías Profesionales Registradas
                  </h3>

                  <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-brand-sm">
                    <table className="min-w-full divide-y divide-gray-100 text-left">
                      <thead className="bg-gray-55 text-text-secondary text-xs uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Etiqueta</th>
                          <th className="px-6 py-4">Clave</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100 text-sm text-text-primary">
                        {isLoadingCategories ? (
                          <tr>
                            <td colSpan={4} className="text-center py-10 text-text-muted">
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                                <span>Cargando categorías...</span>
                              </div>
                            </td>
                          </tr>
                        ) : categories.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12 text-text-muted font-medium">
                              No hay categorías registradas en la base de datos.
                            </td>
                          </tr>
                        ) : (
                          categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50/40 transition-all duration-150">
                              <td className="px-6 py-4 font-mono text-xs text-text-muted font-bold">
                                #{cat.id}
                              </td>
                              <td className="px-6 py-4 font-bold text-text-primary">
                                {cat.label}
                              </td>
                              <td className="px-6 py-4">
                                <Chip variant="flat" size="sm" className="font-mono text-xs font-semibold">
                                  {cat.key}
                                </Chip>
                              </td>
                              <td className="px-6 py-4 text-right flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="light"
                                  color="primary"
                                  isIconOnly
                                  onClick={() => startEditCategory(cat)}
                                  className="text-brand-purple hover:bg-brand-purple/10 rounded-xl"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  isIconOnly
                                  onClick={() => handleDeleteCategory(cat.id, cat.label)}
                                  className="text-red-500 hover:bg-red-50/50 rounded-xl"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </Tab>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
