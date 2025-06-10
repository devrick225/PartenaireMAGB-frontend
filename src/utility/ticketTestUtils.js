import { DataService } from '../config/dataService/dataService';

/**
 * Utilitaires de test pour le système de tickets
 * Ces fonctions permettent de tester la connexion avec le backend
 */

export const testTicketEndpoints = async () => {
  const results = {
    success: [],
    errors: []
  };

  // Test 1: Récupération de la liste des tickets
  try {
    const response = await DataService.get('/tickets');
    if (response.data.success) {
      results.success.push('✅ Récupération des tickets: OK');
      console.log('Tickets data:', response.data.data);
    } else {
      results.errors.push('❌ Récupération des tickets: Structure de réponse incorrecte');
    }
  } catch (error) {
    results.errors.push(`❌ Récupération des tickets: ${error.response?.data?.error || error.message}`);
  }

  // Test 2: Création d'un ticket de test
  try {
    const testTicket = {
      subject: 'Test Ticket - ' + Date.now(),
      description: 'Ceci est un ticket de test créé automatiquement pour valider le système.',
      category: 'general',
      priority: 'medium'
    };
    
    const response = await DataService.post('/tickets', testTicket);
    if (response.data.success) {
      results.success.push('✅ Création de ticket: OK');
      
      // Stocker l'ID pour les tests suivants
      window.testTicketId = response.data.data.ticket.id || response.data.data.ticket._id;
      console.log('Ticket créé:', response.data.data.ticket);
    } else {
      results.errors.push('❌ Création de ticket: Échec');
    }
  } catch (error) {
    results.errors.push(`❌ Création de ticket: ${error.response?.data?.error || error.message}`);
  }

  // Test 3: Récupération d'un ticket spécifique
  if (window.testTicketId) {
    try {
      const response = await DataService.get(`/tickets/${window.testTicketId}`);
      if (response.data.success) {
        results.success.push('✅ Récupération ticket spécifique: OK');
      } else {
        results.errors.push('❌ Récupération ticket spécifique: Échec');
      }
    } catch (error) {
      results.errors.push(`❌ Récupération ticket spécifique: ${error.response?.data?.error || error.message}`);
    }
  }

  // Test 4: Ajout d'un commentaire
  if (window.testTicketId) {
    try {
      const commentData = {
        comment: 'Ceci est un commentaire de test ajouté automatiquement.',
        isInternal: false
      };
      
      const response = await DataService.post(`/tickets/${window.testTicketId}/comments`, commentData);
      if (response.data.success) {
        results.success.push('✅ Ajout de commentaire: OK');
      } else {
        results.errors.push('❌ Ajout de commentaire: Échec');
      }
    } catch (error) {
      results.errors.push(`❌ Ajout de commentaire: ${error.response?.data?.error || error.message}`);
    }
  }

  // Test 5: Changement de statut
  if (window.testTicketId) {
    try {
      const statusData = {
        status: 'in_progress',
        reason: 'Test de changement de statut'
      };
      
      const response = await DataService.post(`/tickets/${window.testTicketId}/status`, statusData);
      if (response.data.success) {
        results.success.push('✅ Changement de statut: OK');
      } else {
        results.errors.push('❌ Changement de statut: Échec');
      }
    } catch (error) {
      results.errors.push(`❌ Changement de statut: ${error.response?.data?.error || error.message}`);
    }
  }

  // Test 6: Récupération des statistiques
  try {
    const response = await DataService.get('/tickets/stats');
    if (response.data.success) {
      results.success.push('✅ Récupération des statistiques: OK');
      console.log('Statistiques:', response.data.data);
    } else {
      results.errors.push('❌ Récupération des statistiques: Échec');
    }
  } catch (error) {
    results.errors.push(`❌ Récupération des statistiques: ${error.response?.data?.error || error.message}`);
  }

  return results;
};

/**
 * Valide la structure des données de ticket retournées par le backend
 */
