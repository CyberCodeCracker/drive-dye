import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Lock, Loader2, MapPin, ArrowRight, ArrowLeft, Users, Clock,
  Calendar, Banknote, XCircle, CheckCircle2, Ticket, Eye, Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Trajet {
  id: number;
  depart: string;
  destination: string;
  date_heure: string;
  prix_min: number;
  nb_places: number;
  conducteur: { id: number; name: string };
}

interface ReservationItem {
  id: number;
  trajet_id: number;
  nb_places_reservees: number;
  date_reservation: string;
  statut: string;
  trajet: Trajet;
  avis: { id: number; note: number; commentaire?: string }[];
}

interface PaginatedReservations {
  data: ReservationItem[];
  current_page: number;
  last_page: number;
  total: number;
}

const MesReservationsVoyageur = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<PaginatedReservations>(`/reservations?page=${currentPage}`);
        setReservations(data.data ?? []);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
        setTotal(data.total);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [isAuthenticated, currentPage]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-20 max-w-md mx-auto text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Connexion requise</h1>
          <Button onClick={() => navigate("/login")}>Se connecter</Button>
        </div>
      </Layout>
    );
  }

  const handleCancel = async (res: ReservationItem) => {
    setCancelLoading(res.id);
    try {
      await api.put(`/reservations/${res.id}/cancel`);
      setReservations((prev) => prev.map((r) => r.id === res.id ? { ...r, statut: "annulee" } : r));
      toast({ title: "Réservation annulée", description: `${res.trajet.depart} → ${res.trajet.destination}` });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.response?.data?.message || "Impossible d'annuler cette réservation.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(null);
    }
  };

  const formatDateTime = (dt: string) => {
    try {
      const parsed = parseISO(dt);
      return {
        date: format(parsed, "EEEE d MMM yyyy", { locale: fr }),
        time: format(parsed, "HH:mm"),
      };
    } catch {
      return { date: dt, time: "" };
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return <Badge className="bg-amber-500/10 text-amber-600 border-0 gap-1"><Clock className="h-3 w-3" />En attente</Badge>;
      case "confirmee":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-0 gap-1"><CheckCircle2 className="h-3 w-3" />Confirmée</Badge>;
      case "annulee":
        return <Badge className="bg-destructive/10 text-destructive border-0 gap-1"><XCircle className="h-3 w-3" />Annulée</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{statut}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <Button variant="outline" size="icon" className="mb-4 h-9 w-9" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mes réservations</h1>
            <p className="text-muted-foreground">
              {total > 0 ? `${total} réservation${total > 1 ? "s" : ""}` : "Consultez vos réservations de trajets"}
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/recherche")}>
            <Ticket className="h-4 w-4" />
            Chercher un trajet
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reservations.length === 0 ? (
          <Card className="border-0 shadow-md p-12 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Vous n'avez aucune réservation.</p>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Recherchez un trajet et réservez votre première place.
            </p>
            <Button className="gap-2" onClick={() => navigate("/recherche")}>
              <Ticket className="h-4 w-4" />
              Chercher un trajet
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => {
              const { date, time } = formatDateTime(res.trajet.date_heure);
              const isCancelling = cancelLoading === res.id;
              const canCancel = res.statut === "en_attente" || res.statut === "confirmee";
              const hasReviewed = res.avis && res.avis.length > 0;
              const canReview = res.statut === "confirmee" && !hasReviewed;

              return (
                <Card key={res.id} className={`border-0 shadow-md hover:shadow-lg transition-shadow ${res.statut === "annulee" ? "opacity-60" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4">
                      {/* Route + status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-lg">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold">{res.trajet.depart}</span>
                          <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold">{res.trajet.destination}</span>
                        </div>
                        {getStatusBadge(res.statut)}
                      </div>

                      {/* Info */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Banknote className="h-3.5 w-3.5" />
                          {res.trajet.prix_min * res.nb_places_reservees} TND
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {res.nb_places_reservees} place{res.nb_places_reservees > 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Driver */}
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {res.trajet.conducteur.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">Conducteur : <span className="font-medium text-foreground">{res.trajet.conducteur.name}</span></span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => navigate(`/trajet/${res.trajet.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Voir le trajet
                        </Button>

                        {canReview && (
                          <Button
                            size="sm"
                            className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            onClick={() => navigate(`/evaluer/${res.id}`)}
                          >
                            <Star className="h-3.5 w-3.5" />
                            Évaluer
                          </Button>
                        )}

                        {hasReviewed && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-secondary/10 text-secondary border-0 gap-1">
                              <Star className="h-3 w-3 fill-secondary" />
                              Évalué ({res.avis[0].note}/5)
                            </Badge>
                          </div>
                        )}

                        {canCancel && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10"
                                disabled={isCancelling}
                              >
                                {isCancelling ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                Annuler
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Votre réservation de {res.nb_places_reservees} place{res.nb_places_reservees > 1 ? "s" : ""} pour {res.trajet.depart} → {res.trajet.destination} sera annulée. Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Retour</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancel(res)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Annuler la réservation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>

                      {/* Review display */}
                      {hasReviewed && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < res.avis[0].note ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />
                            ))}
                            <span className="text-sm text-muted-foreground ml-2">Votre avis</span>
                          </div>
                          {res.avis[0].commentaire && (
                            <p className="text-sm text-muted-foreground italic">"{res.avis[0].commentaire}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {currentPage} sur {lastPage}
                </span>
                <Button variant="outline" size="sm" disabled={currentPage >= lastPage} onClick={() => setCurrentPage(currentPage + 1)}>
                  Suivant
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MesReservationsVoyageur;
