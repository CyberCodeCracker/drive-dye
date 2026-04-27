import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, Users, Music, MessageCircle, Cigarette, Dog, Package, Car, Shield, ArrowRight, Loader2, Calendar, AlertCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Conducteur {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface Avis {
  id: number;
  note: number;
  commentaire?: string;
  created_at: string;
  voyageur: { id: number; name: string };
}

interface Trajet {
  id: number;
  depart: string;
  destination: string;
  date_heure: string;
  prix_min: number;
  prix_max: number;
  nb_places: number;
  fumeur: boolean;
  bagage?: string;
  type_vehicule?: string;
  genre?: string;
  statut: string;
  conducteur: Conducteur;
}

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [placesDisponibles, setPlacesDisponibles] = useState(0);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [noteMoyenne, setNoteMoyenne] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [tripRes, avisRes] = await Promise.all([
          api.get(`/trajets/${id}`),
          api.get(`/trajets/${id}/avis`),
        ]);
        setTrajet(tripRes.data.trajet);
        setPlacesDisponibles(tripRes.data.places_disponibles ?? 0);
        setAvis(avisRes.data.avis ?? []);
        setNoteMoyenne(avisRes.data.note_moyenne ?? 0);
      } catch {
        setError("Trajet introuvable ou erreur de chargement.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
          <p className="text-muted-foreground mb-4">{error || "Ce trajet n'existe pas ou a été supprimé."}</p>
          <Button onClick={() => navigate("/recherche")}>Retour aux résultats</Button>
        </div>
      </Layout>
    );
  }

  const formatDateTime = (dt: string) => {
    try {
      const parsed = parseISO(dt);
      return {
        date: format(parsed, "d MMMM yyyy", { locale: fr }),
        time: format(parsed, "HH:mm"),
      };
    } catch {
      return { date: dt, time: "" };
    }
  };

  const { date, time } = formatDateTime(trajet.date_heure);

  const memberYear = trajet.conducteur.created_at
    ? format(parseISO(trajet.conducteur.created_at), "yyyy")
    : "—";

  const prefIcons = [
    { key: "smoking", icon: Cigarette, label: trajet.fumeur ? "Fumeur accepté" : "Non-fumeur" },
    { key: "bagage", icon: Package, label: trajet.bagage ? `Bagages : ${trajet.bagage}` : "Bagages non précisés" },
    { key: "vehicule", icon: Car, label: trajet.type_vehicule ? `Véhicule : ${trajet.type_vehicule}` : "Véhicule non précisé" },
    ...(trajet.genre ? [{ key: "genre", icon: MessageCircle, label: `Genre : ${trajet.genre}` }] : []),
  ];

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route card */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">{trajet.depart} → {trajet.destination}</h1>
                  <Badge className="bg-primary/10 text-primary border-0 text-lg px-4 py-1">{trajet.prix_min} TND</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div className="w-0.5 h-8 bg-primary/30" />
                    </div>
                    <div>
                      <p className="font-semibold">{time} — {trajet.depart}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                    <div>
                      <p className="font-semibold">— {trajet.destination}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-lg">Préférences du conducteur</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {prefIcons.map((p) => (
                    <div key={p.key} className="flex items-center gap-2 text-sm p-3 rounded-lg bg-muted/50">
                      <p.icon className="h-4 w-4 text-primary" />
                      <span>{p.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Avis sur {trajet.conducteur.name}
                  {noteMoyenne > 0 && (
                    <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      {noteMoyenne.toFixed(1)} ({avis.length} avis)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {avis.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun avis pour ce trajet.</p>
                )}
                {avis.map((r) => (
                  <div key={r.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{r.voyageur.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{r.voyageur.name}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: r.note }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />
                          ))}
                        </div>
                      </div>
                      {r.commentaire && (
                        <p className="text-sm text-muted-foreground mt-1">{r.commentaire}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver profile */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center space-y-4">
                <Avatar className="h-20 w-20 mx-auto ring-4 ring-primary/20">
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {trajet.conducteur.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{trajet.conducteur.name}</h3>
                  <Badge className="bg-primary/10 text-primary border-0 mt-1 gap-1">
                    <Shield className="h-3 w-3" /> Conducteur
                  </Badge>
                </div>
                {noteMoyenne > 0 && (
                  <div className="flex justify-center gap-1 items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(noteMoyenne) ? "fill-secondary text-secondary" : "text-muted"}`} />
                    ))}
                    <span className="ml-1 font-semibold">{noteMoyenne.toFixed(1)}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="font-bold text-lg">{avis.length}</p>
                    <p className="text-muted-foreground">Avis</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="font-bold text-lg">{trajet.nb_places}</p>
                    <p className="text-muted-foreground">Places totales</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Membre depuis {memberYear}</p>
              </CardContent>
            </Card>

            {/* Booking card */}
            <Card className="border-0 shadow-lg bg-primary text-primary-foreground">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-extrabold">{trajet.prix_min} TND</p>
                  <p className="text-primary-foreground/80 text-sm">par passager</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  {placesDisponibles} place{placesDisponibles > 1 ? "s" : ""} disponible{placesDisponibles > 1 ? "s" : ""}
                </div>
                {user && trajet.conducteur.id === user.id ? (
                  <div className="flex items-center gap-2 text-sm bg-destructive/20 text-white p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Vous ne pouvez pas réserver votre propre trajet.</span>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                    size="lg"
                    disabled={placesDisponibles === 0 || trajet.statut !== "actif"}
                    onClick={() => navigate(`/reservation/${trajet.id}`)}
                  >
                    {placesDisponibles === 0 ? "Complet" : "Réserver ce trajet"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripDetail;
