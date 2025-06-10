# Système de Gestion des Utilisateurs

Ce document explique le système complet de gestion des utilisateurs intégré avec votre contrôleur backend Node.js.

## Vue d'ensemble

Le système de gestion des utilisateurs comprend :

### Backend (Contrôleur fourni)
- **Endpoints disponibles** :
  - `GET /api/users/profile` - Profil de l'utilisateur connecté
  - `PUT /api/users/profile` - Mise à jour du profil
  - `GET /api/users/:id` - Détails d'un utilisateur
  - `GET /api/users` - Liste des utilisateurs (Admin)
  - `PUT /api/users/:id/role` - Modifier le rôle (Admin)
  - `PUT /api/users/:id/status` - Activer/Désactiver (Admin)
  - `GET /api/users/:id/donations` - Historique des dons
  - `GET /api/users/:id/stats` - Statistiques utilisateur
  - `POST /api/users/upload-avatar` - Upload d'avatar
  - `PUT /api/users/preferences` - Préférences utilisateur
  - `DELETE /api/users/account` - Suppression de compte
  - `GET /api/users/leaderboard` - Tableau des leaders

### Frontend (Interface créée)
- **Redux Layer** : Gestion complète de l'état des utilisateurs
- **Composants UI** : Interfaces utilisateur et administrateur
- **Gamification** : Système de niveaux, points et badges
- **Permissions** : Contrôle d'accès basé sur les rôles

## Structure des Fichiers

```
src/
├── redux/
│   └── users/
│       ├── actions.js          # Types d'actions Redux
│       ├── reducers.js         # Reducer pour l'état des utilisateurs
│       └── actionCreator.js    # API calls et logique métier
├── container/
│   └── users/
│       ├── index.js            # Composant principal avec navigation
│       ├── UsersList.js        # Liste des utilisateurs (Admin)
│       ├── UserDashboard.js    # Tableau de bord personnel
│       ├── UserDetails.js      # Détails d'un utilisateur
│       └── UserPreferences.js  # Gestion du profil et préférences
└── USERS_MANAGEMENT.md        # Cette documentation
```

## Fonctionnalités Principales

### 🏠 Tableau de Bord Utilisateur (`UserDashboard.js`)

**Fonctionnalités** :
- Affichage du profil utilisateur avec avatar et niveau
- Statistiques personnelles (total donné, nombre de dons, moyenne)
- Système de progression avec niveaux et points
- Badges et réalisations débloqués
- Leaderboard/classement avec différentes périodes
- Historique des dernières donations

**Système de Gamification** :
- **5 niveaux** : Nouveau membre → Membre actif → Donateur fidèle → Bienfaiteur → Grand donateur
- **Système de points** : Basé sur les montants des donations
- **Badges automatiques** : Premier don, donateur régulier, grand bienfaiteur, etc.
- **Classement** : Position dans le leaderboard par période

### 👥 Liste des Utilisateurs (`UsersList.js`) - Admin/Modérateur uniquement

**Fonctionnalités** :
- Table complète avec recherche et filtres avancés
- Statistiques rapides (total utilisateurs, actifs, admins, nouveaux)
- Gestion des rôles (Utilisateur, Admin, Modérateur, Trésorier)
- Activation/Désactivation des comptes avec raisons
- Actions en lot (export, notifications)
- Tri et pagination

**Colonnes disponibles** :
- Informations utilisateur (nom, email, avatar)
- Rôle avec codes couleur
- Statut actif/inactif
- Coordonnées (téléphone, localisation)
- Niveau et points de gamification
- Total des donations et nombre
- Date d'inscription et vérifications
- Menu d'actions contextuelles

### 📋 Détails Utilisateur (`UserDetails.js`)

**Fonctionnalités** :
- Vue complète du profil utilisateur
- Statistiques détaillées des donations
- Historique complet des transactions avec filtres
- Badges obtenus et progression de niveau
- Informations de profil étendu (si disponible)
- Onglets organisés (Profil / Historique donations)

### ⚙️ Préférences et Profil (`UserPreferences.js`)

**Fonctionnalités** :
- Upload et gestion de l'avatar
- Modification des informations personnelles
- Gestion des préférences (langue, devise)
- Configuration des notifications (email, SMS)
- Calcul automatique de la complétude du profil
- Zone dangereuse pour suppression de compte

**Formulaires inclus** :
- Informations personnelles (nom, âge, profession, etc.)
- Adresse complète
- Contact d'urgence
- Préférences système
- Notifications personnalisées

## Installation et Configuration

### 1. Ajout du Reducer

Le reducer est déjà ajouté dans `src/redux/rootReducers.js` :

```javascript
import users from './users/reducers';

const rootReducers = combineReducers({
  // ... autres reducers
  users,
});
```

### 2. Configuration API

Ajoutez dans votre `.env` :

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Permissions et Rôles

Le système utilise 4 rôles prédéfinis :

