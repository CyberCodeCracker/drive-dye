import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle2 } from "lucide-react";
import { trips } from "@/data/mockData";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ReviewTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const trip = trips.find((t) => t.id === id);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  if (!trip) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Trajet introuvable</h1>
          <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = () => {
    const newErrors: { rating?: string; comment?: string } = {};
    if (rating === 0) newErrors.rating = "Veuillez donner une note";
    if (!comment.trim()) newErrors.comment = "Veuillez écrire un commentaire";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitted(true);
    toast({ title: "Merci pour votre avis !", description: `Vous avez donné ${rating} étoile${rating > 1 ? "s" : ""} pour ce trajet.` });
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container py-20 max-w-lg mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Merci pour votre avis !</h1>
          <p className="text-muted-foreground">
            Votre évaluation aide la communauté à voyager en toute confiance.
          </p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={cn("h-6 w-6", s <= rating ? "fill-secondary text-secondary" : "text-muted-foreground")} />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
            <Button onClick={() => navigate("/recherche")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Chercher un trajet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Évaluer votre trajet</h1>
        <p className="text-muted-foreground mb-8">Partagez votre expérience pour aider les autres voyageurs.</p>

        {/* Trip summary */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <img src={trip.driver.avatar} alt={trip.driver.name} className="w-12 h-12 rounded-full ring-2 ring-primary/20" />
              <div className="flex-1">
                <p className="font-semibold">{trip.driver.name}</p>
                <p className="text-sm text-muted-foreground">{trip.departure} → {trip.arrival} • {trip.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle>Votre évaluation</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {/* Star rating */}
            <div className="space-y-2">
              <Label>Note *</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => { setRating(s); setErrors(p => ({ ...p, rating: undefined })); }}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className={cn(
                      "h-8 w-8 transition-colors",
                      s <= (hoverRating || rating) ? "fill-secondary text-secondary" : "text-muted-foreground/40"
                    )} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 1 && "Mauvais"}
                  {rating === 2 && "Pas terrible"}
                  {rating === 3 && "Correct"}
                  {rating === 4 && "Bien"}
                  {rating === 5 && "Excellent !"}
                </p>
              )}
              {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label>Commentaire *</Label>
              <Textarea
                placeholder="Décrivez votre expérience de voyage..."
                value={comment}
                onChange={(e) => { setComment(e.target.value); setErrors(p => ({ ...p, comment: undefined })); }}
                className={cn("min-h-[120px]", errors.comment ? "border-destructive ring-1 ring-destructive" : "")}
              />
              {errors.comment && <p className="text-sm text-destructive">{errors.comment}</p>}
            </div>

            <Button
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
              size="lg"
              onClick={handleSubmit}
            >
              Envoyer mon avis
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReviewTrip;
