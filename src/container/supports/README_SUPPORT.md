# Système de Support - PartenaireMAGB

## 📋 Vue d'ensemble

Le système de support de PartenaireMAGB propose une solution complète de gestion des tickets avec intégration du profil utilisateur, métriques avancées, et interface moderne.

## 🚀 Fonctionnalités

### ✅ Système Principal
- **Tableau de bord avancé** avec métriques temps réel
- **Gestion complète des tickets** (création, modification, suivi)
- **Système de commentaires** avec support des commentaires internes
- **Évaluations et satisfaction client**
- **Suivi SLA** avec alertes
- **Intégration profil utilisateur** (niveau, donations, avatar)

### 📊 Analytics et Métriques
- Statistiques en temps réel
- Graphiques interactifs (status, catégories, évolution)
- Classement des agents de support
- Suivi des performances SLA
- Tableau de bord avec KPI

### 🔧 Fonctionnalités Avancées
- Assignation automatique et manuelle
- Escalade de tickets
- Pièces jointes
- Historique complet des actions
- Filtrage et recherche avancés
- Navigation intuitive entre les vues

## 📁 Structure des Fichiers

```
/container/supports/
├── index.js                    # Liste principale des tickets
├── TicketDashboard.js         # Tableau de bord avancé avec métriques
├── TicketDetailsEnhanced.js   # Vue détaillée améliorée d'un ticket
├── SupportCreate.js           # Formulaire de création de ticket
├── SupportUpdate.js           # Formulaire de modification de ticket
├── SupportNavigation.js       # Navigation entre les vues
├── constants.js               # Constantes et configurations partagées
├── Style.js                   # Styles CSS
├── Dashboard.js               # Ancien tableau de bord (compatibilité)
├── TicketDetails.js          # Ancienne vue détaillée (compatibilité)
└── README_SUPPORT.md         # Cette documentation
```

## 🛣️ Routes Disponibles

### Routes Principales
- `/admin/support` - Tableau de bord avancé (par défaut)
- `/admin/support/dashboard` - Tableau de bord avec métriques
- `/admin/support/tickets` - Liste des tickets
- `/admin/support/ticket/:id` - Détails d'un ticket (version améliorée)
- `/admin/support/new` - Création d'un nouveau ticket
- `/admin/support/edit/:id` - Modification d'un ticket

### Routes de Compatibilité
- `/admin/support/legacy` - Ancien tableau de bord
- `/admin/support/ticketDetails/:id` - Ancienne vue détaillée

## 🎯 Utilisation

### Navigation Rapide
Utilisez le composant `SupportNavigation` présent en haut de chaque page pour naviguer facilement entre les différentes vues.

### Création d'un Ticket
1. Cliquez sur "Nouvelle demande" ou utilisez `/admin/support/new`
2. Remplissez le formulaire avec :
   - Catégorie (obligatoire)
   - Sujet (5-100 caractères)
   - Priorité (basse, moyenne, haute, critique)
   - Description détaillée (minimum 20 caractères)

### Gestion des Tickets
- **Visualisation** : Accédez aux détails via l'icône œil
- **Modification** : Utilisez l'icône édition pour modifier
- **Suppression** : Confirmation requise avant suppression
- **Commentaires** : Ajoutez des réponses directement dans les détails
- **Changement de statut** : Bouton dédié pour les administrateurs

### Permissions par Rôle

#### Administrateur
- ✅ Gestion complète de tous les tickets
- ✅ Assignation de tickets
- ✅ Escalade et changement de statut
- ✅ Commentaires internes
- ✅ Suppression de tickets

#### Modérateur
- ✅ Gestion des tickets assignés
- ✅ Assignation de tickets
- ✅ Escalade et changement de statut
- ✅ Commentaires internes
- ❌ Suppression de tickets

#### Agent Support
- ✅ Gestion des tickets assignés
- ✅ Escalade
- ✅ Commentaires internes
- ❌ Assignation
- ❌ Suppression

#### Utilisateur
- ✅ Création de tickets
- ✅ Commentaires sur ses tickets
- ✅ Évaluation du support reçu
- ❌ Gestion administrative

## 🔧 Configuration

### Variables d'Environnement Requises
```env
REACT_APP_API_ENDPOINT=http://localhost:5000/api
```

