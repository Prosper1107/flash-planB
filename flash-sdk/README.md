# Flash Pay SDK

> Package JavaScript pour accepter des paiements Bitcoin Lightning sur n'importe quel site web.
> Concu pour les marchands en Afrique de l'Ouest francophone (Benin, Togo, Cote d'Ivoire).

---

## Presentation

**Flash Pay SDK** est un fichier JavaScript unique, sans aucune dependance externe, qui permet a tout marchand d'integrer des paiements Bitcoin Lightning sur son site web en 3 lignes de code.

Le SDK affiche un modal de paiement complet avec deux modes :

- **Mode Lightning** : adresse Lightning du marchand + QR code scannable avec n'importe quel wallet compatible (Phoenix, Breez, Muun...).
- **Mode Mobile Money** : selection du pays, de l'operateur (MTN MoMo, Moov Money, Celtiis, Togocel) et saisie du numero. La conversion sats → FCFA est effectuee automatiquement cote Flash apres confirmation Lightning.

---

## Installation

Aucun gestionnaire de paquets requis. Copiez simplement `flash-sdk.js` dans votre projet.

```html
<script src="flash-sdk.js"></script>
```

Ou via CDN (a venir) :

```html
<script src="https://cdn.bitcoinflash.xyz/sdk/flash-sdk.js"></script>
```

---

## Demarrage rapide

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Ma Boutique</title>
</head>
<body>

  <div id="pay-btn"></div>

  <script src="flash-sdk.js"></script>
  <script>
    FlashPay.init({
      merchantTag: 'ma-boutique',
      onSuccess: function(payment) {
        console.log('Paiement recu', payment.amount, 'XOF');
      }
    });

    FlashPay.button('#pay-btn', {
      amount: 5000,
      description: 'Commande #123'
    });
  </script>

</body>
</html>
```

---

## API publique

### FlashPay.init(config)

Initialise le SDK. A appeler une seule fois avant tout autre usage.

| Parametre | Type | Defaut | Description |
|-----------|------|--------|-------------|
| `merchantTag` | string | - | Tag Flash du marchand. Genere `tag@bitcoinflash.xyz` |
| `apiBase` | string | `https://staging.bitcoinflash.xyz` | URL de l'API Flash |
| `token` | string | - | JWT Bearer token pour les requetes authentifiees |
| `stagingUserId` | string | - | Header `X-Staging-User-Id` pour le staging Flash |
| `ratePerSat` | number | `0.38` | Taux XOF par satoshi utilise pour les conversions |
| `onSuccess` | function | - | `(payment) => void` - appele apres paiement confirme |
| `onError` | function | - | `(error) => void` - appele en cas d'echec |
| `onClose` | function | - | `() => void` - appele a la fermeture du modal |

### FlashPay.button(selector, options)

Insere un bouton de paiement Flash dans un conteneur DOM.

```javascript
FlashPay.button('#conteneur', {
  amount: 5000,          // Montant en XOF (requis)
  currency: 'XOF',       // Devise (optionnel, defaut XOF)
  description: 'Achat',  // Description affichee dans le modal
  label: 'Payer 5 000 FCFA', // Texte du bouton (optionnel)
  size: 'md',            // 'sm', 'md' (defaut), 'lg'
  variant: 'default',    // 'default', 'outline', 'dark', 'ghost'
  onSuccess: function(p) {},  // Override du callback global
  onError:   function(e) {},
});
```

### FlashPay.checkout(options)

Ouvre directement le modal de paiement sans creer de bouton.

```javascript
const modal = FlashPay.checkout({
  amount: 15000,
  description: 'Abonnement Premium',
  onSuccess: function(payment) {
    // payment.amount          → montant XOF
    // payment.sats            → satoshis
    // payment.lightningAddress → adresse du marchand
    // payment.timestamp       → ISO 8601
    // payment.status          → "simulated" | "completed"
  }
});

// Fermer depuis votre code si necessaire
modal.close();
```

### Utilitaires

```javascript
FlashPay.getLightningAddress();   // "ma-boutique@bitcoinflash.xyz"
FlashPay.xofToSats(5000);         // 13157
FlashPay.satsToXof(10000);        // 3800
FlashPay.formatXof(5000);         // "5 000 XOF"
FlashPay.formatSats(1500000);     // "1.50M sats"
```

### Methodes API directes

Ces methodes communiquent directement avec l'API Flash. Elles necessitent `token` ou `stagingUserId` dans la config.

```javascript
// Creer une transaction de vente (sats → Mobile Money)
FlashPay.createTransaction({
  type:     'SELL_BITCOIN',
  amount:   13157,           // satoshis
  number:   '+22997000000',  // numero avec indicatif pays
  provider: 'MTN_OPEN',      // voir tableau operateurs ci-dessous
});

FlashPay.getTransactions();  // Liste des transactions
FlashPay.getBalance();       // Solde du compte
FlashPay.getRate();          // Taux de change XOF/sats
FlashPay.setRate(0.40);      // Mettre a jour le taux interne
```

---

## Operateurs Mobile Money supportes

| Operateur | Identifiant API | Pays |
|-----------|----------------|------|
| MTN MoMo | `MTN_OPEN` | Benin, Togo |
| Moov Money | `MOOV_BENIN` | Benin, Togo, Cote d'Ivoire |
| Celtiis | `CELTIIS_BENIN` | Benin |
| Togocel | `MTN_TOGO` | Togo |

---

## Compatibilite

Le SDK est compatible avec tous les environnements JavaScript :

```javascript
// Navigateur (global)
window.FlashPay.init({ merchantTag: 'ma-boutique' });

// CommonJS (Node.js / bundlers)
const FlashPay = require('./flash-sdk.js');

// AMD (RequireJS)
define(['flash-sdk'], function(FlashPay) { ... });
```

---

## Demo

Ouvrez `examples/index.html` dans votre navigateur pour une demonstration interactive complete avec documentation inline et demos live.

---

## Contribution

```bash
git clone https://github.com/Prosper1107/flash-planB.git
cd flash-planB/flash-sdk

# Modifier flash-sdk.js
# Tester en ouvrant examples/index.html dans le navigateur
```

Conventions de commit : `feat:`, `fix:`, `docs:`, `style:`, `refactor:`

---

## Licence

MIT - Open Source

(c) 2026 Flash - Plan B Network Dev Track - Benin
