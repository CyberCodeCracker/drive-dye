import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, CalendarIcon, Clock, Euro, Users, PlusCircle, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const PublishTrip = () => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("08:00");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("3");
  const [stops, setStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState("");
  const [smoking, setSmoking] = useState(false);
  const [music, setMusic] = useState(true);
  const [pets, setPets] = useState(false);
  const [conversation, setConversation] = useState("moderate");
  const [luggage, setLuggage] = useState("medium");
  const [preview, setPreview] = useState(false);

  const addStop = () => {
    if (newStop.trim()) {
      setStops([...stops, newStop.trim()]);
      setNewStop("");
    }
  };

  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));

  const handlePublish = () => {
    if (!departure || !arrival || !date || !price) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    toast({ title: "Trajet publié !", description: `${departure} → ${arrival} le ${format(date, "d MMMM yyyy", { locale: fr })}` });
  };

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Publier un trajet</h1>
        <p className="text-muted-foreground mb-8">Partagez votre itinéraire et vos frais avec d'autres voyageurs.</p>

        {!preview ? (
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Itinéraire</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Départ *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Ville de départ" value={departure} onChange={(e) => setDeparture(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Arrivée *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
                      <Input placeholder="Ville d'arrivée" value={arrival} onChange={(e) => setArrival(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "d MMM yyyy", { locale: fr }) : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Heure de départ</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-9" />
                    </div>
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

            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Prix et places</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prix par passager (€) *</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" min="1" placeholder="25" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Places disponibles</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" min="1" max="8" value={seats} onChange={(e) => setSeats(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Préférences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Fumeur autorisé</Label>
                    <Switch checked={smoking} onCheckedChange={setSmoking} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Musique</Label>
                    <Switch checked={music} onCheckedChange={setMusic} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Animaux acceptés</Label>
                    <Switch checked={pets} onCheckedChange={setPets} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Niveau de conversation</Label>
                    <Select value={conversation} onValueChange={setConversation}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiet">Silencieux</SelectItem>
                        <SelectItem value="moderate">Modéré</SelectItem>
                        <SelectItem value="chatty">Bavard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Taille des bagages</Label>
                    <Select value={luggage} onValueChange={setLuggage}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Petits</SelectItem>
                        <SelectItem value="medium">Moyens</SelectItem>
                        <SelectItem value="large">Grands</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  <p><strong>Prix :</strong> {price} € / passager</p>
                  <p><strong>Places :</strong> {seats}</p>
                  <p><strong>Préférences :</strong> {[
                    smoking ? "Fumeur OK" : "Non-fumeur",
                    music ? "Musique" : "Pas de musique",
                    pets ? "Animaux OK" : "Pas d'animaux",
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
