import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "@/components/ui/HeroUICompat";
import { Bell, MessageSquare, LogOut, User, Settings, Menu as MenuIcon, X, LayoutDashboard, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import logoImg from "@/assets/logo/logo.png";
import clsx from "clsx";
import { chatService } from "@/services";

const NAV_LINKS = [
  { label: "Inicio", href: ROUTES.HOME },
  { label: "Técnicos", href: ROUTES.TECHNICIANS },
  { label: "Servicios", href: ROUTES.SERVICES },
  { label: "Solicitudes", href: ROUTES.REQUESTS },
  { label: "Dashboard", href: ROUTES.DASHBOARD },
];

export function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      chatService.getConversations(user.id)
        .then((convs) => {
          const total = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadMessages(total);
        })
        .catch((err) => console.error("Error fetching conversations in Navbar:", err));
    } else {
      setUnreadMessages(0);
    }
  }, [isAuthenticated, user?.id, pathname]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const isHome = pathname === "/";

  const visibleLinks = NAV_LINKS.filter(
    (link) => (link.href !== ROUTES.REQUESTS && link.href !== ROUTES.DASHBOARD) || isAuthenticated
  );

  return (
    <nav className={clsx(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 border-b",
      isScrolled || !isHome
        ? "bg-white/95 backdrop-blur-md border-gray-100 shadow-brand-sm"
        : "bg-transparent border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={clsx(
              "sm:hidden p-1 rounded-md transition-colors",
              isScrolled || !isHome ? "text-brand-purple hover:bg-gray-50" : "text-white hover:bg-white/10"
            )}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>

          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="PlatJob"
              className={clsx(
                "h-15 w-auto object-contain transition-all",
                !isScrolled && isHome && "brightness-0 invert"
              )}
            />
          </Link>
        </div>

        {/* Center: Desktop Nav Links */}
        <div className="hidden sm:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === link.href
                  ? (isScrolled || !isHome ? "text-brand-purple bg-brand-purple/8" : "text-white bg-white/20")
                  : (isScrolled || !isHome ? "text-text-secondary hover:text-brand-purple hover:bg-gray-50" : "text-white/80 hover:text-white hover:bg-white/10")
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Chat icon */}
              <Badge content={String(unreadMessages)} color="danger" size="sm">
                <Link to={ROUTES.CHAT}>
                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    className={clsx(
                      "transition-colors",
                      isScrolled || !isHome ? "text-text-secondary hover:text-brand-purple" : "text-white/80 hover:text-white"
                    )}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </Link>
              </Badge>

              {/* Notifications */}
              <Badge content="0" color="danger" size="sm">
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  className={clsx(
                    "transition-colors",
                    isScrolled || !isHome ? "text-text-secondary hover:text-brand-purple" : "text-white/80 hover:text-white"
                  )}
                >
                  <Bell className="w-5 h-5" />
                </Button>
              </Badge>

              {/* User dropdown */}
              <Dropdown>
                <DropdownTrigger>
                  <Avatar
                    src={user?.avatar}
                    name={user?.name}
                    size="xs"
                    className="cursor-pointer ring-2 ring-brand-orange/20 hover:ring-brand-orange/50 transition-all"
                  />
                </DropdownTrigger>
                <DropdownPopover placement="bottom end" className="bg-white shadow-brand-lg rounded-2xl border border-gray-100 min-w-[260px] p-2">
                  <DropdownMenu aria-label="Menú de usuario" className="w-full">
                    <DropdownItem key="user-info" className="h-16 gap-3 opacity-100 cursor-default hover:bg-transparent px-4 mb-2" isReadOnly>
                      <div className="flex flex-col">
                        <p className="font-bold text-sm text-text-primary">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>
                    </DropdownItem>
                    <DropdownItem
                      key="dashboard"
                      startContent={<LayoutDashboard className="w-3.5 h-3.5" />}
                      onPress={() => navigate(ROUTES.DASHBOARD)}
                      className="text-sm"
                    >
                      Panel de Control
                    </DropdownItem>
                    {user?.role === "admin" && (
                      <DropdownItem
                        key="admin"
                        startContent={<Shield className="w-3.5 h-3.5 text-brand-purple" />}
                        onPress={() => navigate(ROUTES.ADMIN)}
                        className="text-sm font-semibold text-brand-purple"
                      >
                        Administración
                      </DropdownItem>
                    )}
                    <DropdownItem
                      key="profile"
                      startContent={<User className="w-3.5 h-3.5" />}
                      onPress={() => navigate(ROUTES.PROFILE)}
                      className="text-sm"
                    >
                      Mi perfil
                    </DropdownItem>
                    <DropdownItem
                      key="settings"
                      startContent={<Settings className="w-3.5 h-3.5" />}
                      onPress={() => navigate(ROUTES.PROFILE_EDIT)}
                      className="text-sm"
                    >
                      Configuración
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      color="danger"
                      startContent={<LogOut className="w-3.5 h-3.5" />}
                      onPress={handleLogout}
                      className="text-sm text-red-500"
                    >
                      Cerrar sesión
                    </DropdownItem>
                  </DropdownMenu>
                </DropdownPopover>
              </Dropdown>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to={ROUTES.LOGIN}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={clsx(
                    "font-semibold border-none hover:bg-white/10",
                    isScrolled || !isHome ? "text-text-secondary hover:text-brand-purple hover:bg-brand-purple/8" : "text-white/80 hover:text-white"
                  )}
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button
                  size="sm"
                  className="bg-brand-gradient text-white font-bold px-4 h-9 rounded-xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all text-xs flex items-center justify-center"
                >
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white z-40 sm:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col p-4 gap-2">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={clsx(
                  "block w-full py-3 px-4 rounded-xl text-base font-medium transition-all",
                  pathname === link.href
                    ? "text-brand-orange bg-brand-orange/8"
                    : "text-text-primary hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full py-3 px-4 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            ) : (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex justify-center items-center w-full py-3 rounded-xl text-base font-semibold border border-brand-purple/20 text-brand-purple hover:bg-brand-purple/5 transition-all text-center"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex justify-center items-center w-full py-3 rounded-xl text-base font-bold bg-brand-gradient text-white shadow-brand hover:shadow-brand-lg transition-all text-center"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
