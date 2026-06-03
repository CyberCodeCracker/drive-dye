import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock, Car, Loader2, MapPin, ArrowRight, Users, Clock,
  Calendar, Banknote, Trash2, PlusCircle, Eye, ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TrajetItem {
  id: number;
  depart: string;
  destination: string;
  date_heure: string;
  nb_places: number;
  prix_min: number;
  prix_max: number;
  type_vehicule: string | null;
  bagage: string | null;
  fumeur: boolean;
  genre: string | null;
  statut: string;
  reservations: { id: number; statut: string; nb_places_reservees: number }[];
}

interface PaginatedTrajets {
  data: TrajetItem[];
  current_page: number;
  last_page: number;
  total: number;
}

const MesTrajets = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDriver } = useAuth();
  const [trajets, setTrajets] = useState<TrajetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isDriver) return;
    const fetchTrajets = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<PaginatedTrajets>(`/conducteur/trajets?page=${currentPage}`);
        setTrajets(data.data ?? []);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
        setTotal(data.total);
      } catch {
        setTrajets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrajets();
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
          <p className="text-muted-foreground">Seuls les comptes conducteur peuvent voir leurs trajets.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </Layout>
    );
  }

  const handleDelete = async (trajet: TrajetItem) => {
    setDeleteLoading(trajet.id);
    try {
      await api.delete(`/trajets/${trajet.id}`);
      setTrajets((prev) => prev.filter((t) => t.id !== trajet.id));
      setTotal((prev) => prev - 1);
      toast({ title: "Trajet supprimé", description: `Le trajet ${trajet.depart} → ${trajet.destination} a été supprimé.` });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.response?.data?.message || "Impossible de supprimer ce trajet.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
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

  const getPlacesReservees = (trajet: TrajetItem) =>
    trajet.reservations
      .filter((r) => r.statut === "en_attente" || r.statut === "confirmee")
      .reduce((sum, r) => sum + r.nb_places_reservees, 0);

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return <Badge className="bg-amber-500/10 text-amber-600 border-0 gap-1"><Clock className="h-3 w-3" />En attente d'approbation</Badge>;
      case "actif":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-0 gap-1"><Clock className="h-3 w-3" />Actif</Badge>;
      case "termine":
        return <Badge className="bg-muted text-muted-foreground border-0 gap-1">Terminé</Badge>;
      case "annule":
        return <Badge className="bg-destructive/10 text-destructive border-0 gap-1">Annulé</Badge>;
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mes trajets</h1>
            <p className="text-muted-foreground">
              {total > 0 ? `${total} trajet${total > 1 ? "s" : ""} publié${total > 1 ? "s" : ""}` : "Gérez vos trajets publiés"}
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/publier")}>
            <PlusCircle className="h-4 w-4" />
            Publier un trajet
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trajets.length === 0 ? (
          <Card className="border-0 shadow-md p-12 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Vous n'avez publié aucun trajet.</p>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Commencez par publier votre premier trajet pour proposer des places aux voyageurs.
            </p>
            <Button className="gap-2" onClick={() => navigate("/publier")}>
              <PlusCircle className="h-4 w-4" />
              Publier un trajet
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {trajets.map((trajet) => {
              const { date, time } = formatDateTime(trajet.date_heure);
              const placesReservees = getPlacesReservees(trajet);
              const placesRestantes = trajet.nb_places - placesReservees;
              const isDeleting = deleteLoading === trajet.id;

              return (
                <Card key={trajet.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4">
                      {/* Top row: route + status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-lg">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold">{trajet.depart}</span>
                          <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold">{trajet.destination}</span>
                        </div>
                        {getStatusBadge(trajet.statut)}
                      </div>

                      {/* Info row */}
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
                          {trajet.prix_min}–{trajet.prix_max} TND
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {placesReservees}/{trajet.nb_places} réservée{placesReservees > 1 ? "s" : ""}
                          {placesRestantes > 0 && (
                            <span className="text-emerald-600 ml-1">({placesRestantes} dispo)</span>
                          )}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => navigate(`/trajet/${trajet.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Voir détails
                        </Button>

                        {(trajet.statut === "actif" || trajet.statut === "en_attente") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce trajet ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Le trajet {trajet.depart} → {trajet.destination} sera définitivement supprimé.
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(trajet)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

export default MesTrajets;
