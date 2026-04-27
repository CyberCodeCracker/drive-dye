import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Users, ArrowRight, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { format, parseISO } from "date-fns";

interface Trajet {
  id: number;
  depart: string;
  destination: string;
  date_heure: string;
  prix_min: number;
  nb_places: number;
  fumeur: boolean;
  bagage?: string;
  type_vehicule?: string;
  conducteur: { id: number; name: string; email: string };
  places_disponibles?: number;
}

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [maxPrice, setMaxPrice] = useState([100]);
  const [sortBy, setSortBy] = useState("price");
  const [showFilters, setShowFilters] = useState(false);
  const [noSmoking, setNoSmoking] = useState(false);

  useEffect(() => {
    const fetchTrajets = async () => {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, string> = {};
        if (from) params.depart = from;
        if (to) params.destination = to;
        const date = searchParams.get("date");
        if (date) params.date = date;
        const { data } = await api.get("/trajets/search", { params });
        setTrajets(data.data ?? data);
      } catch {
        setError("Impossible de charger les trajets. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrajets();
  }, [from, to, searchParams]);

  let filtered = trajets.filter((t) => {
    if (t.prix_min > maxPrice[0]) return false;
    if (noSmoking && t.fumeur) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "price") return a.prix_min - b.prix_min;
    if (sortBy === "time") return a.date_heure.localeCompare(b.date_heure);
    return 0;
  });

  const formatTime = (dateHeure: string) => {
    try { return format(parseISO(dateHeure), "HH:mm"); } catch { return ""; }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {from && to ? `${from} → ${to}` : "Tous les trajets"}
            </h1>
            <p className="text-muted-foreground">
              {loading ? "Chargement..." : `${filtered.length} trajet${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button variant="outline" className="md:hidden gap-2" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" /> Filtres
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className={cn("space-y-6", showFilters ? "block" : "hidden lg:block")}>
            <Card>
              <CardContent className="p-5 space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Trier par</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Prix croissant</SelectItem>
                      <SelectItem value="time">Heure de départ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-3 block">Prix max : {maxPrice[0]} TND</label>
                  <Slider value={maxPrice} onValueChange={setMaxPrice} max={200} step={5} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold block">Préférences</label>
                  <div className="flex items-center gap-2">
                    <Checkbox id="nosmoking" checked={noSmoking} onCheckedChange={(v) => setNoSmoking(!!v)} />
                    <label htmlFor="nosmoking" className="text-sm">Non-fumeur</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!loading && error && (
              <Card className="p-12 text-center border-destructive/30">
                <p className="text-destructive">{error}</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>Réessayer</Button>
              </Card>
            )}
            {!loading && !error && filtered.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Aucun trajet trouvé. Essayez d'élargir vos critères.</p>
              </Card>
            )}
            {!loading && filtered.map((trajet) => (
              <Card
                key={trajet.id}
                className="hover:shadow-lg transition-all cursor-pointer border-0 shadow-md"
                onClick={() => navigate(`/trajet/${trajet.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 font-bold text-primary text-lg">
                        {trajet.conducteur.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold">{trajet.conducteur.name}</span>
                        {trajet.type_vehicule && (
                          <p className="text-xs text-muted-foreground capitalize">{trajet.type_vehicule}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-lg">{formatTime(trajet.date_heure)}</p>
                        <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{trajet.depart}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <div className="text-center">
                        <p className="font-bold text-lg">—</p>
                        <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{trajet.destination}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {trajet.nb_places} place{trajet.nb_places > 1 ? "s" : ""}
                      </div>
                      {trajet.fumeur && <Badge variant="secondary" className="text-xs">Fumeur OK</Badge>}
                      <p className="text-2xl font-extrabold text-primary">{trajet.prix_min} TND</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchResults;
