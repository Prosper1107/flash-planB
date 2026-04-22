# Flash Wallet

> Bitcoin Lightning × Mobile Money — Wallet Web pour l'Afrique de l'Ouest francophone

Projet soumis dans le cadre du **Plan B Network Program - Dev Track**.

---

## Présentation

**Flash Wallet** est une application web qui permet à tout utilisateur de :

- Envoyer et Recevoir des satoshis via une **Lightning Address** personnelle (`user@bitcoinflash.xyz`)
- Convertir **automatiquement** tout ou partie des satoshis reçus en FCFA
- Encaisser directement sur son compte **Mobile Money** (MTN MoMo, Moov Money, Celtiis, Togocel)
- Suivre l'historique de ses transactions en temps réel
- Vivre une expérience d'**onboarding fluide** conçue pour convertir au premier usage

---

## Axes couverts (Plan B Dev Track)

| Axe | Statut | Description |
|-----|--------|-------------|
| Build a Wallet | Implémenté | Wallet Lightning avec conversion auto sats → FCFA |
| Onboarding Experience | Implémenté | Parcours 5 étapes guidé jusqu'à la 1ère transaction |
| Business Integration | Partiel | Structure SDK prête à étendre |

---

## Architecture

```
flash-wallet/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Landing page publique
│   │   ├── layout.tsx            # Layout racine (Poppins, Toaster)
│   │   ├── globals.css           # Design system + Tailwind
│   │   ├── auth/
│   │   │   ├── login/            # Connexion JWT
│   │   │   ├── register/         # Inscription + OTP
│   │   │   └── verify-otp/       # Vérification email 6 chiffres
│   │   ├── onboarding/           # Parcours 5 étapes (Welcome → Done)
│   │   ├── api/lnd/[...path]/    # Proxy Route pour LND/Polar Backend
│   │   └── dashboard/
│   │       ├── layout.tsx        # Sidebar + nav responsive
│   │       ├── wallet/           # Solde, QR, facturation, vente
│   │       ├── transactions/     # Historique filtrable
│   │       └── settings/         # Config LND Polar, Mobile Money + auto-convert
│   ├── components/
│   │   └── ui/                   # Button, Input, Card, Badge, Spinner
│   ├── context/
│   │   └── AuthContext.tsx       # State global auth (JWT + user)
│   ├── lib/
│   │   ├── api/client.ts         # Axios client Flash API (tous endpoints)
│   │   ├── stores/               # Zustand Local State (walletStore, settingsStore)
│   │   ├── hooks/useWallet.ts    # Hook données wallet
│   │   └── utils/index.ts        # Formatage, validation, helpers
│   └── types/index.ts            # Types TypeScript centralisés
├── .env.example                  # Variables d'environnement
├── tailwind.config.ts            # Design system Flash (bleu #1B4FE8, Poppins)
└── DELIVERABLE.MD                # Liens de livraison
```

---

## Stack technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 14** (App Router) | Framework web |
| **TypeScript** | Typage strict |
| **Tailwind CSS** | Design system Flash |
| **Poppins** | Police officielle Flash |
| **Axios** | Client HTTP + intercepteurs JWT |
| **React Hook Form + Zod** | Formulaires + validation |
| **qrcode.react** | Génération QR codes Lightning |
| **react-hot-toast** | Notifications |
| **zustand** | State management (extensible) |
| **js-cookie** | Gestion tokens JWT |
| **Vercel** | Déploiement |

---

## Installation et lancement

### Prérequis
- Node.js 18+
- npm ou yarn

### 1. Cloner le projet

```bash
git clone https://github.com/Prosper1107/flash-planB.git
cd flash-wallet
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env.local
```

Editer `.env.local` :
```env
NEXT_PUBLIC_FLASH_API_URL=https://staging.bitcoinflash.xyz
```

### 4. Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### 5. Build production

```bash
npm run build
npm start
```

---

## Authentification Flash API

L'app supporte les deux méthodes de la doc Flash :

**JWT Bearer Token** (production)
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Staging User ID** (développement)
```
X-Staging-User-Id: YOUR_USER_ID
```

Le client Axios (`src/lib/api/client.ts`) gère automatiquement l'injection du bon header selon l'environnement.

---

## Lightning Address System

Chaque utilisateur Flash reçoit une Lightning Address au format :
```
username@bitcoinflash.xyz
```

Cette adresse fonctionne comme un email pour recevoir du Bitcoin :
- Compatible avec tous les wallets Lightning (Phoenix, Breez, Muun, etc.)
- Basée sur le protocole LNURL-pay (voir [lightningaddress.com](https://lightningaddress.com))
- Convertit automatiquement les sats reçus selon la config de l'utilisateur

---

## Parcours utilisateur (Onboarding)

```
Landing → Register → Verify OTP → Onboarding (5 étapes) → Dashboard
                                    │
                                    ├── 1. Welcome
                                    ├── 2. Config Mobile Money
                                    ├── 3. Taux de conversion auto
                                    ├── 4. Découverte Lightning Address
                                    └── 5. Récapitulatif → Wallet
```

---

## Contribution

Les contributions sont les bienvenues !

```bash
# Fork le projet
git fork https://github.com/Prosper1107/flash-planB

# Créer une branche feature
git checkout -b feature/ma-fonctionnalite

# Committer
git commit -m "feat: description de la fonctionnalité"

# Push et ouvrir une Pull Request
git push origin feature/ma-fonctionnalite
```

### Conventions de commit
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatage, CSS
- `refactor:` refactoring sans changement fonctionnel

---

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NEXT_PUBLIC_FLASH_API_URL` | URL de l'API Flash | `https://staging.bitcoinflash.xyz` |
| `NEXT_PUBLIC_APP_URL` | URL de l'app | `http://localhost:3000` |

---

## Licence

MIT - Open Source.

---

## Auteur

Développé pour le **Plan B Network Program** — Piste Dev Track