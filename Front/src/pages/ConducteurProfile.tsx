import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star, Shield, Loader2, ArrowLeft, Users, Car, Calendar,
  MapPin, ArrowRight, MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Conducteur {
  id: number;
  name: string;
  role: string;
  phone?: string;
  created_at: string;
}

interface Avis {
  id: number;
  note: number;
  commentaire?: string;
  created_at: string;
  voyageur: { id: number; name: string };
  reservation: { trajet: { id: number; depart: string; destination: string } };
}

interface ProfileData {
  conducteur: Conducteur;
  avis: Avis[];
  note_moyenne: number;
  total_avis: number;
  total_trajets: number;
  total_passagers: number;
}

const ConducteurProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/conducteurs/${id}`);
        setData(res.data);
      } catch {
        setError("Profil introuvable.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Conducteur introuvable</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </Layout>
    );
  }

  const { conducteur, avis, note_moyenne, total_avis, total_trajets, total_passagers } = data;
  const memberSince = conducteur.created_at
    ? format(parseISO(conducteur.created_at), "MMMM yyyy", { locale: fr })
    : "—";

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <Button variant="outline" size="icon" className="mb-4 h-9 w-9" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Driver card */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                  {conducteur.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold">{conducteur.name}</h1>
                <Badge className="bg-primary/10 text-primary border-0 mt-2 gap-1">
                  <Shield className="h-3 w-3" /> Conducteur
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />
                  Membre depuis {memberSince}
                </p>

                {/* Rating */}
                {note_moyenne > 0 && (
                  <div className="flex items-center gap-1 mt-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(note_moyenne) ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />
                    ))}
                    <span className="ml-2 font-semibold text-lg">{note_moyenne.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({total_avis} avis)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center bg-muted/50 rounded-xl p-4">
                <Car className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{total_trajets}</p>
                <p className="text-xs text-muted-foreground">Trajets actifs</p>
              </div>
              <div className="text-center bg-muted/50 rounded-xl p-4">
                <Users className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{total_passagers}</p>
                <p className="text-xs text-muted-foreground">Passagers</p>
              </div>
              <div className="text-center bg-muted/50 rounded-xl p-4">
                <MessageCircle className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{total_avis}</p>
                <p className="text-xs text-muted-foreground">Avis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-secondary" />
              Avis des passagers ({total_avis})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {avis.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">Aucun avis pour le moment.</p>
            ) : (
              avis.map((a) => (
                <div key={a.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {a.voyageur.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="font-semibold text-sm">{a.voyageur.name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < a.note ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {a.reservation.trajet.depart} <ArrowRight className="h-3 w-3" /> {a.reservation.trajet.destination}
                      <span className="mx-1">•</span>
                      {format(parseISO(a.created_at), "d MMM yyyy", { locale: fr })}
                    </p>
                    {a.commentaire && (
                      <p className="text-sm text-muted-foreground mt-2">{a.commentaire}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ConducteurProfile;
