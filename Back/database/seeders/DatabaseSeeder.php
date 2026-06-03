<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Wipe (order matters – FK constraints) ───────────────────────
        DB::statement('PRAGMA foreign_keys = OFF;');
        DB::table('notifications')->truncate();
        DB::table('avis')->truncate();
        DB::table('reservations')->truncate();
        DB::table('trajets')->truncate();
        DB::table('vehicules')->truncate();
        DB::table('users')->truncate();
        DB::statement('PRAGMA foreign_keys = ON;');

        // ─── 1. ADMIN ─────────────────────────────────────────────────────
        User::create([
            'name'     => 'Administrateur',
            'email'    => 'admin@drive-dye.test',
            'password' => Hash::make('Admin1234!'),
            'role'     => 'admin',
            'phone'    => '+21671000001',
        ]);

        // ─── 2. CONDUCTEURS ───────────────────────────────────────────────
        $conducteurs = [
            ['name' => 'Yassine Trabelsi',  'email' => 'yassine.trabelsi@mail.tn',  'phone' => '+21698111111'],
            ['name' => 'Sana Ben Amor',     'email' => 'sana.benamor@mail.tn',      'phone' => '+21622222222'],
            ['name' => 'Mehdi Chaabane',    'email' => 'mehdi.chaabane@mail.tn',    'phone' => '+21655333333'],
            ['name' => 'Rania Mansouri',    'email' => 'rania.mansouri@mail.tn',    'phone' => '+21698444444'],
            ['name' => 'Khalil Belhaj',     'email' => 'khalil.belhaj@mail.tn',     'phone' => '+21620555555'],
            ['name' => 'Amira Hammami',     'email' => 'amira.hammami@mail.tn',     'phone' => '+21655666666'],
        ];

        $conducteurIds = [];
        foreach ($conducteurs as $c) {
            $u = User::create([
                'name'     => $c['name'],
                'email'    => $c['email'],
                'password' => Hash::make('Password123!'),
                'role'     => 'conducteur',
                'phone'    => $c['phone'],
            ]);
            $conducteurIds[] = $u->id;
        }

        // ─── 3. VOYAGEURS ─────────────────────────────────────────────────
        $voyageurs = [
            ['name' => 'Mariem Bouaziz',   'email' => 'mariem.bouaziz@mail.tn',   'phone' => '+21698777771'],
            ['name' => 'Omar Jebali',      'email' => 'omar.jebali@mail.tn',      'phone' => '+21620777772'],
            ['name' => 'Fatma Riahi',      'email' => 'fatma.riahi@mail.tn',      'phone' => '+21655777773'],
            ['name' => 'Amine Saidi',      'email' => 'amine.saidi@mail.tn',      'phone' => '+21698777774'],
            ['name' => 'Nour Khelifi',     'email' => 'nour.khelifi@mail.tn',     'phone' => '+21622777775'],
            ['name' => 'Tarek Ayari',      'email' => 'tarek.ayari@mail.tn',      'phone' => '+21655777776'],
            ['name' => 'Ines Dridi',       'email' => 'ines.dridi@mail.tn',       'phone' => '+21698777777'],
            ['name' => 'Bilel Gharbi',     'email' => 'bilel.gharbi@mail.tn',     'phone' => '+21620777778'],
        ];

        $voyageurIds = [];
        foreach ($voyageurs as $v) {
            $u = User::create([
                'name'     => $v['name'],
                'email'    => $v['email'],
                'password' => Hash::make('Password123!'),
                'role'     => 'voyageur',
                'phone'    => $v['phone'],
            ]);
            $voyageurIds[] = $u->id;
        }

        // ─── 4. VÉHICULES (1 par conducteur) ─────────────────────────────
        $vehiculeData = [
            ['Renault',     'Symbol',   'Blanc',    '235TU2024',  4],
            ['Volkswagen',  'Golf',     'Gris',     '114TU1823',  5],
            ['Peugeot',     '301',      'Bleu',     '089TU2211',  5],
            ['Citroën',     'C-Elysée', 'Rouge',    '321TU1999',  4],
            ['Hyundai',     'i10',      'Noir',     '456TU2105',  4],
            ['Kia',         'Picanto',  'Argent',   '178TU2309',  4],
        ];

        $vehiculeIds = [];
        foreach ($conducteurIds as $i => $cid) {
            $v = $vehiculeData[$i];
            $vid = DB::table('vehicules')->insertGetId([
                'conducteur_id'   => $cid,
                'marque'          => $v[0],
                'modele'          => $v[1],
                'couleur'         => $v[2],
                'immatriculation' => $v[3],
                'places'          => $v[4],
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
            $vehiculeIds[$cid] = $vid;
        }

        // ─── 5. TRAJETS (villes tunisiennes) ─────────────────────────────
        $routes = [
            // [depart, destination, type_vehicule, bagage, fumeur, genre]
            ['Tunis',       'Sfax',         'Berline',  'petit',  false, null],
            ['Sfax',        'Sousse',       'Berline',  'moyen',  false, 'mixte'],
            ['Tunis',       'Bizerte',      'Berline',  'grand',  false, null],
            ['Sousse',      'Monastir',     'SUV',      'petit',  false, 'femme'],
            ['Sfax',        'Gabès',        'Berline',  'petit',  true,  null],
            ['Tunis',       'Nabeul',       'Berline',  'moyen',  false, null],
            ['Bizerte',     'Tunis',        'SUV',      'petit',  false, 'mixte'],
            ['Monastir',    'Sousse',       'Berline',  'petit',  false, null],
            ['Tunis',       'Hammamet',     'Berline',  'moyen',  false, null],
            ['Gabès',       'Médenine',     'Berline',  'petit',  false, null],
            ['Kairouan',    'Sousse',       'SUV',      'grand',  false, 'mixte'],
            ['Tunis',       'Kairouan',     'Berline',  'petit',  false, null],
            ['Nabeul',      'Hammamet',     'Berline',  'petit',  false, null],
            ['Médenine',    'Djerba',       'SUV',      'moyen',  false, null],
            ['Jendouba',    'Tunis',        'Berline',  'petit',  true,  null],
            ['Gafsa',       'Sfax',         'Berline',  'petit',  false, 'mixte'],
            ['Tunis',       'Le Kef',       'SUV',      'moyen',  false, null],
            ['Sousse',      'Tunis',        'Berline',  'petit',  false, null],
        ];

        $statuts = ['actif', 'actif', 'actif', 'actif', 'actif', 'actif', 'termine', 'annule'];
        $trajetIds = [];
        $now = Carbon::now();

        foreach ($routes as $idx => $r) {
            $cid    = $conducteurIds[$idx % count($conducteurIds)];
            $statut = $statuts[$idx % count($statuts)];
            $offset = $statut === 'actif' ? rand(1, 60) : -rand(1, 30);
            $date   = $now->copy()->addDays($offset)->setTime(rand(6, 20), [0, 15, 30, 45][rand(0, 3)]);

            $tid = DB::table('trajets')->insertGetId([
                'conducteur_id' => $cid,
                'depart'        => $r[0],
                'destination'   => $r[1],
                'date_heure'    => $date,
                'nb_places'     => rand(1, 4),
                'prix_min'      => $min = rand(5, 20),
                'prix_max'      => $min + rand(3, 15),
                'type_vehicule' => $r[2],
                'bagage'        => $r[3],
                'fumeur'        => $r[4],
                'genre'         => $r[5],
                'statut'        => $statut,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
            $trajetIds[] = ['id' => $tid, 'statut' => $statut, 'conducteur_id' => $cid];
        }

        // ─── 6. RÉSERVATIONS ─────────────────────────────────────────────
        $reservationIds = [];
        $resStatuts = ['en_attente', 'confirmee', 'annulee'];

        foreach ($trajetIds as $tInfo) {
            $eligible = array_values(array_filter($voyageurIds, fn($vid) => $vid !== $tInfo['conducteur_id']));
            $count    = min(rand(1, 3), count($eligible));
            shuffle($eligible);
            $chosen   = array_slice($eligible, 0, $count);

            foreach ($chosen as $vid) {
                $rs = $tInfo['statut'] === 'actif'
                    ? $resStatuts[rand(0, 2)]
                    : ($tInfo['statut'] === 'termine' ? 'confirmee' : 'annulee');

                $rid = DB::table('reservations')->insertGetId([
                    'voyageur_id'        => $vid,
                    'trajet_id'          => $tInfo['id'],
                    'date_reservation'   => now()->subDays(rand(0, 10)),
                    'nb_places_reservees'=> rand(1, 2),
                    'statut'             => $rs,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ]);

                if ($rs === 'confirmee' && $tInfo['statut'] === 'termine') {
                    $reservationIds[] = ['id' => $rid, 'voyageur_id' => $vid];
                }
            }
        }

        // ─── 7. AVIS ─────────────────────────────────────────────────────
        $commentaires = [
            'Trajet très agréable, conducteur ponctuel !',
            'Bonne ambiance dans la voiture, je recommande.',
            'Voyage confortable et sans encombre.',
            'Conducteur sympathique et professionnel.',
            'Parfait, rien à redire. À refaire !',
            'Un peu en retard mais voyage très plaisant.',
            'Très bonne expérience de covoiturage.',
        ];

        foreach ($reservationIds as $res) {
            DB::table('avis')->insert([
                'reservation_id' => $res['id'],
                'voyageur_id'    => $res['voyageur_id'],
                'note'           => rand(3, 5),
                'commentaire'    => $commentaires[array_rand($commentaires)],
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        // ─── 8. NOTIFICATIONS ────────────────────────────────────────────
        $notifMessages = [
            'Votre réservation a été confirmée.',
            'Un nouveau trajet correspond à vos critères.',
            'Votre trajet a été annulé par le conducteur.',
            'Vous avez reçu un avis suite à votre trajet.',
            'Un voyageur a réservé votre trajet.',
            'Rappel : votre trajet est dans 24h.',
        ];

        $allUserIds = array_merge($conducteurIds, $voyageurIds);
        foreach ($allUserIds as $uid) {
            $nb = rand(1, 4);
            for ($n = 0; $n < $nb; $n++) {
                DB::table('notifications')->insert([
                    'user_id'    => $uid,
                    'message'    => $notifMessages[array_rand($notifMessages)],
                    'lue'        => (bool) rand(0, 1),
                    'created_at' => now()->subHours(rand(1, 72)),
                    'updated_at' => now(),
                ]);
            }
        }

        // ─── Summary ─────────────────────────────────────────────────────
        $this->command->info('✅  Seeding terminé :');
        $this->command->info('   • 1 admin');
        $this->command->info('   • ' . count($conducteurIds) . ' conducteurs');
        $this->command->info('   • ' . count($voyageurIds) . ' voyageurs');
        $this->command->info('   • ' . count($trajetIds) . ' trajets (villes tunisiennes)');
        $this->command->info('   • Réservations, avis et notifications créés');
    }
}
