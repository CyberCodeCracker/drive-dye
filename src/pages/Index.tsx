import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Calendar, Users, ArrowRight, Shield, Clock, Leaf } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { popularRoutes } from "@/data/mockData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");

  const handleSearch = () => {
    navigate(`/recherche?from=${departure}&to=${arrival}&startDate=${startDate ? format(startDate, 'yyyy-MM-dd') : ''}&endDate=${endDate ? format(endDate, 'yyyy-MM-dd') : ''}&passengers=${passengers}`);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent to-secondary/10 py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Voyagez ensemble,{" "}
              <span className="text-primary">économisez</span>{" "}
              <span className="text-secondary">malin</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Trouvez un covoiturage vers votre destination. Économique, écologique et convivial.
            </p>
          </div>

          {/* Search bar */}
          <Card className="max-w-4xl mx-auto shadow-xl border-0">
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

      {/* Popular routes */}
      <section className="py-20 bg-muted/50">
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
                      <p className="text-sm text-muted-foreground">À partir de {route.price} €</p>
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
