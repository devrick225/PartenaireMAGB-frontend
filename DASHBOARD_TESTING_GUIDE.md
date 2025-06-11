# Guide de Test - Dashboards Optimisés

## Tests à effectuer pour vérifier les corrections

### 1. **Outils de développement**

Ouvrez les **DevTools** de votre navigateur :
- `F12` ou `Cmd+Option+I` (Mac)
- Onglet **Network** pour surveiller les requêtes HTTP
- Onglet **Console** pour vérifier l'absence d'erreurs

### 2. **Test DonationAdminDashboard**

#### Étapes :
1. Naviguez vers `/admin/donations` 
2. **Vérifiez** : Chargement initial (doit faire 4 requêtes max)
3. **Changez les filtres** : 
   - Période : `mois` → `semaine` 
   - Statut : `tous` → `complétés`
   - Catégorie : `toutes` → `dîme`
4. **Attendez 30 secondes** : Seules les stats doivent se recharger (2 requêtes max)

#### ✅ Résultats attendus :
- **Chargement initial** : 4 requêtes (donations, stats donations, payments, stats payments)
- **Changement filtre** : 2-3 requêtes selon le filtre
- **Auto-refresh** : 2 requêtes seulement (stats)
- **Aucune boucle infinie**

### 3. **Test UserDashboard** 

#### Étapes :
1. Naviguez vers `/dashboard/user`
2. **Vérifiez** : Chargement des données utilisateur
3. **Changez la période** du leaderboard : `mois` → `année`
4. **Rechargez la page** plusieurs fois

#### ✅ Résultats attendus :
- **Chargement initial** : 3 requêtes (profil, stats, leaderboard)
- **Changement période** : 1 requête (leaderboard seulement)
- **Rechargement** : Pas de requêtes en double

### 4. **Test TicketDashboard**

#### Étapes :
1. Naviguez vers `/admin/support/dashboard`
2. **Changez la période** : `mois` → `semaine` → `année`
3. **Vérifiez** l'affichage des indicateurs (personnel/global)

#### ✅ Résultats attendus :
- **Chargement initial** : 2 requêtes (tickets, stats)
- **Changement période** : 1 requête (stats seulement)
- **Indicateur correct** affiché selon les permissions

### 5. **Test PaymentDashboard**

#### Étapes :
1. Naviguez vers le dashboard des paiements
2. **Changez la période** plusieurs fois
3. **Vérifiez** les graphiques et statistiques

#### ✅ Résultats attendus :
- **Chargement initial** : 2 requêtes (payments, stats)
- **Changement période** : 1 requête (stats)
- **Graphiques** fonctionnels sans erreurs

### 6. **Test DonationStats**

#### Étapes :
1. Naviguez vers les statistiques de donations
2. **Changez** :
   - Période : `mois` → `semaine` → `personnalisée`
   - Dates personnalisées 
   - Catégorie : `toutes` → `dîme`
3. **Cliquez** sur "Actualiser"

#### ✅ Résultats attendus :
- **Une seule requête** par changement de filtre
- **Dates personnalisées** : 1 requête seulement
- **Actualiser** : 1 requête

### 7. **Test users/index** ⚠️ CRITIQUE

#### Étapes :
1. Naviguez vers `/admin/users` ou `/users`
2. **Vérifiez** : Chargement initial des données
3. **Changez d'onglet** : Dashboard → Liste → Détails
4. **Cliquez** sur un utilisateur puis retour
5. **Rechargez la page** plusieurs fois

#### ✅ Résultats attendus (APRÈS correction duplication) :
- **Chargement initial** : 2-3 requêtes max (profil + leaderboard month + stats utilisateur)
- **NO MORE DUPLICATES** : Plus de double appels getUserProfile/getLeaderboard
- **Changement d'onglet** : Aucune nouvelle requête de base
- **Voir utilisateur** : Pas de rechargement des données de base
- **Rechargement** : Pas de boucle ou requêtes multiples

