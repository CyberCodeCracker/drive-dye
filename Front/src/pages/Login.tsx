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
import { Car, User, Mail, Lock, Phone, AlertCircle, Eye, EyeOff, ArrowRight, ArrowLeft, Home } from "lucide-react";
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

// Map common Laravel validation messages to French
const toFrench = (msg: string): string => {
  const map: Record<string, string> = {
    "The email field is required.": "Le champ email est obligatoire.",
    "The email must be a valid email address.": "L'email doit être une adresse email valide.",
    "The email has already been taken.": "Cet email est déjà utilisé.",
    "The password field is required.": "Le champ mot de passe est obligatoire.",
    "The password must be at least 8 characters.": "Le mot de passe doit contenir au moins 8 caractères.",
    "The password field confirmation does not match.": "La confirmation du mot de passe ne correspond pas.",
    "The password confirmation does not match.": "La confirmation du mot de passe ne correspond pas.",
    "The name field is required.": "Le champ nom est obligatoire.",
    "The name must be a string.": "Le nom doit être une chaîne de caractères.",
    "The name may not be greater than 255 characters.": "Le nom ne doit pas dépasser 255 caractères.",
    "The phone must be a string.": "Le téléphone doit être une chaîne de caractères.",
    "The phone may not be greater than 20 characters.": "Le téléphone ne doit pas dépasser 20 caractères.",
    "The selected role is invalid.": "Le rôle sélectionné est invalide.",
    "These credentials do not match our records.": "Ces identifiants ne correspondent à aucun compte.",
    "The provided credentials are incorrect.": "Les identifiants fournis sont incorrects.",
    "Invalid credentials.": "Identifiants incorrects.",
    "Unauthorized.": "Non autorisé.",
  };
  // Check exact match first
  if (map[msg]) return map[msg];
  // Check if the message is already in French (contains accented chars or known French words)
  if (/[àâäéèêëïîôùûüç]/.test(msg) || /obligatoire|invalide|incorrect/i.test(msg)) return msg;
  // Pattern-based translations
  if (/must be at least (\d+) characters/i.test(msg)) {
    const n = msg.match(/(\d+)/)?.[1];
    return `Ce champ doit contenir au moins ${n} caractères.`;
  }
  if (/may not be greater than (\d+) characters/i.test(msg)) {
    const n = msg.match(/(\d+)/)?.[1];
    return `Ce champ ne doit pas dépasser ${n} caractères.`;
  }
  if (/has already been taken/i.test(msg)) return "Cette valeur est déjà utilisée.";
  if (/is required/i.test(msg)) return "Ce champ est obligatoire.";
  if (/must be a valid email/i.test(msg)) return "L'email doit être une adresse valide.";
  if (/confirmation does not match/i.test(msg)) return "La confirmation ne correspond pas.";
  // Default: return as-is (was likely already in French from the API)
  return msg;
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

  // Multi-step registration
  const [regStep, setRegStep] = useState(1);

  const inputErrorClass = "border-destructive focus-visible:ring-destructive";

  const clearLoginFieldError = (field: keyof LoginFieldErrors) => {
    setLoginFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const clearRegFieldError = (field: keyof RegisterFieldErrors) => {
    setRegFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Validate step 1 of registration
  const validateStep1 = (): boolean => {
    const errors: RegisterFieldErrors = {};
    if (!regName.trim()) errors.name = "Le nom complet est obligatoire.";
    if (!regEmail.trim()) errors.email = "L'email est obligatoire.";
    else if (!/\S+@\S+\.\S+/.test(regEmail)) errors.email = "L'email doit être une adresse valide.";
    if (!regRole) errors.role = "Veuillez sélectionner un rôle.";
    setRegFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
        if (errors.email?.[0]) fieldErrors.email = toFrench(errors.email[0]);
        if (errors.password?.[0]) fieldErrors.password = toFrench(errors.password[0]);
        if (Object.keys(fieldErrors).length > 0) {
          setLoginFieldErrors(fieldErrors);
          setLoginError(toFrench(err?.response?.data?.message || Object.values(fieldErrors)[0] || "Identifiants incorrects."));
          return;
        }
      }
      const msg = toFrench(err?.response?.data?.message || "Identifiants incorrects.");
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
      const fallbackMsg = toFrench(err?.response?.data?.message || "Une erreur est survenue.");
      if (errors) {
        const fieldErrors: RegisterFieldErrors = {};
        if (errors.name?.[0]) fieldErrors.name = toFrench(errors.name[0]);
        if (errors.email?.[0]) fieldErrors.email = toFrench(errors.email[0]);
        if (errors.phone?.[0]) fieldErrors.phone = toFrench(errors.phone[0]);
        if (errors.role?.[0]) fieldErrors.role = toFrench(errors.role[0]);
        if (errors.password?.[0]) {
          fieldErrors.password = toFrench(errors.password[0]);
          const passwordErrorText = (errors.password as string[]).join(" ").toLowerCase();
          if (passwordErrorText.includes("confirm")) {
            fieldErrors.confirm = toFrench(errors.password[0]);
          }
        }
        if (errors.password_confirmation?.[0]) {
          fieldErrors.confirm = toFrench(errors.password_confirmation[0]);
        }
        if (Object.keys(fieldErrors).length > 0) {
          setRegFieldErrors(fieldErrors);
          // If errors are on step 1 fields, go back to step 1
          if (fieldErrors.name || fieldErrors.email || fieldErrors.role) {
            setRegStep(1);
          }
          setRegError(toFrench(err?.response?.data?.message || Object.values(fieldErrors)[0] || fallbackMsg));
          return;
        }
      }
      setRegError(fallbackMsg);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/auth-bg.png')" }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <Car className="h-6 w-6" />
            </div>
            <span className="text-3xl font-extrabold text-white">
              Covoit<span className="text-primary">Facile</span>
            </span>
          </div>
          <p className="text-white/70 text-sm">Connectez-vous pour accéder à toutes les fonctionnalités</p>
        </div>

        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-md">
          <CardContent className="p-6">
            <Tabs defaultValue="login" onValueChange={() => { setRegStep(1); setRegError(""); setRegFieldErrors({}); setLoginError(""); setLoginFieldErrors({}); }}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="login" className="flex-1">Connexion</TabsTrigger>
                <TabsTrigger value="register" className="flex-1">Inscription</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email <span className="text-destructive">*</span></Label>
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
                    <Label htmlFor="login-password">Mot de passe <span className="text-destructive">*</span></Label>
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

              {/* REGISTER - 2 STEPS */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Step indicators */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                      regStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>1</div>
                    <div className={cn("w-12 h-0.5 transition-colors", regStep >= 2 ? "bg-primary" : "bg-muted")} />
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                      regStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>2</div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mb-2">
                    {regStep === 1 ? "Informations personnelles" : "Sécurité du compte"}
                  </p>

                  {regStep === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="reg-name">Nom complet <span className="text-destructive">*</span></Label>
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
                        <Label htmlFor="reg-email">Email <span className="text-destructive">*</span></Label>
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
                        <Label htmlFor="reg-phone">Téléphone <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-phone"
                            placeholder="+213 6 00 00 00 00"
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
                        <Label>Je suis <span className="text-destructive">*</span></Label>
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
                      <Button
                        type="button"
                        className="w-full bg-primary font-semibold gap-2"
                        size="lg"
                        onClick={() => {
                          if (validateStep1()) setRegStep(2);
                        }}
                      >
                        Suivant <ArrowRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {regStep === 2 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Mot de passe <span className="text-destructive">*</span></Label>
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
                            onClick={() => { setShowRegPassword((prev) => !prev); setShowRegConfirm((prev) => !prev); }}
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
                        <Label htmlFor="reg-confirm">Confirmer le mot de passe <span className="text-destructive">*</span></Label>
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
                            onClick={() => { setShowRegPassword((prev) => !prev); setShowRegConfirm((prev) => !prev); }}
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
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => setRegStep(1)}
                        >
                          <ArrowLeft className="h-4 w-4" /> Retour
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
                          size="lg"
                          disabled={regLoading}
                        >
                          {regLoading ? "Inscription..." : "Créer mon compte"}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur border border-white/20 shadow transition-all hover:scale-105 active:scale-95"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
