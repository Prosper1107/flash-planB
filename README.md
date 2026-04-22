# Flash Wallet & Flash SDK

> Solutions Bitcoin Lightning + Mobile Money pour l'Afrique de l'Ouest francophone.
> Projet soumis dans le cadre du Plan B Network Dev Track.

---

## Presentation

**Flash Plan B** est un monorepo professionnel regroupant deux solutions complementaires construites sur l'API Flash :

- **Flash Wallet** : Application web grand public permettant de recevoir des satoshis via une Lightning Address et de les convertir automatiquement en FCFA sur un compte Mobile Money.
- **Flash SDK** : Package JavaScript autonome permettant a n'importe quel marchand ou developpeur d'integrer des paiements Lightning en quelques lignes de code.

Ces deux solutions repondent aux trois axes du Plan B Dev Track.

---

## Documentation par composant

Chaque composant dispose de sa propre documentation detaillee :

| Composant | README | Description |
|-----------|--------|-------------|
| Flash Wallet | [flash-wallet/README.md](./flash-wallet/README.md) | Guide complet : installation, stack, variables d'environnement, parcours utilisateur |
| Flash SDK | [flash-sdk/README.md](./flash-sdk/README.md) | Reference API complete : methodes, operateurs, exemples d'integration |

---

## Axes couverts

| Axe | Composant | Description |
|-----|-----------|-------------|
| Build a Wallet | `flash-wallet` | Wallet web Lightning avec auto-conversion sats vers FCFA via l'endpoint `/transactions/sell`. Chaque utilisateur dispose d'une Lightning Address au format `tag@bitcoinflash.xyz`. |
| Business Integration | `flash-sdk` | SDK JavaScript autonome (un seul fichier, zero dependance) destine aux marchands et integrateurs. Bouton de paiement, modal de checkout, Mobile Money integre, API directe. |
| Onboarding Experience | `flash-wallet` | Parcours d'onboarding guide en 5 etapes : accueil, configuration Mobile Money, taux de conversion automatique, decouverte de la Lightning Address, confirmation finale. |

---

## Architecture du projet

```
flash-planB/
- flash-wallet/                     Application Web (Next.js 14)
  - src/
    - app/                          Pages et routes (App Router)
      - auth/                       Login, Register, Verify OTP, Forgot Password
      - dashboard/                  Wallet, Send, Transactions, Settings
      - onboarding/                 Parcours d'activation en 5 etapes
      - api/lnd/[...path]/          Proxy Next.js vers noeud LND (Polar)
    - components/
      - ui/                         Button, Card, Input, Badge, Spinner, EmptyState
      - wallet/                     BalanceCard, SellModal, BuyModal, ReceiveModal, LightningAddressCard
    - context/                      AuthContext (session utilisateur)
    - lib/
      - api/client.ts               Client Axios : intercepteurs JWT + X-Staging-User-Id
      - hooks/                      useWallet, useTransactions, useExchangeRate
      - stores/                     walletStore (Zustand), settingsStore (Zustand)
    - types/index.ts                Types TypeScript centralises
  - .env.example
- flash-sdk/                        Package d'integration marchande
  - flash-sdk.js                    SDK complet (vanilla JS, zero dependance)
  - examples/index.html             Page de demonstration interactive
  - package.json
- README.md
- CLAUDE.md
- DELIVERABLE.md
- LICENSE
```

---

## Stack technique

| Technologie | Composant | Usage |
|-------------|-----------|-------|
| Next.js 14 (App Router) | flash-wallet | Framework applicatif avec rendu hybride |
| TypeScript | flash-wallet | Typage strict sur l'integralite du code |
| Tailwind CSS | flash-wallet | Systeme visuel Flash (bleu #1B4FE8, Poppins) |
| Axios | flash-wallet | Client HTTP avec intercepteurs JWT et staging |
| Zustand | flash-wallet | State management : wallet et settings |
| qrcode.react | flash-wallet | Generation de QR codes Lightning |
| react-hook-form + Zod | flash-wallet | Validation des formulaires d'authentification |
| Vanilla JavaScript | flash-sdk | Zero dependance, compatible tous environnements |

---

## Guide d'installation

### Prerequis

- Node.js >= 18
- npm >= 9

### 1. Cloner le depot

```bash
git clone https://github.com/Prosper1107/flash-planB.git
cd flash-planB
```

### 2. Demarrer Flash Wallet

```bash
cd flash-wallet
npm install
cp .env.example .env.local
```

Editer `.env.local` :

```
NEXT_PUBLIC_FLASH_API_URL=https://staging.bitcoinflash.xyz
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Lancer en developpement :

```bash
npm run dev
```

Ouvrir http://localhost:3000

### 3. Utiliser Flash SDK

Le SDK ne necessite aucune installation. Copiez `flash-sdk.js` dans votre projet, puis :

```html
<script src="flash-sdk.js"></script>
<script>
  FlashPay.init({ merchantTag: 'votre-tag' });
  FlashPay.button('#pay-btn', { amount: 5000, description: 'Commande #123' });
</script>
```

Pour tester la page de demonstration :

```bash
cd flash-sdk/examples
# Ouvrir index.html dans un navigateur
```

---

## Authentification et environnements

Le wallet gere deux modes d'authentification selon l'environnement :

**Production (JWT Bearer Token)**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Staging (X-Staging-User-Id)**

```
X-Staging-User-Id: YOUR_USER_ID
```

Le client `src/lib/api/client.ts` injecte automatiquement le bon header via les intercepteurs Axios en fonction des cookies presents.

---

## Lightning Address

Chaque utilisateur du wallet recoit une Lightning Address au format `tag@bitcoinflash.xyz`, compatible LNURL-pay. Les satoshis recus via cette adresse declenchent automatiquement la regle de conversion fiat configuree lors de l'onboarding (operateur Mobile Money + pourcentage de conversion).

---

## Flash SDK - Resume de l'API publique

| Methode | Description |
|---------|-------------|
| `FlashPay.init(config)` | Initialiser avec la config du marchand |
| `FlashPay.button(selector, options)` | Inserer un bouton de paiement dans un conteneur |
| `FlashPay.checkout(options)` | Ouvrir le modal de paiement directement |
| `FlashPay.getLightningAddress()` | Obtenir la Lightning Address du marchand |
| `FlashPay.xofToSats(xof)` | Convertir XOF en satoshis |
| `FlashPay.satsToXof(sats)` | Convertir satoshis en XOF |
| `FlashPay.formatXof(xof)` | Formater un montant XOF |
| `FlashPay.formatSats(sats)` | Formater un montant en satoshis |
| `FlashPay.createTransaction(payload)` | Creer une transaction via l'API Flash |
| `FlashPay.getTransactions()` | Recuperer les transactions du compte |
| `FlashPay.getBalance()` | Verifier le solde du compte |
| `FlashPay.getRate()` | Recuperer le taux de change XOF/sats |

---

## Contribution

Les contributions sont les bienvenues.

```bash
# Forker le projet
git fork https://github.com/Prosper1107/flash-planB

# Creer une branche
git checkout -b feature/ma-fonctionnalite

# Committer
git commit -m "feat: description de la fonctionnalite"

# Pousser et ouvrir une Pull Request
git push origin feature/ma-fonctionnalite
```

Conventions de commit : `feat:`, `fix:`, `docs:`, `style:`, `refactor:`

---

## Licence

MIT - Open Source

Developpe pour la competition Plan B Network Dev Track - Benin, 2026.