### Constantes Configurables
Voir `constants.js` pour :
- Configuration des statuts, priorités, catégories
- Seuils SLA par priorité
- Messages d'erreur et de succès
- Règles de validation des formulaires

## 📈 Métriques SLA

### Seuils par Priorité
- **Critique** : 2 heures
- **Haute** : 8 heures
- **Moyenne** : 24 heures
- **Basse** : 72 heures

### Indicateurs
- Respect SLA global (objectif > 90%)
- Temps de première réponse
- Temps de résolution
- Score de satisfaction client

## 🎨 Interface Utilisateur

### Tableau de bord
- **Métriques principales** : 6 KPI en temps réel
- **Graphiques interactifs** : Répartition par statut, catégorie, évolution
- **Top agents** : Classement basé sur les performances
- **Tickets urgents** : Liste des tickets prioritaires

### Liste des Tickets
- **Filtrage avancé** : Par numéro, statut, mots-clés
- **Tri dynamique** : Par priorité, date, statut
- **Actions rapides** : Voir, modifier, supprimer
- **Pagination intelligente** : Navigation optimisée

### Détails de Ticket
- **Vue enrichie** : Informations complètes du ticket et utilisateur
- **Timeline des actions** : Historique complet
- **Système de commentaires** : Discussion en temps réel
- **Suivi SLA** : Barre de progression visuelle
- **Profil intégré** : Niveau, donations, historique utilisateur

## 🔗 Intégration Redux

### Actions Disponibles
```javascript
// Lectures
ticketReadData()                    // Liste des tickets
ticketSinglePageReadData(id)        // Détails d'un ticket
ticketGetStats(params)              // Statistiques

// Modifications
ticketCreateData(data)              // Création
ticketUpdateData(id, data)          // Mise à jour
ticketDeleteData(id)                // Suppression
ticketChangeStatus(id, status, reason, resolution)  // Changement statut
ticketAddComment(id, comment, isInternal)           // Ajout commentaire
ticketAddRating(id, score, comment)                 // Évaluation
```

### State Structure
```javascript
state.tickets = {
  data: { tickets: [], total: 0 },
  ticket: { ticket: null },
  stats: { /* métriques */ },
  loading: boolean,
  error: string
}
```

## 🧪 Tests et Validation

### Utilitaires de Test
Voir `../utility/ticketTestUtils.js` pour :
- Validation des endpoints
- Tests de performance
- Nettoyage automatique des données de test

### Points de Test Critiques
1. **Création/Modification** de tickets
2. **Permissions** par rôle utilisateur
3. **Performance** du tableau de bord
4. **Intégration** avec le système de profil
5. **SLA** et calculs de métriques

## 🚀 Déploiement

### Checklist Pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Tests de validation réussis
- [ ] Backend synchronisé (modèles, routes, contrôleurs)
- [ ] Migration base de données effectuée
- [ ] Permissions utilisateur vérifiées

### Migration des Données
Si vous migrez depuis l'ancien système :
1. Sauvegardez les tickets existants
2. Vérifiez la compatibilité des statuts/priorités
3. Testez les routes de compatibilité
4. Formez les utilisateurs sur la nouvelle interface

## 🆘 Dépannage

### Problèmes Courants

**Erreur de chargement des tickets**
- Vérifiez la connexion backend
- Contrôlez les permissions utilisateur
- Validez la structure des données Redux

**Navigation cassée**
- Vérifiez les routes dans `routes/admin/supports.js`
- Contrôlez les imports des composants
- Validez la configuration du routeur

**Métriques incorrectes**
- Vérifiez l'endpoint `/tickets/stats`
- Contrôlez les calculs dans `TicketDashboard.js`
- Validez les données retournées par l'API

## 🔄 Mises à Jour Futures

### Fonctionnalités Prévues
- [ ] Chat en temps réel
- [ ] Notifications push
- [ ] Templates de réponses
- [ ] Intégration email
- [ ] Export de données
- [ ] API publique

### Amélirations Continues
- Optimisation des performances
- UX/UI améliorée
- Nouvelles métriques
- Intégrations tierces

---

## 📞 Support

Pour toute question technique ou suggestion d'amélioration, contactez l'équipe de développement ou consultez la documentation complète du projet.

**Version** : 2.0.0  
**Dernière mise à jour** : Décembre 2024 