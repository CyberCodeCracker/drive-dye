import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, CalendarIcon, Clock, Euro, Users, PlusCircle, Trash2, Eye, Car, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface FieldErrors { [key: string]: string; }

const PublishTrip = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDriver } = useAuth();

  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("08:00");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [seats, setSeats] = useState("3");
  const [vehicleType, setVehicleType] = useState("");
  const [bagage, setBagage] = useState("");
  const [genre, setGenre] = useState("");
  const [smoking, setSmoking] = useState(false);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  // Auth guard
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-20 max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Connexion requise</h1>
          <p className="text-muted-foreground">Vous devez être connecté pour publier un trajet.</p>
          <Button onClick={() => navigate("/login", { state: { from: { pathname: "/publier" } } })}>
            Se connecter
          </Button>
        </div>
      </Layout>
    );
  }

  if (!isDriver) {
    return (
      <Layout>
        <div className="container py-20 max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Car className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Réservé aux conducteurs</h1>
          <p className="text-muted-foreground">Seuls les comptes conducteur peuvent publier des trajets.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </Layout>
    );
  }

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!departure.trim()) newErrors.departure = "Ce champ est obligatoire";
    if (!arrival.trim()) newErrors.arrival = "Ce champ est obligatoire";
    if (!date) newErrors.date = "Ce champ est obligatoire";
    if (!time) newErrors.time = "Ce champ est obligatoire";
    if (!prixMin) newErrors.prixMin = "Ce champ est obligatoire";
    if (!prixMax) newErrors.prixMax = "Ce champ est obligatoire";
    if (Number(prixMax) < Number(prixMin)) newErrors.prixMax = "Le prix max doit être ≥ au prix min";
    if (!seats) newErrors.seats = "Ce champ est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const dateHeure = `${format(date!, "yyyy-MM-dd")}T${time}:00`;
      await api.post("/trajets", {
        depart: departure,
        destination: arrival,
        date_heure: dateHeure,
        nb_places: Number(seats),
        prix_min: Number(prixMin),
        prix_max: Number(prixMax),
        type_vehicule: vehicleType || undefined,
        bagage: bagage || undefined,
        fumeur: smoking,
        genre: genre || undefined,
      });
      toast({ title: "Trajet publié !", description: `${departure} → ${arrival} le ${format(date!, "d MMMM yyyy", { locale: fr })}` });
      navigate("/");
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0] as string[];
        toast({ title: "Erreur", description: first[0], variant: "destructive" });
      } else {
        toast({ title: "Erreur", description: err?.response?.data?.message || "Une erreur est survenue.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const errorClass = (field: string) => errors[field] ? "border-destructive ring-1 ring-destructive" : "";

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Publier un trajet</h1>
        <p className="text-muted-foreground mb-8">Partagez votre itinéraire et vos frais avec d'autres voyageurs.</p>

        {!preview ? (
          <div className="space-y-6">
            {/* Itinéraire */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Itinéraire</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Départ *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Ville de départ" value={departure} onChange={(e) => { setDeparture(e.target.value); setErrors(p => ({ ...p, departure: "" })); }} className={cn("pl-9", errorClass("departure"))} />
                    </div>
                    {errors.departure && <p className="text-sm text-destructive">{errors.departure}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Arrivée *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
                      <Input placeholder="Ville d'arrivée" value={arrival} onChange={(e) => { setArrival(e.target.value); setErrors(p => ({ ...p, arrival: "" })); }} className={cn("pl-9", errorClass("arrival"))} />
                    </div>
                    {errors.arrival && <p className="text-sm text-destructive">{errors.arrival}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start", !date && "text-muted-foreground", errorClass("date"))}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "d MMM yyyy", { locale: fr }) : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setErrors(p => ({ ...p, date: "" })); }} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                    {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Heure de départ *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="time" value={time} onChange={(e) => { setTime(e.target.value); setErrors(p => ({ ...p, time: "" })); }} className={cn("pl-9", errorClass("time"))} />
                    </div>
                    {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Véhicule, Prix et Places */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Véhicule, prix et places</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de véhicule</Label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Choisir (optionnel)" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Berline</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="minivan">Monospace</SelectItem>
                        <SelectItem value="compact">Compacte</SelectItem>
                        <SelectItem value="coupe">Coupé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Places disponibles *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" min="1" max="8" value={seats} onChange={(e) => { setSeats(e.target.value); setErrors(p => ({ ...p, seats: "" })); }} className={cn("pl-9", errorClass("seats"))} />
                    </div>
                    {errors.seats && <p className="text-sm text-destructive">{errors.seats}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prix min par passager (€) *</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" min="1" placeholder="20" value={prixMin} onChange={(e) => { setPrixMin(e.target.value); setErrors(p => ({ ...p, prixMin: "" })); }} className={cn("pl-9", errorClass("prixMin"))} />
                    </div>
                    {errors.prixMin && <p className="text-sm text-destructive">{errors.prixMin}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Prix max par passager (€) *</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" min="1" placeholder="35" value={prixMax} onChange={(e) => { setPrixMax(e.target.value); setErrors(p => ({ ...p, prixMax: "" })); }} className={cn("pl-9", errorClass("prixMax"))} />
                    </div>
                    {errors.prixMax && <p className="text-sm text-destructive">{errors.prixMax}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Préférences */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Préférences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Genre (optionnel)</Label>
                  <RadioGroup value={genre} onValueChange={setGenre} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="homme" id="homme" />
                      <Label htmlFor="homme" className="cursor-pointer">Homme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="femme" id="femme" />
                      <Label htmlFor="femme" className="cursor-pointer">Femme</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Fumeur autorisé</Label>
                    <Switch checked={smoking} onCheckedChange={setSmoking} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bagages acceptés</Label>
                    <Select value={bagage} onValueChange={setBagage}>
                      <SelectTrigger><SelectValue placeholder="Choisir (optionnel)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petit">Petits bagages</SelectItem>
                        <SelectItem value="moyen">Bagages moyens</SelectItem>
                        <SelectItem value="grand">Grands bagages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" onClick={() => validate() && setPreview(true)}>
                <Eye className="h-4 w-4" /> Aperçu
              </Button>
              <Button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" onClick={handlePublish} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Publication...</> : "Publier le trajet"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Aperçu de votre trajet</h2>
                <div className="space-y-3">
                  <p><strong>Trajet :</strong> {departure} → {arrival}</p>
                  <p><strong>Date :</strong> {date ? format(date, "d MMMM yyyy", { locale: fr }) : "—"} à {time}</p>
                  <p><strong>Places :</strong> {seats}</p>
                  <p><strong>Prix :</strong> {prixMin} € — {prixMax} € / passager</p>
                  {vehicleType && <p><strong>Véhicule :</strong> {vehicleType}</p>}
                  {bagage && <p><strong>Bagages :</strong> {bagage}</p>}
                  {genre && <p><strong>Genre :</strong> {genre}</p>}
                  <p><strong>Fumeur :</strong> {smoking ? "Accepté" : "Non"}</p>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPreview(false)}>Modifier</Button>
              <Button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" onClick={handlePublish} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Publication...</> : "Confirmer et publier"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PublishTrip;
