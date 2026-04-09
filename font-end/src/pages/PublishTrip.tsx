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
import { MapPin, CalendarIcon, Clock, Euro, Users, PlusCircle, Trash2, Eye, Car } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface FieldErrors {
  [key: string]: string;
}

const PublishTrip = () => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("08:00");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("3");
  const [stops, setStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [luggageQty, setLuggageQty] = useState("");
  const [luggageType, setLuggageType] = useState("");
  const [gender, setGender] = useState("");
  const [smoking, setSmoking] = useState(false);
  const [music, setMusic] = useState(true);
  const [pets, setPets] = useState(false);
  const [conversation, setConversation] = useState("moderate");
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const addStop = () => {
    if (newStop.trim()) {
      setStops([...stops, newStop.trim()]);
      setNewStop("");
    }
  };

  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!departure.trim()) newErrors.departure = "Ce champ est obligatoire";
    if (!arrival.trim()) newErrors.arrival = "Ce champ est obligatoire";
    if (!date) newErrors.date = "Ce champ est obligatoire";
    if (!time) newErrors.time = "Ce champ est obligatoire";
    if (!price) newErrors.price = "Ce champ est obligatoire";
    if (!seats) newErrors.seats = "Ce champ est obligatoire";
    if (!vehicleType) newErrors.vehicleType = "Ce champ est obligatoire";
    if (!music && music === undefined) newErrors.music = "Ce champ est obligatoire";
    if (!conversation) newErrors.conversation = "Ce champ est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = () => {
    if (!validate()) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    toast({ title: "Trajet publié !", description: `${departure} → ${arrival} le ${format(date!, "d MMMM yyyy", { locale: fr })}` });
  };

  const errorClass = (field: string) => errors[field] ? "border-destructive ring-1 ring-destructive" : "";

  const conversationLabels: Record<string, string> = { quiet: "Silencieux", moderate: "Modéré", chatty: "Bavard" };
  const vehicleLabels: Record<string, string> = { sedan: "Berline", suv: "SUV", minivan: "Monospace", compact: "Compacte", coupe: "Coupé" };
  const luggageTypeLabels: Record<string, string> = { backpack: "Sac à dos", suitcase: "Valise", box: "Carton", other: "Autre" };

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
                        <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setErrors(p => ({ ...p, date: "" })); }} initialFocus className="p-3 pointer-events-auto" />
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
                {/* Stops */}
                <div className="space-y-2">
                  <Label>Arrêts intermédiaires</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Ajouter un arrêt" value={newStop} onChange={(e) => setNewStop(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStop())} />
                    <Button type="button" variant="outline" size="icon" onClick={addStop}><PlusCircle className="h-4 w-4" /></Button>
                  </div>
                  {stops.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {stops.map((s, i) => (
                        <div key={i} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
                          {s}
                          <button onClick={() => removeStop(i)}><Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Véhicule, Prix et Places */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Véhicule, prix et places</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de véhicule *</Label>
                    <Select value={vehicleType} onValueChange={(v) => { setVehicleType(v); setErrors(p => ({ ...p, vehicleType: "" })); }}>
                      <SelectTrigger className={cn(errorClass("vehicleType"))}>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Choisir" />
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
                    {errors.vehicleType && <p className="text-sm text-destructive">{errors.vehicleType}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Prix par passager (€) *</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" min="1" placeholder="25" value={price} onChange={(e) => { setPrice(e.target.value); setErrors(p => ({ ...p, price: "" })); }} className={cn("pl-9", errorClass("price"))} />
                    </div>
                    {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Places disponibles *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" min="1" max="8" value={seats} onChange={(e) => { setSeats(e.target.value); setErrors(p => ({ ...p, seats: "" })); }} className={cn("pl-9", errorClass("seats"))} />
                    </div>
                    {errors.seats && <p className="text-sm text-destructive">{errors.seats}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bagages */}
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Bagages (optionnel)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantité de bagages</Label>
                    <Input type="number" min="0" max="10" placeholder="Ex: 2" value={luggageQty} onChange={(e) => setLuggageQty(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Type de bagages</Label>
                    <Select value={luggageType} onValueChange={setLuggageType}>
                      <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="backpack">Sac à dos</SelectItem>
                        <SelectItem value="suitcase">Valise</SelectItem>
                        <SelectItem value="box">Carton</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
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
                    <Label>Fumeur autorisé (optionnel)</Label>
                    <Switch checked={smoking} onCheckedChange={setSmoking} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Musique *</Label>
                    <Switch checked={music} onCheckedChange={setMusic} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Animaux acceptés *</Label>
                    <Switch checked={pets} onCheckedChange={setPets} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Niveau de conversation *</Label>
                  <Select value={conversation} onValueChange={(v) => { setConversation(v); setErrors(p => ({ ...p, conversation: "" })); }}>
                    <SelectTrigger className={cn(errorClass("conversation"))}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiet">Silencieux</SelectItem>
                      <SelectItem value="moderate">Modéré</SelectItem>
                      <SelectItem value="chatty">Bavard</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.conversation && <p className="text-sm text-destructive">{errors.conversation}</p>}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" onClick={() => setPreview(true)}>
                <Eye className="h-4 w-4" /> Aperçu
              </Button>
              <Button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" onClick={handlePublish}>
                Publier le trajet
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
                  {stops.length > 0 && <p><strong>Arrêts :</strong> {stops.join(", ")}</p>}
                  <p><strong>Date :</strong> {date ? format(date, "d MMMM yyyy", { locale: fr }) : "—"} à {time}</p>
                  <p><strong>Véhicule :</strong> {vehicleLabels[vehicleType] || "—"}</p>
                  <p><strong>Prix :</strong> {price} € / passager</p>
                  <p><strong>Places :</strong> {seats}</p>
                  {luggageQty && <p><strong>Bagages :</strong> {luggageQty} {luggageTypeLabels[luggageType] ? `(${luggageTypeLabels[luggageType]})` : ""}</p>}
                  {gender && <p><strong>Genre :</strong> {gender === "homme" ? "Homme" : "Femme"}</p>}
                  <p><strong>Préférences :</strong> {[
                    smoking ? "Fumeur OK" : "Non-fumeur",
                    music ? "Musique" : "Pas de musique",
                    pets ? "Animaux OK" : "Pas d'animaux",
                    conversationLabels[conversation],
                  ].join(", ")}</p>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPreview(false)}>Modifier</Button>
              <Button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" onClick={handlePublish}>
                Confirmer et publier
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PublishTrip;
