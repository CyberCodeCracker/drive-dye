import { Car } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card mt-auto">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Car className="h-4 w-4" />
            </div>
            <span>Covoit<span className="text-primary">Facile</span></span>
          </div>
          <p className="text-sm text-muted-foreground">
            La plateforme de covoiturage qui rend vos trajets plus simples, économiques et écologiques.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Navigation</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition-colors">Accueil</Link></li>
            <li><Link to="/recherche" className="hover:text-primary transition-colors">Rechercher</Link></li>
            <li><Link to="/publier" className="hover:text-primary transition-colors">Publier un trajet</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Informations</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><span className="hover:text-primary cursor-pointer transition-colors">À propos</span></li>
            <li><span className="hover:text-primary cursor-pointer transition-colors">Comment ça marche</span></li>
            <li><span className="hover:text-primary cursor-pointer transition-colors">Sécurité</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Légal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><span className="hover:text-primary cursor-pointer transition-colors">Conditions d'utilisation</span></li>
            <li><span className="hover:text-primary cursor-pointer transition-colors">Politique de confidentialité</span></li>
            <li><span className="hover:text-primary cursor-pointer transition-colors">Mentions légales</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
        © 2026 CovoitFacile. Tous droits réservés.
      </div>
    </div>
  </footer>
);

export default Footer;