```javascript
const roles = [
  { value: 'user', label: 'Utilisateur', color: 'default' },
  { value: 'admin', label: 'Administrateur', color: 'red' },
  { value: 'moderator', label: 'Modérateur', color: 'orange' },
  { value: 'treasurer', label: 'Trésorier', color: 'green' }
];
```

**Contrôle d'accès** :
- `user` : Accès au tableau de bord personnel uniquement
- `moderator`, `admin` : Accès à la gestion des utilisateurs
- `admin` : Tous les droits (modification rôles, statuts)

## Utilisation

### Navigation Principale

```jsx
// Dans votre système de routes
import Users from './container/users';

// Le composant s'adapte automatiquement selon les permissions
<Users />
```

### Intégration avec Authentication

Le système utilise automatiquement l'état d'authentification :

```javascript
// Vérification automatique des permissions
const { userRole } = useSelector((state) => ({
  userRole: state.auth.user?.role,
}));

const canViewUsersList = ['admin', 'moderator'].includes(userRole);
```

### Actions Disponibles

```javascript
// Charger le profil utilisateur
dispatch(getUserProfile());

// Obtenir la liste des utilisateurs (admin)
dispatch(getUsersList({ page: 1, limit: 10, role: 'user' }));

// Voir les détails d'un utilisateur
dispatch(getUserById(userId));

// Modifier un rôle (admin)
dispatch(updateUserRole(userId, 'moderator'));

// Obtenir le leaderboard
dispatch(getLeaderboard('month', 10));
```

## Gamification

### Système de Niveaux

```javascript
const levels = [
  { level: 1, name: 'Nouveau membre', minPoints: 0, color: '#d9d9d9' },
  { level: 2, name: 'Membre actif', minPoints: 100, color: '#52c41a' },
  { level: 3, name: 'Donateur fidèle', minPoints: 500, color: '#1890ff' },
  { level: 4, name: 'Bienfaiteur', minPoints: 1000, color: '#722ed1' },
  { level: 5, name: 'Grand donateur', minPoints: 5000, color: '#fa8c16' }
];
```

### Calcul des Points
Les points sont automatiquement calculés côté backend basé sur :
- Montant total des donations
- Fréquence des donations
- Donations récurrentes actives

### Badges Automatiques
Le système génère automatiquement des badges basés sur :
- Premier don (🎯)
- 10 donations (🏅)
- 50 donations (⭐)
- Plus de 100 000 XOF donnés (👑)
- Donations récurrentes actives (🔄)

## Leaderboard

### Périodes Disponibles
- **Semaine** : Classement de la semaine en cours
- **Mois** : Classement du mois en cours
- **Année** : Classement de l'année en cours
- **Tout temps** : Classement historique global

### Affichage
- Top 10 affiché avec avatars et montants
- Position de l'utilisateur actuel (même hors top 10)
- Couleurs spéciales pour le podium (or, argent, bronze)

## Sécurité et Validation

### Côté Client
- Validation des formulaires avec règles personnalisées
- Vérification des permissions avant affichage
- Sanitisation des données avant envoi

### Intégration Backend
- Headers d'authentification automatiques
- Gestion d'erreurs centralisée
- Respect des permissions définies côté serveur

## Personnalisation

### Ajouter un Nouveau Rôle

1. **Backend** : Ajouter le rôle dans la validation
2. **Frontend** : Mettre à jour le tableau des rôles dans `reducers.js`

```javascript
{
  value: 'custom_role',
  label: 'Rôle Personnalisé',
  color: 'blue',
  description: 'Description du rôle'
}
```

### Modifier le Système de Niveaux

Ajustez les seuils dans `reducers.js` :

```javascript
const levels = [
  { level: 1, name: 'Débutant', minPoints: 0, color: '#d9d9d9' },
  // ... autres niveaux
];
```

### Ajouter des Badges

Modifiez la fonction `generateUserBadges` dans `actionCreator.js` :

```javascript
if (stats.customCondition) {
  badges.push({
    name: 'Badge Spécial',
    icon: '🌟',
    description: 'Condition spéciale remplie'
  });
}
```

## Responsive Design

Toutes les interfaces sont optimisées pour :
- **Desktop** : Affichage complet avec toutes les colonnes
- **Tablet** : Colonnes adaptées et menus déroulants
- **Mobile** : Vue simplifiée avec navigation tactile

## Intégration avec le Système de Donations

Le système s'intègre automatiquement avec :
- Historique des donations par utilisateur
- Calcul automatique des statistiques
- Mise à jour des points et niveaux
- Notifications de nouvelles donations

## Déploiement

1. **Assurez-vous** que le backend est correctement déployé
2. **Configurez** les variables d'environnement
3. **Testez** les permissions et rôles
4. **Vérifiez** la gamification et le leaderboard

## Support et Maintenance

- **Logs** : Toutes les actions sont tracées pour debug
- **Monitoring** : Statistiques disponibles en temps réel
- **Erreurs** : Gestion centralisée avec messages utilisateur
- **Performance** : Pagination et lazy loading intégrés

Cette implémentation vous donne un système de gestion des utilisateurs complet, sécurisé et engageant, parfaitement intégré avec votre backend Node.js existant. 