export interface Trip {
  id: string;
  driver: Driver;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  price: number;
  seatsAvailable: number;
  seatsTotal: number;
  stops: string[];
  preferences: {
    smoking: boolean;
    music: boolean;
    pets: boolean;
    conversation: 'quiet' | 'moderate' | 'chatty';
    luggage: 'small' | 'medium' | 'large';
  };
  vehicle: { brand: string; model: string; color: string };
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  tripsCompleted: number;
  memberSince: string;
  verified: boolean;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

const drivers: Driver[] = [
  { id: '1', name: 'Marie Dupont', avatar: 'https://i.pravatar.cc/150?img=1', rating: 4.8, reviewCount: 124, tripsCompleted: 256, memberSince: '2021', verified: true },
  { id: '2', name: 'Lucas Martin', avatar: 'https://i.pravatar.cc/150?img=3', rating: 4.6, reviewCount: 87, tripsCompleted: 143, memberSince: '2022', verified: true },
  { id: '3', name: 'Sophie Bernard', avatar: 'https://i.pravatar.cc/150?img=5', rating: 4.9, reviewCount: 203, tripsCompleted: 389, memberSince: '2020', verified: true },
  { id: '4', name: 'Thomas Petit', avatar: 'https://i.pravatar.cc/150?img=8', rating: 4.3, reviewCount: 45, tripsCompleted: 78, memberSince: '2023', verified: false },
  { id: '5', name: 'Camille Leroy', avatar: 'https://i.pravatar.cc/150?img=9', rating: 4.7, reviewCount: 156, tripsCompleted: 312, memberSince: '2021', verified: true },
  { id: '6', name: 'Antoine Moreau', avatar: 'https://i.pravatar.cc/150?img=11', rating: 4.5, reviewCount: 98, tripsCompleted: 167, memberSince: '2022', verified: true },
];

export const trips: Trip[] = [
  { id: '1', driver: drivers[0], departure: 'Paris', arrival: 'Lyon', departureTime: '08:00', arrivalTime: '12:30', date: '2026-04-05', price: 32, seatsAvailable: 3, seatsTotal: 4, stops: ['Auxerre', 'Beaune'], preferences: { smoking: false, music: true, pets: false, conversation: 'chatty', luggage: 'medium' }, vehicle: { brand: 'Renault', model: 'Mégane', color: 'Gris' } },
  { id: '2', driver: drivers[1], departure: 'Paris', arrival: 'Lyon', departureTime: '10:00', arrivalTime: '14:00', date: '2026-04-05', price: 28, seatsAvailable: 2, seatsTotal: 3, stops: ['Dijon'], preferences: { smoking: false, music: true, pets: true, conversation: 'moderate', luggage: 'large' }, vehicle: { brand: 'Peugeot', model: '308', color: 'Bleu' } },
  { id: '3', driver: drivers[2], departure: 'Paris', arrival: 'Lyon', departureTime: '14:00', arrivalTime: '18:30', date: '2026-04-05', price: 35, seatsAvailable: 1, seatsTotal: 4, stops: ['Fontainebleau', 'Mâcon'], preferences: { smoking: false, music: false, pets: false, conversation: 'quiet', luggage: 'small' }, vehicle: { brand: 'Tesla', model: 'Model 3', color: 'Blanc' } },
  { id: '4', driver: drivers[3], departure: 'Marseille', arrival: 'Nice', departureTime: '09:00', arrivalTime: '11:30', date: '2026-04-06', price: 18, seatsAvailable: 4, seatsTotal: 4, stops: ['Toulon'], preferences: { smoking: true, music: true, pets: true, conversation: 'chatty', luggage: 'medium' }, vehicle: { brand: 'Citroën', model: 'C4', color: 'Rouge' } },
  { id: '5', driver: drivers[4], departure: 'Bordeaux', arrival: 'Toulouse', departureTime: '07:30', arrivalTime: '10:00', date: '2026-04-05', price: 22, seatsAvailable: 2, seatsTotal: 3, stops: ['Agen'], preferences: { smoking: false, music: true, pets: false, conversation: 'moderate', luggage: 'large' }, vehicle: { brand: 'Volkswagen', model: 'Golf', color: 'Noir' } },
  { id: '6', driver: drivers[5], departure: 'Lyon', arrival: 'Marseille', departureTime: '06:00', arrivalTime: '09:30', date: '2026-04-07', price: 30, seatsAvailable: 3, seatsTotal: 4, stops: ['Valence', 'Avignon'], preferences: { smoking: false, music: true, pets: false, conversation: 'chatty', luggage: 'medium' }, vehicle: { brand: 'BMW', model: 'Série 3', color: 'Gris' } },
  { id: '7', driver: drivers[0], departure: 'Lille', arrival: 'Paris', departureTime: '16:00', arrivalTime: '19:00', date: '2026-04-05', price: 20, seatsAvailable: 2, seatsTotal: 4, stops: ['Arras'], preferences: { smoking: false, music: true, pets: false, conversation: 'moderate', luggage: 'small' }, vehicle: { brand: 'Renault', model: 'Mégane', color: 'Gris' } },
  { id: '8', driver: drivers[2], departure: 'Nantes', arrival: 'Rennes', departureTime: '11:00', arrivalTime: '12:30', date: '2026-04-06', price: 12, seatsAvailable: 3, seatsTotal: 4, stops: [], preferences: { smoking: false, music: false, pets: true, conversation: 'quiet', luggage: 'medium' }, vehicle: { brand: 'Tesla', model: 'Model 3', color: 'Blanc' } },
];

export const reviews: Review[] = [
  { id: '1', author: 'Julie R.', avatar: 'https://i.pravatar.cc/150?img=20', rating: 5, comment: 'Très bon trajet, conductrice agréable et ponctuelle !', date: '2026-03-15' },
  { id: '2', author: 'Marc D.', avatar: 'https://i.pravatar.cc/150?img=12', rating: 4, comment: 'Voyage confortable, je recommande.', date: '2026-03-10' },
  { id: '3', author: 'Léa S.', avatar: 'https://i.pravatar.cc/150?img=23', rating: 5, comment: 'Super expérience, voiture propre et bonne discussion !', date: '2026-02-28' },
  { id: '4', author: 'Pierre L.', avatar: 'https://i.pravatar.cc/150?img=14', rating: 4, comment: 'Bon trajet dans l\'ensemble, petit retard au départ.', date: '2026-02-20' },
];

export const popularRoutes = [
  { from: 'Paris', to: 'Lyon', price: 28, image: '🏙️' },
  { from: 'Paris', to: 'Bordeaux', price: 35, image: '🍷' },
  { from: 'Lyon', to: 'Marseille', price: 25, image: '🌊' },
  { from: 'Toulouse', to: 'Montpellier', price: 15, image: '☀️' },
  { from: 'Lille', to: 'Paris', price: 18, image: '🚄' },
  { from: 'Nantes', to: 'Rennes', price: 12, image: '🌿' },
];

export const adminStats = {
  totalTrips: 12458,
  totalUsers: 8934,
  totalBookings: 34567,
  revenue: 156780,
  monthlyTrips: [
    { month: 'Jan', trips: 890, bookings: 2340 },
    { month: 'Fév', trips: 1020, bookings: 2780 },
    { month: 'Mar', trips: 1340, bookings: 3560 },
    { month: 'Avr', trips: 1560, bookings: 4120 },
    { month: 'Mai', trips: 1780, bookings: 4890 },
    { month: 'Juin', trips: 1450, bookings: 3780 },
  ],
  recentUsers: [
    { id: '1', name: 'Emma Blanc', email: 'emma@email.com', role: 'user', status: 'active', trips: 12 },
    { id: '2', name: 'Hugo Roux', email: 'hugo@email.com', role: 'user', status: 'active', trips: 8 },
    { id: '3', name: 'Chloé Faure', email: 'chloe@email.com', role: 'driver', status: 'active', trips: 45 },
    { id: '4', name: 'Nathan Girard', email: 'nathan@email.com', role: 'user', status: 'suspended', trips: 2 },
    { id: '5', name: 'Manon Bonnet', email: 'manon@email.com', role: 'driver', status: 'active', trips: 67 },
  ],
};
