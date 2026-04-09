import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, Search, PlusCircle, User, LayoutDashboard, LogOut, Bell } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isDriver, isAdmin, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Déconnecté", description: "À bientôt !" });
    navigate("/");
  };

  const navLinks = [
    { to: "/recherche", label: "Rechercher", icon: Search, show: true },
    { to: "/publier", label: "Publier un trajet", icon: PlusCircle, show: isDriver },
    { to: "/admin", label: "Admin", icon: LayoutDashboard, show: isAdmin },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-foreground">Covoit<span className="text-primary">Facile</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
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

          {isAuthenticated ? (
            <div className="flex items-center gap-1 ml-2">
              <span className="text-sm font-medium px-3 py-1 rounded-md bg-muted text-muted-foreground">
                <User className="inline h-3.5 w-3.5 mr-1" />
                {user?.name}
              </span>
              <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="gap-2 ml-2" onClick={() => navigate("/login")}>
              <User className="h-4 w-4" />
              Connexion
            </Button>
          )}
        </nav>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-2">
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
              <p className="text-sm text-muted-foreground px-3 py-1">Connecté en tant que <strong>{user?.name}</strong></p>
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
