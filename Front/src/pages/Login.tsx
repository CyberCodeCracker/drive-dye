import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Car, User, Mail, Lock, Phone, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type LoginFieldErrors = {
  email?: string;
  password?: string;
};

type RegisterFieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirm?: string;
  role?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const from = (location.state as any)?.from?.pathname || "/";

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginFieldErrors, setLoginFieldErrors] = useState<LoginFieldErrors>({});

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regRole, setRegRole] = useState<"voyageur" | "conducteur">("voyageur");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regFieldErrors, setRegFieldErrors] = useState<RegisterFieldErrors>({});

  const inputErrorClass = "border-destructive focus-visible:ring-destructive";

  const clearLoginFieldError = (field: keyof LoginFieldErrors) => {
    setLoginFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const clearRegFieldError = (field: keyof RegisterFieldErrors) => {
    setRegFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginFieldErrors({});
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast({ title: "Connexion réussie !" });
      navigate(from, { replace: true });
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const fieldErrors: LoginFieldErrors = {};
        if (errors.email?.[0]) fieldErrors.email = errors.email[0];
        if (errors.password?.[0]) fieldErrors.password = errors.password[0];
        if (Object.keys(fieldErrors).length > 0) {
          setLoginFieldErrors(fieldErrors);
          setLoginError(err?.response?.data?.message || Object.values(fieldErrors)[0] || "Identifiants incorrects.");
          return;
        }
      }
      const msg = err?.response?.data?.message || "Identifiants incorrects.";
      setLoginError(msg);
      setLoginFieldErrors({ email: msg, password: msg });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegFieldErrors({});
    if (regPassword !== regConfirm) {
      const msg = "Les mots de passe ne correspondent pas.";
      setRegError(msg);
      setRegFieldErrors({ confirm: msg });
      return;
    }
    setRegLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        password_confirmation: regConfirm,
        role: regRole,
        phone: regPhone || undefined,
      });
      toast({ title: "Inscription réussie !", description: `Bienvenue, ${regName} !` });
      navigate(from, { replace: true });
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      const fallbackMsg = err?.response?.data?.message || "Une erreur est survenue.";
      if (errors) {
        const fieldErrors: RegisterFieldErrors = {};
        if (errors.name?.[0]) fieldErrors.name = errors.name[0];
        if (errors.email?.[0]) fieldErrors.email = errors.email[0];
        if (errors.phone?.[0]) fieldErrors.phone = errors.phone[0];
        if (errors.role?.[0]) fieldErrors.role = errors.role[0];
        if (errors.password?.[0]) {
          fieldErrors.password = errors.password[0];
          const passwordErrorText = (errors.password as string[]).join(" ").toLowerCase();
          if (passwordErrorText.includes("confirm")) {
            fieldErrors.confirm = errors.password[0];
          }
        }
        if (errors.password_confirmation?.[0]) {
          fieldErrors.confirm = errors.password_confirmation[0];
        }
        if (Object.keys(fieldErrors).length > 0) {
          setRegFieldErrors(fieldErrors);
          setRegError(err?.response?.data?.message || Object.values(fieldErrors)[0] || fallbackMsg);
          return;
        }
      }
      setRegError(fallbackMsg);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <Car className="h-6 w-6" />
            </div>
            <span className="text-3xl font-extrabold">
              Covoit<span className="text-primary">Facile</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Connectez-vous pour accéder à toutes les fonctionnalités</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-6">
            <Tabs defaultValue="login">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="login" className="flex-1">Connexion</TabsTrigger>
                <TabsTrigger value="register" className="flex-1">Inscription</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="vous@exemple.com"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          clearLoginFieldError("email");
                        }}
                        className={cn("pl-9", loginFieldErrors.email && inputErrorClass)}
                        required
                      />
                    </div>
                    {loginFieldErrors.email && <p className="text-sm text-destructive">{loginFieldErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          clearLoginFieldError("password");
                        }}
                        className={cn("pl-9 pr-10", loginFieldErrors.password && inputErrorClass)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showLoginPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        aria-pressed={showLoginPassword}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginFieldErrors.password && <p className="text-sm text-destructive">{loginFieldErrors.password}</p>}
                  </div>
                  {loginError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {loginError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-primary font-semibold"
                    size="lg"
                    disabled={loginLoading}
                  >
                    {loginLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        placeholder="Prénom Nom"
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          clearRegFieldError("name");
                        }}
                        className={cn("pl-9", regFieldErrors.name && inputErrorClass)}
                        required
                      />
                    </div>
                    {regFieldErrors.name && <p className="text-sm text-destructive">{regFieldErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="vous@exemple.com"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          clearRegFieldError("email");
                        }}
                        className={cn("pl-9", regFieldErrors.email && inputErrorClass)}
                        required
                      />
                    </div>
                    {regFieldErrors.email && <p className="text-sm text-destructive">{regFieldErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Téléphone (optionnel)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-phone"
                        placeholder="+33 6 00 00 00 00"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          clearRegFieldError("phone");
                        }}
                        className={cn("pl-9", regFieldErrors.phone && inputErrorClass)}
                      />
                    </div>
                    {regFieldErrors.phone && <p className="text-sm text-destructive">{regFieldErrors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Je suis</Label>
                    <Select
                      value={regRole}
                      onValueChange={(v) => {
                        setRegRole(v as any);
                        clearRegFieldError("role");
                      }}
                    >
                      <SelectTrigger className={cn(regFieldErrors.role && inputErrorClass)}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voyageur">Voyageur (passager)</SelectItem>
                        <SelectItem value="conducteur">Conducteur</SelectItem>
                      </SelectContent>
                    </Select>
                    {regFieldErrors.role && <p className="text-sm text-destructive">{regFieldErrors.role}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          clearRegFieldError("password");
                        }}
                        className={cn("pl-9 pr-10", regFieldErrors.password && inputErrorClass)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showRegPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        aria-pressed={showRegPassword}
                      >
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {regFieldErrors.password && <p className="text-sm text-destructive">{regFieldErrors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-confirm"
                        type={showRegConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        value={regConfirm}
                        onChange={(e) => {
                          setRegConfirm(e.target.value);
                          clearRegFieldError("confirm");
                        }}
                        className={cn("pl-9 pr-10", regFieldErrors.confirm && inputErrorClass)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirm((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showRegConfirm ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
                        aria-pressed={showRegConfirm}
                      >
                        {showRegConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {regFieldErrors.confirm && <p className="text-sm text-destructive">{regFieldErrors.confirm}</p>}
                  </div>
                  {regError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {regError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
                    size="lg"
                    disabled={regLoading}
                  >
                    {regLoading ? "Inscription..." : "Créer mon compte"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
            ← Retour à l'accueil
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
