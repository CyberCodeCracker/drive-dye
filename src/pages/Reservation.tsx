import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Euro, CheckCircle2, ArrowRight } from "lucide-react";
import { trips } from "@/data/mockData";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Reservation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const trip = trips.find((t) => t.id === id);
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  if (!trip) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Trajet introuvable</h1>
          <Button onClick={() => navigate("/recherche")}>Retour aux résultats</Button>
        </div>
      </Layout>
    );
  }

  const handleConfirm = () => {
    setConfirmed(true);
    toast({ title: "Réservation confirmée !", description: `${seats} place${seats > 1 ? "s" : ""} réservée${seats > 1 ? "s" : ""} pour ${trip.departure} → ${trip.arrival}` });
  };

  if (confirmed) {
    return (
      <Layout>
        <div className="container py-20 max-w-lg mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Réservation confirmée !</h1>
          <p className="text-muted-foreground">
            Vous avez réservé {seats} place{seats > 1 ? "s" : ""} pour le trajet {trip.departure} → {trip.arrival} le {trip.date}.
          </p>
          <Card className="border-0 shadow-md text-left">
            <CardContent className="p-5 space-y-2">
              <p className="font-semibold">{trip.departure} → {trip.arrival}</p>
              <p className="text-sm text-muted-foreground">{trip.date} • {trip.departureTime} - {trip.arrivalTime}</p>
              <p className="text-sm">Conducteur : {trip.driver.name}</p>
              <p className="font-bold text-primary text-lg">Total : {trip.price * seats} €</p>
            </CardContent>
          </Card>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
            <Button onClick={() => navigate("/recherche")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Chercher un autre trajet</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Réserver votre trajet</h1>
        <p className="text-muted-foreground mb-8">Vérifiez les détails et confirmez votre réservation.</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
            {/* Trip summary */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Récapitulatif du trajet</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <img src={trip.driver.avatar} alt={trip.driver.name} className="w-12 h-12 rounded-full ring-2 ring-primary/20" />
                  <div>
                    <p className="font-semibold">{trip.driver.name}</p>
                    <p className="text-sm text-muted-foreground">⭐ {trip.driver.rating} ({trip.driver.reviewCount} avis)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p className="font-bold text-lg">{trip.departureTime}</p>
                    <p className="text-muted-foreground">{trip.departure}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-bold text-lg">{trip.arrivalTime}</p>
                    <p className="text-muted-foreground">{trip.arrival}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{trip.date} • {trip.vehicle.brand} {trip.vehicle.model}</p>
              </CardContent>
            </Card>

            {/* Booking form */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Détails de la réservation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre de places</Label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" disabled={seats <= 1} onClick={() => setSeats(seats - 1)}>-</Button>
                    <span className="text-xl font-bold w-8 text-center">{seats}</span>
                    <Button variant="outline" size="icon" disabled={seats >= trip.seatsAvailable} onClick={() => setSeats(seats + 1)}>+</Button>
                    <span className="text-sm text-muted-foreground ml-2">{trip.seatsAvailable} disponible{trip.seatsAvailable > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Message au conducteur (optionnel)</Label>
                  <Textarea placeholder="Bonjour, je souhaite réserver une place..." value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price sidebar */}
          <div className="md:col-span-2">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Détail du prix</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{trip.price} € × {seats} passager{seats > 1 ? "s" : ""}</span>
                    <span>{trip.price * seats} €</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frais de service</span>
                    <span>0 €</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{trip.price * seats} €</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                  size="lg"
                  onClick={handleConfirm}
                >
                  Confirmer la réservation
                </Button>
                <p className="text-xs text-center text-muted-foreground">Annulation gratuite jusqu'à 24h avant le départ</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reservation;
