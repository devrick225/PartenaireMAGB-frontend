# Intégration du Système de Paiements

Ce document explique comment intégrer le contrôleur de paiements backend avec l'interface React/Redux que nous avons créée.

## Vue d'ensemble

Le système de paiements se compose de :

### Backend (Contrôleur fourni)
- **Endpoints disponibles** :
  - `POST /api/payments/initialize` - Initialiser un paiement
  - `GET /api/payments/:id` - Obtenir les détails d'un paiement
  - `POST /api/payments/:id/verify` - Vérifier un paiement
  - `POST /api/payments/:id/refund` - Rembourser un paiement
  - `GET /api/payments/stats` - Statistiques des paiements
  - `GET /api/payments` - Liste des paiements

### Frontend (Interface créée)
- **Redux Layer** : Actions, reducers et action creators pour gérer l'état
- **Composants UI** : Interface complète pour gérer les paiements
- **Intégration** : Connexion avec le système de donations existant

## Fournisseurs de Paiement Supportés

Le système supporte plusieurs fournisseurs :

1. **CinetPay** - Carte bancaire et Mobile Money
2. **Stripe** - Cartes bancaires internationales
3. **PayPal** - Paiements PayPal
4. **FusionPay** - Mobile Money et cartes
5. **MoneyFusion** - Mobile Money local
6. **Orange Money** - Mobile Money Orange
7. **MTN Mobile Money** - Mobile Money MTN
8. **Moov Money** - Mobile Money Moov

## Structure des Fichiers

```
src/
├── redux/
│   └── payments/
│       ├── actions.js          # Types d'actions Redux
│       ├── reducers.js         # Reducer pour l'état des paiements
│       └── actionCreator.js    # API calls et logique métier
├── container/
│   └── donations/
│       ├── PaymentProcessor.js # Interface de processus de paiement
│       ├── PaymentsList.js     # Liste et gestion des paiements
│       └── DonationCreate.js   # Intégration avec création de donations
└── routes/
    └── admin/
        └── pages.js            # Routes mises à jour
```

## Configuration Required

### 1. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. Intercepteur Axios

L'intercepteur est déjà configuré dans `actionCreator.js` pour ajouter automatiquement le token d'authentification :

```javascript
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

## Utilisation

### 1. Processus de Paiement Standard

```javascript
// Dans un composant React
import { useDispatch } from 'react-redux';
import { initializePayment } from '../redux/payments/actionCreator';

const handlePayment = async () => {
  try {
    const paymentData = {
      donationId: 'donation_id',
      provider: 'cinetpay',
      paymentMethod: 'card',
      customerPhone: '+225 01 02 03 04' // Pour mobile money
    };
    
    const result = await dispatch(initializePayment(paymentData));
    
    // Rediriger vers l'URL de paiement
    if (result.paymentUrl) {
      window.open(result.paymentUrl, '_blank');
    }
  } catch (error) {
    console.error('Erreur paiement:', error);
  }
};
```

### 2. Vérification de Paiement

```javascript
import { verifyPayment } from '../redux/payments/actionCreator';

const handleVerification = async (paymentId) => {
  try {
    const result = await dispatch(verifyPayment(paymentId));
    if (result.status === 'completed') {
      // Paiement réussi
    }
  } catch (error) {
    console.error('Erreur vérification:', error);
  }
};
```

### 3. Remboursement

```javascript
import { refundPayment } from '../redux/payments/actionCreator';

const handleRefund = async (paymentId, refundData) => {
  try {
    const result = await dispatch(refundPayment(paymentId, {
      amount: 5000,
      reason: 'Demande du client'
    }));
    // Remboursement initié
  } catch (error) {
    console.error('Erreur remboursement:', error);
  }
};
```

## Composants Disponibles

### 1. PaymentProcessor
Composant modal pour gérer le processus complet de paiement :

```jsx
<PaymentProcessor
  visible={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  donation={donationData}
  onSuccess={handlePaymentSuccess}
  onCancel={handlePaymentCancel}
/>
```

### 2. PaymentsList
Interface d'administration pour gérer tous les paiements :

```jsx
<PaymentsList />
```

### 3. Intégration avec DonationCreate
Le processus de création de donation inclut maintenant automatiquement le paiement.

## Fonctionnalités Incluses

### ✅ Gestion des Paiements
- Initialisation de paiements avec tous les fournisseurs
- Vérification automatique et manuelle
- Gestion des remboursements
- Calcul automatique des frais

### ✅ Interface Utilisateur
- Sélection intuitive du fournisseur de paiement
- Formulaires adaptatifs selon le type de paiement
- Feedback en temps réel sur le statut
- Gestion des erreurs complète

### ✅ Administration
- Liste complète des paiements avec filtres
- Statistiques en temps réel
- Actions en lot (vérification, export)
- Historique détaillé des transactions

### ✅ Sécurité
- Validation côté client et serveur
- Gestion sécurisée des tokens
- Protection contre les erreurs de manipulation

## Flux de Paiement

1. **Création de donation** → L'utilisateur crée une donation
2. **Sélection du fournisseur** → Choix du moyen de paiement
3. **Initialisation** → Appel API pour initialiser le paiement
4. **Redirection** → Ouverture de l'interface de paiement du fournisseur
5. **Vérification** → Polling automatique du statut ou vérification manuelle
6. **Finalisation** → Mise à jour du statut et notification

## Gestion des Erreurs

Le système gère automatiquement :
- Erreurs de validation des données
- Timeouts de paiement
- Échecs de communication avec les fournisseurs
- Erreurs de vérification
- Problèmes de remboursement

## Polling et Temps Réel

Le système inclut :
- Polling automatique du statut des paiements
- Mise à jour en temps réel de l'interface
- Notifications utilisateur appropriées

## Personnalisation

### Ajouter un Nouveau Fournisseur

1. **Backend** : Ajouter la logique dans le contrôleur
2. **Frontend** : Ajouter le fournisseur dans `reducers.js` :

```javascript
{
  key: 'nouveau_fournisseur',
  name: 'Nouveau Fournisseur',
  icon: '🏦',
  methods: ['card', 'mobile_money']
}
```

3. **Action Creator** : Ajouter la logique de traitement

### Modifier les Frais

Ajustez les pourcentages dans `calculatePaymentFees` :

```javascript
case 'nouveau_fournisseur':
  feePercentage = 2.0; // 2%
  fixedFee = 100; // 100 XOF fixe
  break;
```

## Déploiement

1. **Assurez-vous** que tous les fournisseurs de paiement sont configurés côté backend
2. **Testez** chaque fournisseur en mode sandbox/test
3. **Configurez** les variables d'environnement appropriées
4. **Déployez** et testez le flux complet

## Support et Maintenance

- **Logs** : Tous les appels API sont loggés pour debug
- **Monitoring** : Statistiques disponibles en temps réel
- **Alertes** : Notifications automatiques en cas d'erreur

Cette intégration vous donne un système de paiements complet et robuste, prêt pour la production avec tous les fournisseurs supportés par votre contrôleur backend. 