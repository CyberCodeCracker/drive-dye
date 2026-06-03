import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Calendar, Users, ArrowRight, Shield, Clock, Leaf, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { popularRoutes } from "@/data/mockData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Trajet {
  id: number;
  depart: string;
  destination: string;
  date_heure: string;
  prix_min: number;
  nb_places: number;
  fumeur: boolean;
  conducteur: { id: number; name: string };
}

interface PaginatedResponse {
  data: Trajet[];
  current_page: number;
  last_page: number;
  total: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");

  // Trips list state
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalTrajets, setTotalTrajets] = useState(0);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    const fetchTrajets = async () => {
      setTripsLoading(true);
      try {
        const { data } = await api.get<PaginatedResponse>(`/trajets?page=${currentPage}`);
        setTrajets(data.data ?? []);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
        setTotalTrajets(data.total);
      } catch {
        setTrajets([]);
      } finally {
        setTripsLoading(false);
      }
    };
    fetchTrajets();
  }, [currentPage]);

  const handleSearch = () => {
    navigate(`/recherche?from=${departure}&to=${arrival}&startDate=${startDate ? format(startDate, 'yyyy-MM-dd') : ''}&endDate=${endDate ? format(endDate, 'yyyy-MM-dd') : ''}&passengers=${passengers}`);
  };

  const formatTime = (dateHeure: string) => {
    try { return format(parseISO(dateHeure), "HH:mm"); } catch { return ""; }
  };

  const formatDate = (dateHeure: string) => {
    try { return format(parseISO(dateHeure), "d MMM yyyy", { locale: fr }); } catch { return ""; }
  };

  return (
    <Layout>
      {/* Hero with background image */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(160,84%,39%,0.15),transparent_60%)]" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg">
              Voyagez ensemble,{" "}
              <span className="text-primary">économisez</span>{" "}
              <span className="text-secondary">malin</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Trouvez un covoiturage vers votre destination. Économique, écologique et convivial.
            </p>
          </div>

          {/* Search bar */}
          <Card className="max-w-4xl mx-auto shadow-xl border-0 backdrop-blur-sm bg-card/95">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="relative md:col-span-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Départ"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="relative md:col-span-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
                  <Input
                    placeholder="Arrivée"
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "d MMM yyyy", { locale: fr }) : "Date début"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "d MMM yyyy", { locale: fr }) : "Date fin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} disabled={(d) => startDate ? d < startDate : false} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="pl-9"
                    placeholder="Passagers"
                  />
                </div>
                <Button onClick={handleSearch} className="gap-2 font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Search className="h-4 w-4" />
                  Rechercher
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 container">
        <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Search, title: "Recherchez", desc: "Entrez votre trajet et trouvez des conducteurs qui vont dans votre direction.", color: "bg-primary/10 text-primary" },
            { icon: Shield, title: "Réservez en confiance", desc: "Consultez les profils vérifiés, les avis et réservez votre place en un clic.", color: "bg-secondary/10 text-secondary" },
            { icon: Leaf, title: "Voyagez écolo", desc: "Partagez les frais, réduisez votre empreinte carbone et faites des rencontres.", color: "bg-primary/10 text-primary" },
          ].map((step, i) => (
            <Card key={i} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto", step.color)}>
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Available Trips with Pagination */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Voyages disponibles</h2>
          <p className="text-center text-muted-foreground mb-10">
            {totalTrajets > 0 ? `${totalTrajets} trajet${totalTrajets > 1 ? "s" : ""} disponible${totalTrajets > 1 ? "s" : ""}` : "Découvrez les trajets publiés par notre communauté"}
          </p>

          {tripsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trajets.length === 0 ? (
            <Card className="max-w-lg mx-auto p-12 text-center border-0 shadow-md">
              <p className="text-muted-foreground">Aucun trajet disponible pour le moment.</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto mb-8">
                {trajets.map((trajet) => (
                  <Card
                    key={trajet.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md"
                    onClick={() => navigate(`/trajet/${trajet.id}`)}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 font-bold text-primary">
                            {trajet.conducteur.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">{trajet.conducteur.name}</span>
                        </div>
                        <span className="text-xl font-extrabold text-primary">{trajet.prix_min} TND</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold">{trajet.depart}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-secondary" />
                          <span className="font-semibold">{trajet.destination}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(trajet.date_heure)} à {formatTime(trajet.date_heure)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {trajet.nb_places} place{trajet.nb_places > 1 ? "s" : ""}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(page)}
                      className={page === currentPage ? "bg-primary text-primary-foreground" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage >= lastPage}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Popular routes */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Trajets populaires</h2>
          <p className="text-center text-muted-foreground mb-12">Les itinéraires les plus demandés par notre communauté</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {popularRoutes.map((route, i) => (
              <Card
                key={i}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md"
                onClick={() => navigate(`/recherche?from=${route.from}&to=${route.to}`)}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{route.image}</span>
                    <div>
                      <p className="font-semibold">{route.from} → {route.to}</p>
                      <p className="text-sm text-muted-foreground">À partir de {route.price} TND</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
          {[
            { value: "12 000+", label: "Trajets publiés", icon: Clock },
            { value: "8 900+", label: "Membres actifs", icon: Users },
            { value: "34 000+", label: "Réservations", icon: Shield },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-4xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
