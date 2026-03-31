import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Clock, Users, ArrowRight, Filter } from "lucide-react";
import { trips } from "@/data/mockData";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const [maxPrice, setMaxPrice] = useState([50]);
  const [sortBy, setSortBy] = useState("price");
  const [showFilters, setShowFilters] = useState(false);
  const [noPets, setNoPets] = useState(false);
  const [noSmoking, setNoSmoking] = useState(false);

  let filtered = trips.filter((t) => {
    if (from && !t.departure.toLowerCase().includes(from.toLowerCase())) return false;
    if (to && !t.arrival.toLowerCase().includes(to.toLowerCase())) return false;
    if (t.price > maxPrice[0]) return false;
    if (noSmoking && t.preferences.smoking) return false;
    if (noPets && t.preferences.pets) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "time") return a.departureTime.localeCompare(b.departureTime);
    if (sortBy === "rating") return b.driver.rating - a.driver.rating;
    return 0;
  });

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {from && to ? `${from} → ${to}` : "Tous les trajets"}
            </h1>
            <p className="text-muted-foreground">{filtered.length} trajet{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}</p>
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
                      <SelectItem value="rating">Meilleure note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-3 block">Prix max : {maxPrice[0]} €</label>
                  <Slider value={maxPrice} onValueChange={setMaxPrice} max={100} step={1} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold block">Préférences</label>
                  <div className="flex items-center gap-2">
                    <Checkbox id="nosmoking" checked={noSmoking} onCheckedChange={(v) => setNoSmoking(!!v)} />
                    <label htmlFor="nosmoking" className="text-sm">Non-fumeur</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="nopets" checked={noPets} onCheckedChange={(v) => setNoPets(!!v)} />
                    <label htmlFor="nopets" className="text-sm">Sans animaux</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {filtered.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Aucun trajet trouvé. Essayez d'élargir vos critères.</p>
              </Card>
            )}
            {filtered.map((trip) => (
              <Card
                key={trip.id}
                className="hover:shadow-lg transition-all cursor-pointer border-0 shadow-md"
                onClick={() => navigate(`/trajet/${trip.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={trip.driver.avatar} alt={trip.driver.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{trip.driver.name}</span>
                          {trip.driver.verified && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">Vérifié</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                          <span>{trip.driver.rating}</span>
                          <span>({trip.driver.reviewCount} avis)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-lg">{trip.departureTime}</p>
                        <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.departure}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        {trip.stops.length > 0 && <span className="text-xs text-muted-foreground">{trip.stops.length} arrêt{trip.stops.length > 1 ? "s" : ""}</span>}
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">{trip.arrivalTime}</p>
                        <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.arrival}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {trip.seatsAvailable} place{trip.seatsAvailable > 1 ? "s" : ""}
                      </div>
                      <p className="text-2xl font-extrabold text-primary">{trip.price} €</p>
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
