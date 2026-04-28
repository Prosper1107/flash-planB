# DELIVERABLE.md - Flash Wallet & Flash SDK

> Recapitulatif de tous les livrables et ressources associes a la soumission Plan B Dev Track.

---

## Liens principaux

| Ressource | Lien |
|-----------|------|
| Depot GitHub (Open Source) | https://github.com/Prosper1107/flash-planB |
| Demo live Flash Wallet | https://flash-wallet-one.vercel.app |
| Demo exemple Flash SDK | prosper1107.github.io/flash-planB/flash-sdk/examples |
| Video de presentation | https://drive.google.com/file/d/1V1THnbNIrHTTNJRtVobuoZCbsx7cr-S9/view |

---

## Ressources Flash utilisees

| Ressource | URL |
|-----------|-----|
| Documentation API Flash | https://docs.bitcoinflash.xyz |
| Portail Flash | https://bitcoinflash.xyz |
| Protocole Lightning Address | https://lightningaddress.com |
| Specifications BOLT | https://github.com/lightning/bolts |

---

## Couverture des trois axes

### Axe 1 - Build a Wallet (flash-wallet)

Le Flash Wallet est une application web Next.js 14 qui remplit les criteres suivants :

- Chaque utilisateur recoit une Lightning Address au format `tag@bitcoinflash.xyz`, compatible avec tous les wallets Lightning (Phoenix, Breez, Muun, etc.).
- Les satoshis recus via cette adresse sont convertis automatiquement en FCFA selon le pourcentage configure lors de l'onboarding.
- La conversion repose exclusivement sur l'endpoint `POST /transactions/create` avec `type: "SELL_BITCOIN"` documente dans l'API Flash.
- Le wallet supporte MTN MoMo, Moov Money, Celtiis (Benin) et Togocel (Togo) pour la reception des FCFA.
- Un proxy Next.js API Route permet la connexion a un noeud LND local (Polar) pour les tests Lightning en developpement.

### Axe 2 - Business Integration (flash-sdk)

Le Flash Pay SDK est un package JavaScript autonome concu pour les marchands et integrateurs :

- Un seul fichier (`flash-sdk.js`), aucune dependance externe, compatible navigateur, CommonJS et AMD.
- Integration en 3 lignes de code : inclusion du script, appel a `FlashPay.init()`, appel a `FlashPay.button()`.
- Modal de paiement complet avec deux modes : Lightning Address (QR code + copier) et Mobile Money (selection pays, operateur, numero).
- API programmatique : `checkout()`, `createTransaction()`, `getTransactions()`, `getBalance()`, `getRate()`.
- Utilitaires inclus : `xofToSats()`, `satsToXof()`, `formatXof()`, `formatSats()`, `getLightningAddress()`.
- Page de demonstration interactive (`examples/index.html`) avec documentation inline, demos live et reference API complete.
- Facilite d'utilisation pour les non-developpeurs : aucune configuration technique requise au dela du `merchantTag`.

### Axe 3 - Onboarding Experience (flash-wallet)

Le parcours d'onboarding du wallet implemente une experience optimisee en 5 etapes lineaires :

1. Accueil : proposition de valeur claire, liste des benefices concrets.
2. Configuration Mobile Money : selection du pays (Benin, Togo, Cote d'Ivoire), de l'operateur et saisie du numero.
3. Taux de conversion automatique : toggle on/off, slider de pourcentage (10% a 100%), apercu en temps reel.
4. Decouverte de la Lightning Address : affichage de l'adresse personnalisee, liste des compatibilites.
5. Confirmation : recapitulatif des choix, acces au dashboard.

Heuristiques appliquees : barre de progression visible, bouton retour a chaque etape, validation des champs avant passage, feedback immediat via toast notifications, zero etape optionnelle.

---

## Configuration du noeud Lightning local (Polar)

Le wallet integre un proxy vers un noeud LND local via Polar. Cette fonctionnalite permet de tester les operations Lightning (creation de factures, paiements, consultation de balance) en environnement de developpement sans passer par le reseau Lightning reel.

**Pourquoi Polar est local uniquement**

Polar simule un reseau Lightning en local sur votre machine. Il n'est pas accessible depuis internet, donc les tests Lightning complets ne sont pas disponibles sur la version deployee en ligne. La demo en ligne (`flash-wallet-one.vercel.app`) permet de tester l'authentification Flash, l'onboarding, la consultation des transactions et la vente de sats via Mobile Money (API Flash staging). Les operations Lightning directes (generer une facture LND, payer via LND) necessitent la configuration locale decrite ci-dessous.

**Etape 1 - Installer Polar**

Telecharger Polar sur https://lightningpolar.com et l'installer sur votre machine.

**Etape 2 - Creer un reseau de test**

Ouvrir Polar, creer un nouveau reseau avec au minimum un noeud LND. Demarrer le reseau. Polar va exposer une API REST LND sur un port local, par exemple `https://127.0.0.1:8080`.

**Etape 3 - Recuperer les credentials LND**

Dans Polar, cliquer sur votre noeud LND, aller dans l'onglet **Connect**. Vous y trouverez :

- Host : `127.0.0.1`
- REST Port : `8080` (ou autre selon votre config)
- Admin Macaroon : une chaine hexadecimale longue

**Etape 4 - Configurer le wallet en local**

Lancer le wallet en local :

```bash
cd flash-wallet
npm run dev
```

Ouvrir http://localhost:3000, se connecter avec un compte staging Flash, puis aller dans **Paramètres**. Renseigner les credentials LND recuperes depuis Polar (host, port, macaroon). Le wallet se connecte alors au noeud et affiche la balance Lightning reelle du noeud de test.

**Etape 5 - Tester les operations Lightning**

Une fois connecte au noeud Polar, les fonctionnalites suivantes deviennent disponibles :

- Generer une facture Lightning (Recevoir des sats) et Envoyer egalement de stats
- Consulter la balance des canaux
- Voir l'historique des factures reglee

Les operations de vente (sats vers Mobile Money) restent elles toujours disponibles en ligne via l'API Flash staging, sans besoin de Polar mais avec une simulation de paiement.

---

## Arborescence du livrable

```
flash-planB/
- README.md             Documentation technique complete
- DELIVERABLE.md        Ce fichier
- CLAUDE.md             Audit de participation de l'IA
- LICENSE               MIT License
- flash-wallet/         Code source du wallet utilisateur final
  - README.md           Documentation specifique au wallet
- flash-sdk/            Code source du SDK d'integration marchande
  - README.md           Reference API complete du SDK
  - flash-sdk.js        SDK complet (unique fichier, zero dependance)
  - examples/
    - index.html        Page de demonstration et documentation interactive
  - package.json
```
