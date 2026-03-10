# SoummamCar — Location de Voitures à Béjaïa, Algérie

Application fullstack de location de voitures à Béjaïa, ciblant les clients locaux et la diaspora algérienne.

## Stack technique

**Frontend** : React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Zustand · Framer Motion  
**Backend** : Node.js · Express · TypeScript · Prisma ORM · PostgreSQL · JWT · Zod  
**Paiement** : SATIM (CIB/Edahabia) + Stripe (diaspora)  
**Déploiement** : Render (Blueprint `render.yaml`)

## Démarrage local

### Prérequis

- Node.js 18+
- PostgreSQL 15+

### Installation

```sh
# Frontend
npm install

# Backend
cd server
npm install
cp .env.example .env   # Configurer DATABASE_URL, JWT_SECRET, etc.
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### Lancement

```sh
# Terminal 1 — Backend (port 3000)
cd server && npm run dev

# Terminal 2 — Frontend (port 8080)
npm run dev
```

## Structure du projet

```
├── src/                  # Frontend React
│   ├── components/       # Composants UI (Navbar, FleetSection, BookingModal…)
│   ├── pages/            # Pages (Index, Login, Account, Payment…)
│   ├── services/         # Client API centralisé
│   ├── store/            # Zustand stores (auth, admin)
│   └── types/            # Types partagés
├── server/               # Backend Express
│   ├── prisma/           # Schema + migrations + seed
│   └── src/
│       ├── modules/      # Auth, Vehicles, Reservations, Payments, Contracts, Conditions
│       ├── middleware/    # Auth JWT, validation Zod, rate limiting, error handler
│       ├── config/       # Env, CORS, database
│       └── services/     # Notifications (email, SMS, WhatsApp)
├── public/               # Assets statiques, PWA (manifest, sw.js, sitemap)
└── render.yaml           # Render Blueprint (infra as code)
```

## Déploiement Render

1. Dashboard Render → **New** → **Blueprint**
2. Connecter le repo GitHub
3. Render détecte `render.yaml` et crée : PostgreSQL + API + Static Site
4. Cliquer **Apply**

## Licence

Propriétaire — © SoummamCar
