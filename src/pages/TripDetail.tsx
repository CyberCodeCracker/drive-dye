import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Users, Music, MessageCircle, Cigarette, Dog, Package, Car, Shield, ArrowRight } from "lucide-react";
import { trips, reviews } from "@/data/mockData";
import { useParams, useNavigate } from "react-router-dom";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const trip = trips.find((t) => t.id === id);

  if (!trip) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Trajet introuvable</h1>
          <p className="text-muted-foreground mb-4">Ce trajet n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate("/recherche")}>Retour aux résultats</Button>
        </div>
      </Layout>
    );
  }

  const prefIcons = [
    { key: "smoking", icon: Cigarette, label: trip.preferences.smoking ? "Fumeur accepté" : "Non-fumeur", active: !trip.preferences.smoking },
    { key: "music", icon: Music, label: trip.preferences.music ? "Musique" : "Pas de musique", active: trip.preferences.music },
    { key: "pets", icon: Dog, label: trip.preferences.pets ? "Animaux acceptés" : "Pas d'animaux", active: !trip.preferences.pets },
    { key: "conversation", icon: MessageCircle, label: trip.preferences.conversation === "chatty" ? "Bavard" : trip.preferences.conversation === "moderate" ? "Discussion modérée" : "Silencieux", active: true },
    { key: "luggage", icon: Package, label: `Bagages : ${trip.preferences.luggage === "small" ? "petits" : trip.preferences.luggage === "medium" ? "moyens" : "grands"}`, active: true },
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
                  <h1 className="text-2xl font-bold">{trip.departure} → {trip.arrival}</h1>
                  <Badge className="bg-primary/10 text-primary border-0 text-lg px-4 py-1">{trip.price} €</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div className="w-0.5 h-8 bg-primary/30" />
                    </div>
                    <div>
                      <p className="font-semibold">{trip.departureTime} — {trip.departure}</p>
                      <p className="text-sm text-muted-foreground">{trip.date}</p>
                    </div>
                  </div>
                  {trip.stops.map((stop, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-secondary" />
                        <div className="w-0.5 h-8 bg-secondary/30" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{stop}</p>
                        <p className="text-xs text-muted-foreground">Arrêt intermédiaire</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                    <div>
                      <p className="font-semibold">{trip.arrivalTime} — {trip.arrival}</p>
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

            {/* Vehicle */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-lg">Véhicule</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{trip.vehicle.brand} {trip.vehicle.model}</p>
                    <p className="text-sm text-muted-foreground">Couleur : {trip.vehicle.color}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-lg">Avis sur {trip.driver.name}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={r.avatar} />
                      <AvatarFallback>{r.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{r.author}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
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
                  <AvatarImage src={trip.driver.avatar} />
                  <AvatarFallback>{trip.driver.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{trip.driver.name}</h3>
                  {trip.driver.verified && (
                    <Badge className="bg-primary/10 text-primary border-0 mt-1 gap-1">
                      <Shield className="h-3 w-3" /> Profil vérifié
                    </Badge>
                  )}
                </div>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(trip.driver.rating) ? "fill-secondary text-secondary" : "text-muted"}`} />
                  ))}
                  <span className="ml-1 font-semibold">{trip.driver.rating}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="font-bold text-lg">{trip.driver.tripsCompleted}</p>
                    <p className="text-muted-foreground">Trajets</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="font-bold text-lg">{trip.driver.reviewCount}</p>
                    <p className="text-muted-foreground">Avis</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Membre depuis {trip.driver.memberSince}</p>
              </CardContent>
            </Card>

            {/* Booking card */}
            <Card className="border-0 shadow-lg bg-primary text-primary-foreground">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-extrabold">{trip.price} €</p>
                  <p className="text-primary-foreground/80 text-sm">par passager</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  {trip.seatsAvailable} place{trip.seatsAvailable > 1 ? "s" : ""} disponible{trip.seatsAvailable > 1 ? "s" : ""}
                </div>
                <Button
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                  size="lg"
                  onClick={() => navigate(`/reservation/${trip.id}`)}
                >
                  Réserver ce trajet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripDetail;
