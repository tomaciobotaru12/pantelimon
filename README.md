# Aici Era — Arhiva vie a Pantelimonului

> *Sub blocurile Pantelimonului există un alt oraș.*

O platformă comunitară de istorie locală, pentru cartierul Pantelimon din București. Utilizatorii pot:

- explora o **hartă interactivă** cu locuri martor (Hala Obor, Lacul Pantelimon, Electroaparataj…)
- citi povești și amintiri legate de fiecare punct
- compara fotografii **„atunci / acum”** cu un glisor
- crea un cont și contribui cu **propriile amintiri**, fotografii și locații

Estetică: nostalgică, cinematică, hârtie veche, sepia, tipografie clasică.

---

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS** + **shadcn/ui** (Radix primitives)
- **Supabase** — Auth, Postgres, Storage, RLS
- **@supabase/ssr** — `createBrowserClient` / `createServerClient`, doar `cookies.getAll()` / `cookies.setAll()`
- **Leaflet** + **react-leaflet** — hartă
- **Framer Motion** — animații
- **lucide-react** — iconuri

---

## Setup local

### 1. Instalează dependențele

```bash
npm install
```

### 2. Creează un proiect Supabase

1. Mergi pe [supabase.com](https://supabase.com), creează un proiect nou (regiune `eu-central-1` recomandat).
2. În **Project Settings → API**, copiază `Project URL` și `Publishable key` (cea care înlocuiește vechea „anon" key — e safe de pus în browser).

### 3. Configurează variabilele de mediu

```bash
cp .env.local.example .env.local
```

Editează `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### 4. Aplică schema bazei de date

În Supabase Dashboard → **SQL Editor**, rulează pe rând:

1. `supabase/migrations/001_init.sql` — tabele, RLS, storage buckets, trigger pentru profile
2. `supabase/migrations/002_seed.sql` — locuri istorice din Pantelimon

### 5. Configurează autentificarea

În **Authentication → Providers**:

- **Email**: activează „Magic Link”. La URL settings, adaugă `http://localhost:3000/auth/callback` în „Redirect URLs”.
- **Google**: activează providerul, configurează `Client ID` și `Client Secret` din Google Cloud Console. Redirect URL: `https://<your-project>.supabase.co/auth/v1/callback`.

### 6. Pornește dev server-ul

```bash
npm run dev
```

→ <http://localhost:3000>

---

## Structură

```
app/
├── layout.tsx              # Layout global + Navbar + Footer
├── page.tsx                # Homepage cinematic
├── globals.css             # Tailwind + tematizare sepia + Leaflet overrides
├── loading.tsx / error.tsx / not-found.tsx
├── map/page.tsx            # Hartă Leaflet
├── feed/page.tsx           # Feed povești + filtre
├── locations/[slug]/page.tsx
├── stories/
│   ├── [id]/page.tsx
│   ├── [id]/edit/page.tsx
│   └── new/page.tsx
├── profile/page.tsx
├── login/page.tsx
└── auth/
    ├── callback/route.ts   # OAuth code exchange
    └── signout/route.ts

components/
├── ui/                     # shadcn primitives (Button, Card, Dialog, etc.)
├── map/
│   ├── map-client.tsx      # Dynamic wrapper, ssr: false
│   ├── map-view.tsx        # Leaflet map + markers
│   ├── location-modal.tsx  # Modal animat pentru marker
│   └── location-picker.tsx # Hartă pentru selectat coordonate la upload
├── hero.tsx                # Hero cinematic
├── navbar.tsx
├── footer.tsx
├── story-card.tsx
├── location-card.tsx
├── story-form.tsx          # Upload story + imagini
├── edit-story-form.tsx
├── delete-story-button.tsx
├── login-card.tsx
├── feed-filters.tsx
├── before-after.tsx        # Glisor atunci/acum
└── image-upload.tsx        # Drag & drop multi-imagine

lib/
├── supabase/
│   ├── client.ts           # createBrowserClient
│   ├── server.ts           # createServerClient (cookies.getAll/setAll)
│   └── middleware.ts       # session refresh în middleware
└── utils.ts                # cn, slugify, formatDate, decadeOf

types/database.ts           # Tipuri Supabase

middleware.ts               # Refresh sesiune pe toate rutele

supabase/migrations/
├── 001_init.sql
└── 002_seed.sql
```

---

## Bază de date

### Tabele

| Tabel           | Rol                                             |
|-----------------|-------------------------------------------------|
| `profiles`      | Profile publice (id = auth user id)             |
| `locations`     | Locuri martor (curate de admin)                 |
| `stories`      | Amintiri user-generated                         |
| `story_images` | Imagini atașate poveștii (`is_historical` flag) |

### Row Level Security

- **Citire publică** pentru toate tabelele
- `stories.insert/update/delete` doar dacă `auth.uid() = user_id`
- `story_images.insert/delete` doar dacă utilizatorul deține story-ul părinte
- `profiles.update` doar pe propriul rând

### Storage

Două bucket-uri publice: `story-images`, `avatars`.  
Politicile permit upload doar în folderul `<user_id>/...`.

---

## Auth flow

- **Magic link** (email): `signInWithOtp` → email → redirect la `/auth/callback?code=...` → `exchangeCodeForSession`.
- **Google OAuth**: `signInWithOAuth({ provider: "google" })` → redirect identic.
- Middleware-ul (`middleware.ts` → `lib/supabase/middleware.ts`) reîmprospătează sesiunea la fiecare request.
- Implementarea folosește **exclusiv** `@supabase/ssr` cu `cookies.getAll()` și `cookies.setAll()` (nu `get/set/remove` deprecat, nu `auth-helpers-nextjs`).

---

## Deploy pe Vercel

1. Push pe GitHub.
2. Import în [Vercel](https://vercel.com/new).
3. Adaugă environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL=https://<domain>`).
4. În Supabase Dashboard → Auth → URL Configuration:
   - **Site URL**: `https://<domain>`
   - **Redirect URLs**: adaugă `https://<domain>/auth/callback`
5. Pentru Google OAuth, adaugă același redirect și la providerul Google.

---

## Roadmap (post-MVP)

- Comentarii la povești
- Modul de timeline (slider pe ani pentru hartă)
- Export PDF al unei locații cu toate amintirile
- Pagină dedicată „Despre proiect”
- Admin UI pentru gestionarea locurilor martor

---

## Credit

Construit cu dragoste pentru un cartier care merită memorat.  
`Aici Era` — © comunitate.
