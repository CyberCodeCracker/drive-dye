import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Car, CalendarCheck, Euro, TrendingUp, Eye, Trash2, Ban } from "lucide-react";
import { adminStats, trips } from "@/data/mockData";

const AdminDashboard = () => {
  const statCards = [
    { label: "Trajets publiés", value: adminStats.totalTrips.toLocaleString(), icon: Car, color: "text-primary" },
    { label: "Utilisateurs", value: adminStats.totalUsers.toLocaleString(), icon: Users, color: "text-secondary" },
    { label: "Réservations", value: adminStats.totalBookings.toLocaleString(), icon: CalendarCheck, color: "text-primary" },
    { label: "Revenus", value: `${adminStats.revenue.toLocaleString()} €`, icon: Euro, color: "text-secondary" },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground">Vue d'ensemble de la plateforme CovoitFacile</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-0 gap-1">
            <TrendingUp className="h-3 w-3" /> En ligne
          </Badge>
        </div>

        {/* Stats */}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle>Trajets par mois</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={adminStats.monthlyTrips}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="trips" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle>Réservations par mois</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={adminStats.monthlyTrips}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(43, 96%, 56%)" strokeWidth={3} dot={{ fill: "hsl(43, 96%, 56%)", strokeWidth: 0, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trips">
          <TabsList>
            <TabsTrigger value="trips">Trajets récents</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>
          <TabsContent value="trips">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
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
                    {trips.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.departure} → {t.arrival}</TableCell>
                        <TableCell>{t.driver.name}</TableCell>
                        <TableCell>{t.date}</TableCell>
                        <TableCell>{t.price} €</TableCell>
                        <TableCell>{t.seatsAvailable}/{t.seatsTotal}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Trajets</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminStats.recentUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                        <TableCell>
                          <Badge className={u.status === "active" ? "bg-primary/10 text-primary border-0" : "bg-destructive/10 text-destructive border-0"}>
                            {u.status === "active" ? "Actif" : "Suspendu"}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.trips}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon"><Ban className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
