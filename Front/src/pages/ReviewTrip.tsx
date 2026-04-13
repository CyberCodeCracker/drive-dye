import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, Loader2, Lock } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Reservation {
  id: number;
  statut: string;
  nb_places_reservees: number;
  trajet: {
    depart: string;
    destination: string;
    date_heure: string;
    conducteur: { name: string };
  };
}

const ReviewTrip = () => {
  const { id } = useParams(); // reservation ID
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ rating?: string; comment?: string }>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/reservations/${id}`);
        setReservation(data);
      } catch {
        setError("Réservation introuvable.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, isAuthenticated]);

  // Auth guard
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-20 max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Connexion requise</h1>
          <p className="text-muted-foreground">Vous devez être connecté pour laisser un avis.</p>
          <Button onClick={() => navigate("/login")}>Se connecter</Button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !reservation) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Réservation introuvable</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async () => {
    const newErrors: { rating?: string; comment?: string } = {};
    if (rating === 0) newErrors.rating = "Veuillez donner une note";
    if (!comment.trim()) newErrors.comment = "Veuillez écrire un commentaire";
    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (reservation.statut !== "confirmee") {
      toast({ title: "Impossible", description: "Vous ne pouvez évaluer qu'une réservation confirmée.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/avis", {
        reservation_id: reservation.id,
        note: rating,
        commentaire: comment,
      });
      setSubmitted(true);
      toast({ title: "Merci pour votre avis !", description: `Vous avez donné ${rating} étoile${rating > 1 ? "s" : ""}.` });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Une erreur est survenue.";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dt: string) => {
    try { return format(parseISO(dt), "d MMMM yyyy", { locale: fr }); }
    catch { return dt; }
  };

  const t = reservation.trajet;

  if (submitted) {
    return (
      <Layout>
        <div className="container py-20 max-w-lg mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Merci pour votre avis !</h1>
          <p className="text-muted-foreground">
            Votre évaluation aide la communauté à voyager en toute confiance.
          </p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={cn("h-6 w-6", s <= rating ? "fill-secondary text-secondary" : "text-muted-foreground")} />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
            <Button onClick={() => navigate("/recherche")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Chercher un trajet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Évaluer votre trajet</h1>
        <p className="text-muted-foreground mb-8">Partagez votre expérience pour aider les autres voyageurs.</p>

        {/* Reservation summary */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 font-bold text-primary text-lg">
                {t.conducteur.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{t.conducteur.name}</p>
                <p className="text-sm text-muted-foreground">{t.depart} → {t.destination} • {formatDate(t.date_heure)}</p>
              </div>
              <Badge className={reservation.statut === "confirmee" ? "bg-primary/10 text-primary border-0" : "bg-muted text-muted-foreground border-0"}>
                {reservation.statut === "confirmee" ? "Confirmée" : reservation.statut}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {reservation.statut !== "confirmee" && (
          <Card className="border-0 shadow-md mb-6 border-l-4 border-l-destructive/50">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">Vous ne pouvez évaluer qu'une réservation confirmée.</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle>Votre évaluation</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Note *</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => { setRating(s); setFieldErrors(p => ({ ...p, rating: undefined })); }}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className={cn("h-8 w-8 transition-colors", s <= (hoverRating || rating) ? "fill-secondary text-secondary" : "text-muted-foreground/40")} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {["", "Mauvais", "Pas terrible", "Correct", "Bien", "Excellent !"][rating]}
                </p>
              )}
              {fieldErrors.rating && <p className="text-sm text-destructive">{fieldErrors.rating}</p>}
            </div>
            <div className="space-y-2">
              <Label>Commentaire *</Label>
              <Textarea
                placeholder="Décrivez votre expérience de voyage..."
                value={comment}
                onChange={(e) => { setComment(e.target.value); setFieldErrors(p => ({ ...p, comment: undefined })); }}
                className={cn("min-h-[120px]", fieldErrors.comment ? "border-destructive ring-1 ring-destructive" : "")}
              />
              {fieldErrors.comment && <p className="text-sm text-destructive">{fieldErrors.comment}</p>}
            </div>
            <Button
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || reservation.statut !== "confirmee"}
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Envoi...</> : "Envoyer mon avis"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReviewTrip;
