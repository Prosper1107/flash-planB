# CLAUDE.md - Assistance par Intelligence Artificielle

> Ce document trace l'historique d'utilisation de l'agent Claude tout au long de la creation du projet Flash Plan B, conformement aux exigences du Plan B Dev Track.

---

## Role de l'assistant

Claude (claude-sonnet-4-6, interface web claude.ai) a ete utilise comme assistant de developpement et architecte partenaire sur l'ensemble du monorepo. Son intervention couvre l'architecture, la generation de code, le debugging, la documentation et le refactoring.

---

## Competences (Agent Skills) exploitees

### 1. Analyse documentaire et modélisation API

- Interpretation croisee de la documentation Flash (`docs.bitcoinflash.xyz`) : endpoints, structures de reponses, gestion des tokens.
- Identification de l'endpoint central d'auto-conversion : `POST /transactions/create` avec `type: "SELL_BITCOIN"`.
- Mapping des identifiants d'operateurs Mobile Money : `MTN_OPEN`, `MOOV_BENIN`, `CELTIIS_BENIN`, `MTN_TOGO`.
- Modelisation du protocole Lightning Address (LNURL-pay, format `user@domain`).

### 2. Architecture systeme

- Conception de la structure monorepo avec separation claire des responsabilites : `flash-wallet/` (application Next.js) et `flash-sdk/` (package standalone).
- Definition de l'arborescence App Router Next.js 14 : layouts, pages d'authentification, dashboard, proxy LND.
- Conception du systeme d'intercepteurs Axios pour la double authentification JWT/Staging.
- Architecture du state management Zustand : `walletStore` (balance, transactions, Lightning Address) et `settingsStore` (auto-convert, connexion LND).

### 3. Generation de code

- Ecriture du SDK Flash Pay (`flash-sdk.js`) : zero dependance, compatible CommonJS/AMD/browser, modal de paiement complet avec onglets Lightning et Mobile Money.
- Generation des intercepteurs Axios avec gestion selectives des erreurs 401 (deconnexion uniquement sur `/auth/me` et `/auth/refresh`).
- Ecriture des composants wallet : `SellModal`, `BuyModal`, `ReceiveModal`, `BalanceCard`, `LightningAddressCard`.
- Proxy Next.js API Route vers noeud LND Polar (`/api/lnd/[...path]`).
- Types TypeScript centralises (`src/types/index.ts`) couvrant auth, wallet, transactions, LND et onboarding.

### 4. Experience utilisateur et heuristiques

- Modelisation du tunnel d'onboarding en 5 etapes : Welcome, Mobile Money, Auto-convert, Lightning Address, Confirmation.
- Application des heuristiques de Nielsen : visibilite du systeme, controle utilisateur (bouton retour a chaque etape), prevention des erreurs (validation avant passage a l'etape suivante).
- Design de la page de demonstration du SDK : documentation interactive avec demos live, blocs de code syntaxiquement colores, tableau de reference API.

### 5. Documentation technique

- Redaction du `README.md` racine : architecture, stack, guide d'installation, resume API.
- Redaction du `DELIVERABLE.md` : recapitulatif des livrables, couverture des axes, arborescence.
- Redaction du `CLAUDE.md` (ce document).

---

## Prompts caracteristiques utilises

- "Corrige entierement le SDK flash-sdk.js pour qu'il soit 100% fonctionnel. Tu peux supprimer et reecrire."
- "Ajoute l'onglet Mobile Money dans le modal avec selection de pays et d'operateur."
- "Mets a jour les README, CLAUDE et DELIVERABLE en te basant sur tout ce que tu as lu dans le code."

---

## Travail exclusif de l'auteur (hors assistance IA)

- Creation du compte Flash et obtention des credentials de staging (User ID, JWT).
- Validation manuelle des flux Mobile Money sur les reseaux reels (MTN MoMo Benin, Moov Money).
- Deploiement de l'application sur Vercel et configuration des variables d'environnement de production.
- Configuration et gestion du noeud LND Polar en environnement local.
- Preparation de la soutenance et de la video de presentation.

---

## Modele utilise

- Modele : Claude Sonnet 4.6
- Interface : claude.ai (interface web)
- Usage principal : Architecture, generation de code, refactoring, documentation