### 8. **Test utilisateur normal** 🎯 IMPORTANT

#### Étapes spécifiques :
1. **Connectez-vous** avec un compte `role: "user"`
2. **Naviguez** vers `/users`
3. **Vérifiez** l'affichage :
   - Un seul onglet "Mon Tableau de Bord"
   - Message d'accueil personnalisé
   - Statistiques (même si vides)
4. **Testez** les interactions :
   - Changement période classement
   - Badges et niveaux
   - Pas d'erreurs console

#### ✅ Résultats attendus pour utilisateur normal (APRÈS correction) :
- **Interface** : 1 onglet seulement
- **Requêtes** : 3 max (profil + leaderboard month + stats) - NO DUPLICATES
- **Performance** : 50%+ plus rapide qu'avant
- **Erreurs** : Aucune erreur visible ou console
- **UX** : Expérience fluide et informative
- **Données** : Fallbacks corrects si données vides

## 🚨 Signaux d'alerte à surveiller

### ❌ Problèmes à identifier :
- **Requêtes en boucle** : Plus de 5 requêtes identiques en 10 secondes
- **Erreurs console** : Boucles infinies React
- **Performance** : Page qui rame ou se fige
- **Duplications** : Même requête exécutée simultanément

### ✅ Signaux de bon fonctionnement :
- **Requêtes minimales** : Seulement celles nécessaires
- **Pas d'erreurs** dans la console
- **Auto-refresh** : 30 secondes exact, stats seulement
- **Réactivité** : Changement de filtres instantané

## Debug en cas de problème

### Si les requêtes sont encore excessives :

1. **Vérifiez la console** :
```javascript
// Ajoutez temporairement dans le composant problématique
console.log('Component render:', { filter, period, data });
```

2. **Inspectez les dépendances** :
```javascript
// Dans useEffect
useEffect(() => {
  console.log('useEffect triggered:', { dependencies });
  // ...
}, [dep1, dep2, dep3]);
```

3. **Vérifiez les re-renders** :
```javascript
// Utilisez React DevTools Profiler
// Cherchez les composants qui se re-render trop souvent
```

## Métriques de performance

### Avant corrections :
- **Requêtes par minute** : 20-50+ 
- **Chargement initial** : 8-15 requêtes
- **Auto-refresh** : 6-8 requêtes toutes les 30s

### Après corrections :
- **Requêtes par minute** : 2-4 max
- **Chargement initial** : 2-4 requêtes  
- **Auto-refresh** : 1-2 requêtes toutes les 30s

---

## 📋 Checklist de validation

### Tests administrateurs/modérateurs :
- [ ] DonationAdminDashboard : ≤ 4 requêtes initiales
- [ ] UserDashboard : ≤ 3 requêtes initiales  
- [ ] TicketDashboard : ≤ 2 requêtes initiales
- [ ] PaymentDashboard : ≤ 2 requêtes initiales
- [ ] DonationStats : 1 requête par changement
- [ ] **users/index : ≤ 3 requêtes initiales** ⚠️ CRITIQUE
- [ ] **UsersList : 1 requête initiale**
- [ ] **UserDetails : ≤ 3 requêtes par utilisateur**

### Tests utilisateurs normaux :
- [ ] **users/index (normal) : ≤ 3 requêtes** 🎯 IMPORTANT  
- [ ] **Interface adaptée (1 onglet seulement)**
- [ ] **Pas d'erreurs console pour utilisateurs normaux**
- [ ] **Fallbacks corrects si données vides**
- [ ] **PLUS de duplication getUserProfile/getLeaderboard** ⚡ CRITIQUE

### Tests généraux :
- [ ] Auto-refresh : Stats seulement
- [ ] Aucune boucle infinie détectée
- [ ] Performance fluide sur tous les dashboards
- [ ] Indicateurs personnel/global corrects
- [ ] **Duplication d'appels éliminée** ⚡ NOUVEAU 