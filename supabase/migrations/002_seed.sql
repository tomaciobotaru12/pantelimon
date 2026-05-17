-- =====================================================
-- Seed data: Pantelimon historical locations
-- =====================================================

insert into public.locations (title, slug, description, lat, lng, historical_period, cover_image) values
(
  'Hala Obor',
  'hala-obor',
  'Una dintre cele mai vechi piețe ale Bucureștiului, Hala Obor a fost centrul comercial al cartierelor din nord-estul orașului încă din secolul XIX. Construcția actuală datează din 1937 și a fost martora a generații de negustori, țărani și orășeni care s-au întâlnit aici sâmbătă dimineața.',
  44.4423,
  26.1349,
  '1880 — prezent',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Hala_Obor_2.jpg/1280px-Hala_Obor_2.jpg'
),
(
  'Electroaparataj',
  'electroaparataj',
  'Fosta uzină Electroaparataj, înființată în 1949, a fost una dintre mândriile industriale ale Pantelimonului. Mii de oameni au muncit aici, producând aparataj electric pentru întreaga țară. Astăzi, terenul găzduiește o parte din parcul retail și birouri, dar amintirea sirenelor de schimb încă răsună în memoria cartierului.',
  44.4498,
  26.1612,
  '1949 — 2003',
  null
),
(
  'Lacul Pantelimon',
  'lacul-pantelimon',
  'Lacul Pantelimon, parte din salba lacurilor Colentinei, a fost locul de scăldat al copiilor din cartier și de pescuit al bunicilor. Vile interbelice, plimbări cu barca duminica și o tăcere ireală la apus — toate sunt parte din legenda acestui mal.',
  44.4633,
  26.1741,
  'amenajat în 1936',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Lacul_Pantelimon_-_panoramio.jpg/1280px-Lacul_Pantelimon_-_panoramio.jpg'
),
(
  'Șoseaua Pantelimon',
  'soseaua-pantelimon',
  'Vechi drum spre Moldova, Șoseaua Pantelimon a fost odată mărginită de hanuri, livezi și case țărănești cu prispă. Tramvaiul 14 a tăiat-o pentru prima dată în 1934. Blocurile au înlocuit treptat casele, dar urmele vechiului drum se mai văd încă în câteva curți ascunse.',
  44.4445,
  26.1551,
  'sec. XVIII — prezent',
  null
),
(
  'Morarilor',
  'morarilor',
  'Zona Morarilor și-a luat numele de la morile de pe Colentina care măcinau grâul Bărăganului. Ansamblul de blocuri ridicat în anii ‘70 și ‘80 a transformat radical peisajul, dar până în 1965 aici erau încă grădini și case mici, cu căruțe trase la poartă.',
  44.4517,
  26.1639,
  '1970 — 1985',
  null
),
(
  'Baicului',
  'baicului',
  'Strada Baicului a fost una dintre arterele Pantelimonului interbelic — o zonă de mahala bucureșteană autentică, cu case scunde, ateliere, fierării și familii numeroase care își strigau copiii peste garduri. O parte din străduțele vechi mai există și astăzi între blocurile noi.',
  44.4476,
  26.1487,
  'sec. XIX — 1960',
  null
);
