import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Car, Menu, X, Search, PlusCircle, User, LayoutDashboard,
  LogOut, Bell, ChevronDown, Settings, BookOpen, Home, Sun, Moon, Route,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isDriver, isAdmin, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Déconnecté", description: "À bientôt !" });
    navigate("/");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const navLinks = [
    { to: "/recherche", label: "Rechercher", icon: Search, show: !isAdmin },
    { to: "/admin", label: "Admin", icon: LayoutDashboard, show: isAdmin },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-foreground">Covoit<span className="text-primary">Facile</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Bouton Home */}
          {!isAdmin && (
            <Link to="/">
              <Button
                variant={location.pathname === "/" ? "default" : "ghost"}
                size="icon"
                title="Accueil"
                aria-label="Accueil"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}

          {/* Publier trajet visible pour tous si non-admin et non-conducteur connecté → visible dans nav pour conducteur */}
          {isDriver && (
            <Link to="/publier">
              <Button
                variant={location.pathname === "/publier" ? "default" : "secondary"}
                size="sm"
                className="gap-2 ml-1"
              >
                <PlusCircle className="h-4 w-4" />
                Publier un trajet
              </Button>
            </Link>
          )}

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            aria-label="Basculer le thème"
            className="ml-1"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated ? (
            <div className="ml-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-xs font-bold text-primary">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-sm max-w-[120px] truncate">{user?.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-primary capitalize">{user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer gap-2">
                      <Home className="h-4 w-4" />
                      Accueil
                    </DropdownMenuItem>
                  )}
                  {isDriver && (
                    <DropdownMenuItem onClick={() => navigate("/publier")} className="cursor-pointer gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Publier un trajet
                    </DropdownMenuItem>
                  )}
                  {isDriver && (
                    <DropdownMenuItem onClick={() => navigate("/mes-trajets")} className="cursor-pointer gap-2">
                      <Route className="h-4 w-4" />
                      Mes trajets
                    </DropdownMenuItem>
                  )}
                  {isDriver && (
                    <DropdownMenuItem onClick={() => navigate("/mes-reservations")} className="cursor-pointer gap-2">
                      <BookOpen className="h-4 w-4" />
                      Réservations reçues
                    </DropdownMenuItem>
                  )}
                  {!isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/reservations")} className="cursor-pointer gap-2">
                      <BookOpen className="h-4 w-4" />
                      Mes réservations
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="gap-2 ml-2" onClick={() => navigate("/login")}>
              <User className="h-4 w-4" />
              Connexion
            </Button>
          )}
        </nav>

        {/* Mobile: dark mode + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Basculer le thème">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-2">
          {!isAdmin && (
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                Accueil
              </Button>
            </Link>
          )}
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 border-t mt-2 pt-3">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-primary capitalize mt-1">{user?.role}</p>
              </div>
              {isDriver && (
                <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => { navigate("/publier"); setMobileOpen(false); }}>
                  <PlusCircle className="h-4 w-4" />
                  Publier un trajet
                </Button>
              )}
              {isDriver && (
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { navigate("/mes-trajets"); setMobileOpen(false); }}>
                  <Route className="h-4 w-4" />
                  Mes trajets
                </Button>
              )}
              {isDriver && (
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { navigate("/mes-reservations"); setMobileOpen(false); }}>
                  <BookOpen className="h-4 w-4" />
                  Réservations reçues
                </Button>
              )}
              {!isAdmin && (
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { navigate("/reservations"); setMobileOpen(false); }}>
                  <BookOpen className="h-4 w-4" />
                  Mes réservations
                </Button>
              )}
              <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </>
          ) : (
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { navigate("/login"); setMobileOpen(false); }}>
              <User className="h-4 w-4" />
              Connexion
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
