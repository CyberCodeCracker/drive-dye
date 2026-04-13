import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Loader2, Lock } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Trajet {
  id: number;
  depart: string;
  destination: string;
  date_heure: string;
  prix_min: number;
  nb_places: number;
  conducteur: { id: number; name: string };
}

const Reservation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [placesDisponibles, setPlacesDisponibles] = useState(0);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrajet = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/trajets/${id}`);
        setTrajet(data.trajet);
        setPlacesDisponibles(data.places_disponibles ?? 0);
      } catch {
        setError("Trajet introuvable ou erreur de chargement.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrajet();
  }, [id]);

  // Auth guard
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-20 max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Connexion requise</h1>
          <p className="text-muted-foreground">Vous devez être connecté pour réserver un trajet.</p>
          <Button onClick={() => navigate("/login", { state: { from: { pathname: `/reservation/${id}` } } })}>
            Se connecter
          </Button>
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

  if (error || !trajet) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Trajet introuvable</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/recherche")}>Retour aux résultats</Button>
        </div>
      </Layout>
    );
  }

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/reservations", {
        trajet_id: trajet.id,
        nb_places_reservees: seats,
      });
      setReservationId(data.reservation.id);
      setConfirmed(true);
      toast({ title: "Réservation effectuée !", description: `${seats} place${seats > 1 ? "s" : ""} réservée${seats > 1 ? "s" : ""} pour ${trajet.depart} → ${trajet.destination}` });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Une erreur est survenue.";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dt: string) => {
    try {
      const parsed = parseISO(dt);
      return {
        date: format(parsed, "d MMMM yyyy", { locale: fr }),
        time: format(parsed, "HH:mm"),
      };
    } catch { return { date: dt, time: "" }; }
  };

  const { date, time } = formatDateTime(trajet.date_heure);
  const total = trajet.prix_min * seats;

  if (confirmed) {
    return (
      <Layout>
        <div className="container py-20 max-w-lg mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Réservation envoyée !</h1>
          <p className="text-muted-foreground">
            Vous avez demandé {seats} place{seats > 1 ? "s" : ""} pour le trajet {trajet.depart} → {trajet.destination} le {date} à {time}. En attente de confirmation du conducteur.
          </p>
          <Card className="border-0 shadow-md text-left">
            <CardContent className="p-5 space-y-2">
              <p className="font-semibold">{trajet.depart} → {trajet.destination}</p>
              <p className="text-sm text-muted-foreground">{date} • {time}</p>
              <p className="text-sm">Conducteur : {trajet.conducteur.name}</p>
              <p className="font-bold text-primary text-lg">Total estimé : {total} €</p>
            </CardContent>
          </Card>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
            {reservationId && (
              <Button variant="outline" onClick={() => navigate(`/evaluer/${reservationId}`)}>
                ⭐ Évaluer le trajet
              </Button>
            )}
            <Button onClick={() => navigate("/recherche")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Chercher un autre trajet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Réserver votre trajet</h1>
        <p className="text-muted-foreground mb-8">Vérifiez les détails et confirmez votre réservation.</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
            {/* Trip summary */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Récapitulatif du trajet</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 font-bold text-primary text-lg">
                    {trajet.conducteur.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{trajet.conducteur.name}</p>
                    <Badge className="bg-primary/10 text-primary border-0 text-xs mt-1">Conducteur</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p className="font-bold text-lg">{time}</p>
                    <p className="text-muted-foreground">{trajet.depart}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-bold text-lg">—</p>
                    <p className="text-muted-foreground">{trajet.destination}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{date}</p>
              </CardContent>
            </Card>

            {/* Booking form */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Nombre de places</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" disabled={seats <= 1} onClick={() => setSeats(seats - 1)}>-</Button>
                  <span className="text-xl font-bold w-8 text-center">{seats}</span>
                  <Button variant="outline" size="icon" disabled={seats >= placesDisponibles} onClick={() => setSeats(seats + 1)}>+</Button>
                  <span className="text-sm text-muted-foreground ml-2">{placesDisponibles} disponible{placesDisponibles > 1 ? "s" : ""}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price sidebar */}
          <div className="md:col-span-2">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Détail du prix</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{trajet.prix_min} € × {seats} passager{seats > 1 ? "s" : ""}</span>
                    <span>{total} €</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frais de service</span>
                    <span>0 €</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{total} €</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                  size="lg"
                  onClick={handleConfirm}
                  disabled={submitting || placesDisponibles === 0}
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Envoi...</> : "Confirmer la réservation"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">La réservation sera confirmée par le conducteur.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reservation;