export const validateTicketStructure = (ticket) => {
  const issues = [];
  
  // Vérifier la présence des champs obligatoires
  const requiredFields = ['ticketNumber', 'subject', 'description', 'category', 'priority', 'status'];
  
  requiredFields.forEach(field => {
    if (!ticket[field]) {
      issues.push(`❌ Champ obligatoire manquant: ${field}`);
    }
  });

  // Vérifier les données utilisateur
  if (!ticket.user) {
    issues.push('❌ Données utilisateur manquantes');
  } else {
    const userRequiredFields = ['firstName', 'lastName', 'email'];
    userRequiredFields.forEach(field => {
      if (!ticket.user[field]) {
        issues.push(`❌ Champ utilisateur manquant: ${field}`);
      }
    });
  }

  // Vérifier la cohérence des statuts
  const validStatuses = ['open', 'in_progress', 'waiting_user', 'waiting_admin', 'resolved', 'closed', 'cancelled'];
  if (!validStatuses.includes(ticket.status)) {
    issues.push(`❌ Statut invalide: ${ticket.status}`);
  }

  // Vérifier la cohérence des priorités
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(ticket.priority)) {
    issues.push(`❌ Priorité invalide: ${ticket.priority}`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Teste l'intégration avec les profils utilisateur
 */
export const testProfileIntegration = async () => {
  const results = {
    success: [],
    errors: []
  };

  try {
    // Récupérer les tickets avec données utilisateur
    const ticketsResponse = await DataService.get('/tickets');
    const tickets = ticketsResponse.data.data.tickets || [];
    
    if (tickets.length > 0) {
      const ticket = tickets[0];
      
      // Vérifier la présence des données de profil dans les tickets
      if (ticket.user) {
        results.success.push('✅ Données utilisateur présentes dans les tickets');
        
        // Vérifier les informations étendues du profil
        if (ticket.user.level !== undefined) {
          results.success.push('✅ Niveau utilisateur présent');
        } else {
          results.errors.push('❌ Niveau utilisateur manquant');
        }
        
        if (ticket.user.donationCount !== undefined) {
          results.success.push('✅ Nombre de donations présent');
        } else {
          results.errors.push('❌ Nombre de donations manquant');
        }
        
        if (ticket.user.totalDonations !== undefined) {
          results.success.push('✅ Total des donations présent');
        } else {
          results.errors.push('❌ Total des donations manquant');
        }
      } else {
        results.errors.push('❌ Données utilisateur manquantes dans les tickets');
      }
    } else {
      results.errors.push('⚠️ Aucun ticket trouvé pour tester l\'intégration profil');
    }
    
  } catch (error) {
    results.errors.push(`❌ Test intégration profil: ${error.message}`);
  }

  return results;
};

/**
 * Teste les fonctionnalités avancées des tickets
 */
export const testAdvancedFeatures = async () => {
  const results = {
    success: [],
    errors: []
  };

  if (!window.testTicketId) {
    results.errors.push('❌ Aucun ticket de test disponible pour les fonctionnalités avancées');
    return results;
  }

  // Test assignation (nécessite des droits admin)
  try {
    const response = await DataService.get('/users');
    if (response.data.success && response.data.data.users?.length > 0) {
      const adminUser = response.data.data.users.find(u => ['admin', 'moderator'].includes(u.role));
      
      if (adminUser) {
        try {
          await DataService.post(`/tickets/${window.testTicketId}/assign`, {
            assignedTo: adminUser._id
          });
          results.success.push('✅ Assignation de ticket: OK');
        } catch (error) {
          if (error.response?.status === 403) {
            results.errors.push('⚠️ Assignation de ticket: Droits insuffisants (normal pour utilisateur)');
          } else {
            results.errors.push(`❌ Assignation de ticket: ${error.response?.data?.error || error.message}`);
          }
        }
      }
    }
  } catch (error) {
    results.errors.push(`❌ Test assignation: ${error.message}`);
  }

  // Test récupération des commentaires
  try {
    const response = await DataService.get(`/tickets/${window.testTicketId}/comments`);
    if (response.data.success) {
      results.success.push('✅ Récupération des commentaires: OK');
    } else {
      results.errors.push('❌ Récupération des commentaires: Échec');
    }
  } catch (error) {
    results.errors.push(`❌ Récupération des commentaires: ${error.response?.data?.error || error.message}`);
  }

  // Test fermeture de ticket
  try {
    const response = await DataService.post(`/tickets/${window.testTicketId}/close`, {
      reason: 'Test terminé',
      resolution: 'Ticket de test fermé après validation des fonctionnalités'
    });
    if (response.data.success) {
      results.success.push('✅ Fermeture de ticket: OK');
    } else {
      results.errors.push('❌ Fermeture de ticket: Échec');
    }
  } catch (error) {
    results.errors.push(`❌ Fermeture de ticket: ${error.response?.data?.error || error.message}`);
  }

  return results;
};

/**
 * Affiche les résultats des tests dans la console
 */
export const displayTestResults = (results, testName = 'Tests des tickets') => {
  console.group(`🧪 ${testName}`);
  
  if (results.success.length > 0) {
    console.group('✅ Tests réussis');
    results.success.forEach(test => console.log(test));
    console.groupEnd();
  }
  
  if (results.errors.length > 0) {
    console.group('❌ Tests échoués');
    results.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  console.log(`\n📊 Résumé: ${results.success.length}/${results.success.length + results.errors.length} tests réussis`);
  console.groupEnd();
};

/**
 * Nettoie les tickets de test créés
 */
export const cleanupTestTickets = async () => {
  if (window.testTicketId) {
    try {
      await DataService.delete(`/tickets/${window.testTicketId}`);
      console.log('🧹 Ticket de test supprimé');
      delete window.testTicketId;
    } catch (error) {
      console.warn('⚠️ Impossible de supprimer le ticket de test:', error.message);
    }
  }
};

/**
 * Lance tous les tests des tickets
 */
export const runAllTicketTests = async () => {
  console.log('🚀 Lancement des tests complets du système de tickets...\n');
  
  // Test des endpoints de base
  const basicTests = await testTicketEndpoints();
  displayTestResults(basicTests, 'Tests des endpoints de base');
  
  // Test de l'intégration profil
  const profileTests = await testProfileIntegration();
  displayTestResults(profileTests, 'Tests d\'intégration profil');
  
  // Test des fonctionnalités avancées
  const advancedTests = await testAdvancedFeatures();
  displayTestResults(advancedTests, 'Tests des fonctionnalités avancées');
  
  // Nettoyage
  await cleanupTestTickets();
  
  // Résumé global
  const totalSuccess = basicTests.success.length + profileTests.success.length + advancedTests.success.length;
  const totalErrors = basicTests.errors.length + profileTests.errors.length + advancedTests.errors.length;
  
  console.log(`\n🎯 RÉSUMÉ GLOBAL: ${totalSuccess}/${totalSuccess + totalErrors} tests réussis`);
  
  if (totalErrors === 0) {
    console.log('🎉 Tous les tests sont passés avec succès !');
  } else if (totalSuccess > totalErrors) {
    console.log('⚠️ La plupart des tests sont passés, mais il y a quelques problèmes à corriger.');
  } else {
    console.log('❌ De nombreux tests ont échoué, vérifiez la configuration du backend.');
  }
  
  return {
    basic: basicTests,
    profile: profileTests,
    advanced: advancedTests,
    summary: {
      totalSuccess,
      totalErrors,
      successRate: Math.round((totalSuccess / (totalSuccess + totalErrors)) * 100)
    }
  };
};

/**
 * Teste les métriques de performance
 */
export const testPerformanceMetrics = async () => {
  const results = {
    success: [],
    errors: [],
    metrics: {}
  };

  try {
    const startTime = performance.now();
    
    // Test de performance sur la récupération des tickets
    const response = await DataService.get('/tickets');
    const loadTime = performance.now() - startTime;
    
    results.metrics.loadTime = Math.round(loadTime);
    
    if (loadTime < 1000) {
      results.success.push(`✅ Temps de chargement acceptable: ${Math.round(loadTime)}ms`);
    } else if (loadTime < 3000) {
      results.success.push(`⚠️ Temps de chargement correct: ${Math.round(loadTime)}ms`);
    } else {
      results.errors.push(`❌ Temps de chargement trop lent: ${Math.round(loadTime)}ms`);
    }
    
    // Analyser la taille des données
    const dataSize = JSON.stringify(response.data).length;
    results.metrics.dataSize = dataSize;
    
    if (dataSize < 100000) { // < 100KB
      results.success.push(`✅ Taille des données raisonnable: ${Math.round(dataSize/1024)}KB`);
    } else {
      results.errors.push(`⚠️ Taille des données importante: ${Math.round(dataSize/1024)}KB`);
    }
    
  } catch (error) {
    results.errors.push(`❌ Test de performance: ${error.message}`);
  }

  return results;
};

// Export d'une fonction de test rapide pour développement
export const quickTest = async () => {
  console.log('⚡ Test rapide des tickets...');
  
  try {
    const response = await DataService.get('/tickets');
    console.log('✅ Connexion API OK');
    console.log(`📊 ${response.data.data.tickets?.length || 0} tickets trouvés`);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
}; 