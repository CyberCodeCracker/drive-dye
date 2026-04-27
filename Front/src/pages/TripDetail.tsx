import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, Users, Music, MessageCircle, Cigarette, Dog, Package, Car, Shield, ArrowRight, Loader2, Calendar, AlertCircle, CheckCircle2, XCircle, BookOpen, Clock, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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

interface ReservationItem {
  id: number;
  voyageur_id: number;
  nb_places_reservees: number;
  date_reservation: string;
  statut: string;
  voyageur: { id: number; name: string; email: string };
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
  reservations?: ReservationItem[];
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
  const [showReservations, setShowReservations] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const isOwner = user && trajet?.conducteur?.id === user.id;

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

  const handleConfirm = async (resId: number) => {
    setActionLoading(resId);
    try {
      await api.put(`/reservations/${resId}/confirm`);
      setTrajet((prev) =>
        prev ? { ...prev, reservations: prev.reservations?.map((r) => r.id === resId ? { ...r, statut: "confirmee" } : r) } : prev
      );
      toast({ title: "Réservation confirmée" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.response?.data?.message || "Impossible de confirmer.", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (resId: number) => {
    setActionLoading(resId);
    try {
      await api.put(`/reservations/${resId}/reject`);
      setTrajet((prev) =>
        prev ? { ...prev, reservations: prev.reservations?.map((r) => r.id === resId ? { ...r, statut: "annulee" } : r) } : prev
      );
      toast({ title: "Réservation refusée" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.response?.data?.message || "Impossible de refuser.", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const getResBadge = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return <Badge className="bg-amber-500/10 text-amber-600 border-0 gap-1"><Clock className="h-3 w-3" />En attente</Badge>;
      case "confirmee":
        return <Badge className="bg-primary/10 text-primary border-0 gap-1"><CheckCircle2 className="h-3 w-3" />Confirmée</Badge>;
      case "annulee":
        return <Badge className="bg-destructive/10 text-destructive border-0 gap-1"><XCircle className="h-3 w-3" />Annulée</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{statut}</Badge>;
    }
  };

  const activeReservations = trajet.reservations?.filter((r) => r.statut !== "annulee") ?? [];

  // Check if current user already has an active reservation for this trip
  const myReservation = user
    ? trajet.reservations?.find((r) => r.voyageur_id === user.id && (r.statut === "en_attente" || r.statut === "confirmee"))
    : null;

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="outline" size="icon" className="mb-4 h-9 w-9" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
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

            {/* Driver reservations section */}
            {isOwner && (
              <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Réservations ({activeReservations.length})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReservations(!showReservations)}
                  >
                    {showReservations ? "Masquer" : "Voir les réservations"}
                  </Button>
                </CardHeader>
                {showReservations && (
                  <CardContent className="space-y-3 pt-2">
                    {activeReservations.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Aucune réservation pour ce trajet.</p>
                    ) : (
                      activeReservations.map((res) => (
                        <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {res.voyageur.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{res.voyageur.name}</p>
                              <p className="text-xs text-muted-foreground">{res.voyageur.email}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                <Users className="h-3 w-3 inline mr-1" />
                                {res.nb_places_reservees} place{res.nb_places_reservees > 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getResBadge(res.statut)}
                            {res.statut === "en_attente" && (
                              <>
                                <Button
                                  size="icon"
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 w-8 rounded-full"
                                  disabled={actionLoading === res.id}
                                  onClick={() => handleConfirm(res.id)}
                                  title="Confirmer"
                                >
                                  {actionLoading === res.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="text-destructive border-destructive/40 hover:bg-destructive/10 h-8 w-8 rounded-full"
                                  disabled={actionLoading === res.id}
                                  onClick={() => handleReject(res.id)}
                                  title="Refuser"
                                >
                                  {actionLoading === res.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                )}
              </Card>
            )}

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
            <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate(`/conducteur/${trajet.conducteur.id}`)}>
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
                <p className="text-xs text-primary font-medium">Voir le profil →</p>
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
                ) : myReservation ? (
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Votre réservation</span>
                        {myReservation.statut === "en_attente" ? (
                          <Badge className="bg-amber-500/20 text-amber-200 border-0 gap-1 text-xs"><Clock className="h-3 w-3" />En attente</Badge>
                        ) : (
                          <Badge className="bg-emerald-500/20 text-emerald-200 border-0 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" />Confirmée</Badge>
                        )}
                      </div>
                      <p className="text-sm text-primary-foreground/80">
                        {myReservation.nb_places_reservees} place{myReservation.nb_places_reservees > 1 ? "s" : ""} réservée{myReservation.nb_places_reservees > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button
                      className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                      size="lg"
                      onClick={() => navigate(`/reservation/${trajet.id}`)}
                    >
                      Modifier réservation
                    </Button>
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
