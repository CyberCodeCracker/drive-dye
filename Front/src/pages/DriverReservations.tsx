import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Loader2, Lock, Car, Clock, MapPin, Users, ArrowRight, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface ReservationItem {
  id: number;
  voyageur_id: number;
  trajet_id: number;
  date_reservation: string;
  nb_places_reservees: number;
  statut: string;
  voyageur: { id: number; name: string; email: string };
  trajet: {
    id: number;
    depart: string;
    destination: string;
    date_heure: string;
    prix_min: number;
  };
}

interface PaginatedReservations {
  data: ReservationItem[];
  current_page: number;
  last_page: number;
  total: number;
}

const DriverReservations = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDriver } = useAuth();
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!isDriver) return;
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<PaginatedReservations>(`/conducteur/reservations?page=${currentPage}`);
        setReservations(data.data ?? []);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [isDriver, currentPage]);

  // Auth guards
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

  if (!isDriver) {
    return (
      <Layout>
        <div className="container py-20 max-w-md mx-auto text-center space-y-4">
          <Car className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Réservé aux conducteurs</h1>
          <p className="text-muted-foreground">Seuls les comptes conducteur peuvent gérer les réservations.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </Layout>
    );
  }

  const handleConfirm = async (reservation: ReservationItem) => {
    setActionLoading(reservation.id);
    try {
      await api.put(`/reservations/${reservation.id}/confirm`);
      setReservations(prev =>
        prev.map(r => r.id === reservation.id ? { ...r, statut: "confirmee" } : r)
      );
      toast({
        title: "Réservation confirmée",
        description: `La réservation de ${reservation.voyageur.name} a été confirmée.`,
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.response?.data?.message || "Impossible de confirmer cette réservation.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reservation: ReservationItem) => {
    setActionLoading(reservation.id);
    try {
      await api.put(`/reservations/${reservation.id}/reject`);
      setReservations(prev =>
        prev.map(r => r.id === reservation.id ? { ...r, statut: "annulee" } : r)
      );
      toast({
        title: "Réservation refusée",
        description: `La réservation de ${reservation.voyageur.name} a été refusée.`,
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.response?.data?.message || "Impossible de refuser cette réservation.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dt: string) => {
    try {
      const parsed = parseISO(dt);
      return {
        date: format(parsed, "d MMM yyyy", { locale: fr }),
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
        return <Badge className="bg-primary/10 text-primary border-0 gap-1"><CheckCircle2 className="h-3 w-3" />Confirmée</Badge>;
      case "annulee":
        return <Badge className="bg-destructive/10 text-destructive border-0 gap-1"><XCircle className="h-3 w-3" />Refusée</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{statut}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Réservations reçues</h1>
          <p className="text-muted-foreground">Gérez les demandes de réservation pour vos trajets</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reservations.length === 0 ? (
          <Card className="border-0 shadow-md p-12 text-center">
            <p className="text-muted-foreground text-lg">Aucune réservation reçue pour le moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Les réservations apparaîtront ici quand des voyageurs réserveront vos trajets.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const { date, time } = formatDateTime(reservation.trajet.date_heure);
              const isLoading = actionLoading === reservation.id;
              const isPending = reservation.statut === "en_attente";

              return (
                <Card key={reservation.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Voyageur info */}
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {reservation.voyageur.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{reservation.voyageur.name}</p>
                          <p className="text-xs text-muted-foreground">{reservation.voyageur.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Users className="h-3 w-3 inline mr-1" />
                            {reservation.nb_places_reservees} place{reservation.nb_places_reservees > 1 ? "s" : ""} demandée{reservation.nb_places_reservees > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Trip info */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="text-center">
                          <p className="font-bold">{time}</p>
                          <p className="text-xs text-muted-foreground">{reservation.trajet.depart}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">{reservation.trajet.destination}</p>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">{date}</span>
                      </div>

                      {/* Status & actions */}
                      <div className="flex items-center gap-3">
                        {getStatusBadge(reservation.statut)}
                        {isPending && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                              disabled={isLoading}
                              onClick={() => handleConfirm(reservation)}
                            >
                              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                              Confirmer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                              disabled={isLoading}
                              onClick={() => handleReject(reservation)}
                            >
                              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                              Refuser
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {currentPage} sur {lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= lastPage}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
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

export default DriverReservations;
