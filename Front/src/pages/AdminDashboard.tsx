import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Car, CalendarCheck, TrendingUp, Trash2, Ban, CheckCircle, Loader2, Lock, ShieldAlert, Clock, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStats {
  total_users: number;
  total_voyageurs: number;
  total_conducteurs: number;
  total_trajets: number;
  trajets_actifs: number;
  trajets_en_attente: number;
  total_reservations: number;
  reservations_confirmees: number;
  reservations_en_attente: number;
  users_bloques: number;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

interface AdminTrajet {
  id: number;
  depart: string;
  destination: string;
  date_heure: string;
  prix_min: number;
  nb_places: number;
  statut: string;
  conducteur: { id: number; name: string };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trajets, setTrajets] = useState<AdminTrajet[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTrajets, setLoadingTrajets] = useState(true);
  const [pendingTrajets, setPendingTrajets] = useState<AdminTrajet[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [approveLoading, setApproveLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    api.get("/admin/dashboard").then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoadingStats(false));
    api.get("/admin/users").then(({ data }) => setUsers(data.data ?? data)).catch(() => {}).finally(() => setLoadingUsers(false));
    api.get("/admin/trajets").then(({ data }) => setTrajets(data.data ?? data)).catch(() => {}).finally(() => setLoadingTrajets(false));
    api.get("/admin/trajets?statut=en_attente").then(({ data }) => setPendingTrajets(data.data ?? data)).catch(() => {}).finally(() => setLoadingPending(false));
  }, [isAdmin]);

  const handleBlockUser = async (user: AdminUser) => {
    try {
      const { data } = await api.put(`/admin/users/${user.id}/block`);
      setUsers(prev => prev.map(u => u.id === user.id ? data.user : u));
      setStats(prev => prev ? {
        ...prev,
        users_bloques: prev.users_bloques + (data.user.is_blocked ? 1 : -1),
      } : prev);
      toast({ title: data.message });
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier cet utilisateur.", variant: "destructive" });
    }
  };

  const handleDeleteTrajet = async (trajetId: number) => {
    if (!confirm("Supprimer ce trajet définitivement ?")) return;
    try {
      const deleted = trajets.find(t => t.id === trajetId);
      await api.delete(`/admin/trajets/${trajetId}`);
      setTrajets(prev => prev.filter(t => t.id !== trajetId));
      setStats(prev => prev ? {
        ...prev,
        total_trajets: prev.total_trajets - 1,
        trajets_actifs: prev.trajets_actifs - (deleted?.statut === "actif" ? 1 : 0),
      } : prev);
      toast({ title: "Trajet supprimé." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer ce trajet.", variant: "destructive" });
    }
  };

  const handleApprove = async (trajetId: number) => {
    setApproveLoading(trajetId);
    try {
      const { data } = await api.put(`/admin/trajets/${trajetId}/approve`);
      setPendingTrajets(prev => prev.filter(t => t.id !== trajetId));
      setTrajets(prev => prev.map(t => t.id === trajetId ? data.trajet : t));
      setStats(prev => prev ? {
        ...prev,
        trajets_en_attente: prev.trajets_en_attente - 1,
        trajets_actifs: prev.trajets_actifs + 1,
      } : prev);
      toast({ title: "Trajet approuvé" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'approuver ce trajet.", variant: "destructive" });
    } finally {
      setApproveLoading(null);
    }
  };

  const handleReject = async (trajetId: number) => {
    setApproveLoading(trajetId);
    try {
      const { data } = await api.put(`/admin/trajets/${trajetId}/reject`);
      setPendingTrajets(prev => prev.filter(t => t.id !== trajetId));
      setTrajets(prev => prev.map(t => t.id === trajetId ? data.trajet : t));
      setStats(prev => prev ? {
        ...prev,
        trajets_en_attente: prev.trajets_en_attente - 1,
      } : prev);
      toast({ title: "Trajet refusé" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de refuser ce trajet.", variant: "destructive" });
    } finally {
      setApproveLoading(null);
    }
  };

  const formatDate = (dt: string) => {
    try { return format(parseISO(dt), "d MMM yyyy", { locale: fr }); }
    catch { return dt; }
  };

  // Auth guards
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-20 max-w-md mx-auto text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Connexion requise</h1>
          <Button onClick={() => navigate("/login")}>Se connecter</Button>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-20 max-w-md mx-auto text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Accès refusé</h1>
          <p className="text-muted-foreground">Cette page est réservée aux administrateurs.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </Layout>
    );
  }

  const statCards = stats ? [
    { label: "Utilisateurs", value: stats.total_users.toLocaleString(), sub: `${stats.total_voyageurs} voyageurs · ${stats.total_conducteurs} conducteurs`, icon: Users, color: "text-primary" },
    { label: "Trajets", value: stats.total_trajets.toLocaleString(), sub: `${stats.trajets_actifs} actifs · ${stats.trajets_en_attente} en attente`, icon: Car, color: "text-secondary" },
    { label: "Réservations", value: stats.total_reservations.toLocaleString(), sub: `${stats.reservations_confirmees} confirmées · ${stats.reservations_en_attente} en attente`, icon: CalendarCheck, color: "text-primary" },
    { label: "Utilisateurs bloqués", value: stats.users_bloques.toLocaleString(), sub: "comptes suspendus", icon: Ban, color: "text-destructive" },
  ] : [];

  const chartData = stats ? [
    { label: "Voyageurs", value: stats.total_voyageurs },
    { label: "Conducteurs", value: stats.total_conducteurs },
    { label: "Bloqués", value: stats.users_bloques },
  ] : [];

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-0 gap-1">
            <TrendingUp className="h-3 w-3" /> En ligne
          </Badge>
        </div>

        {/* Stats */}
        {loadingStats ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground/70">{s.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Chart */}
        {stats && (
          <div className="mb-8">
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Répartition des utilisateurs</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="value" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="demandes">
          <TabsList>
            <TabsTrigger value="demandes" className="gap-1.5">
              Demandes
              {stats && stats.trajets_en_attente > 0 && (
                <Badge className="bg-amber-500 text-white border-0 h-5 min-w-5 px-1.5 text-xs">{stats.trajets_en_attente}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="trajets">Trajets</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="demandes">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                {loadingPending ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trajet</TableHead>
                        <TableHead>Conducteur</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Places</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingTrajets.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucune demande en attente.</TableCell></TableRow>
                      )}
                      {pendingTrajets.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.depart} → {t.destination}</TableCell>
                          <TableCell>{t.conducteur?.name ?? "—"}</TableCell>
                          <TableCell>{formatDate(t.date_heure)}</TableCell>
                          <TableCell>{t.prix_min} TND</TableCell>
                          <TableCell>{t.nb_places}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Approuver"
                                disabled={approveLoading === t.id}
                                onClick={() => handleApprove(t.id)}
                              >
                                {approveLoading === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-primary" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Refuser"
                                disabled={approveLoading === t.id}
                                onClick={() => handleReject(t.id)}
                              >
                                {approveLoading === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 text-destructive" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trajets">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                {loadingTrajets ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trajet</TableHead>
                        <TableHead>Conducteur</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trajets.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun trajet.</TableCell></TableRow>
                      )}
                      {trajets.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.depart} → {t.destination}</TableCell>
                          <TableCell>{t.conducteur?.name ?? "—"}</TableCell>
                          <TableCell>{formatDate(t.date_heure)}</TableCell>
                          <TableCell>{t.prix_min} TND</TableCell>
                          <TableCell>
                            <Badge className={
                              t.statut === "actif" ? "bg-primary/10 text-primary border-0" :
                              t.statut === "en_attente" ? "bg-amber-500/10 text-amber-600 border-0" :
                              t.statut === "annule" ? "bg-destructive/10 text-destructive border-0" :
                              "bg-muted text-muted-foreground border-0"
                            }>
                              {t.statut === "en_attente" ? "En attente" : t.statut}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Supprimer ce trajet"
                              aria-label="Supprimer"
                              onClick={() => handleDeleteTrajet(t.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Inscrit le</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun utilisateur.</TableCell></TableRow>
                      )}
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                          <TableCell>
                            <Badge className={!u.is_blocked ? "bg-primary/10 text-primary border-0" : "bg-destructive/10 text-destructive border-0"}>
                              {!u.is_blocked ? "Actif" : "Bloqué"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{formatDate(u.created_at)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={u.is_blocked ? "Débloquer" : "Bloquer"}
                              onClick={() => handleBlockUser(u)}
                            >
                              {u.is_blocked
                                ? <CheckCircle className="h-4 w-4 text-primary" />
                                : <Ban className="h-4 w-4 text-destructive" />
                              }
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
