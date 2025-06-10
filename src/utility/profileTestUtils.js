import { DataService } from '../config/dataService/dataService';

/**
 * Utilitaires de test pour le profil utilisateur
 * Ces fonctions permettent de tester la connexion avec le backend
 */

export const testProfileEndpoints = async () => {
  const results = {
    success: [],
    errors: []
  };

  // Test 1: Récupération du profil
  try {
    const profileResponse = await DataService.get('/users/profile');
    if (profileResponse.data.success) {
      results.success.push('✅ Récupération du profil: OK');
      console.log('Profile data:', profileResponse.data.data.profile);
    } else {
      results.errors.push('❌ Récupération du profil: Structure de réponse incorrecte');
    }
  } catch (error) {
    results.errors.push(`❌ Récupération du profil: ${error.response?.data?.error || error.message}`);
  }

  // Test 2: Mise à jour du profil (test avec des données minimales)
  try {
    const updateData = {
      language: 'fr',
      currency: 'XOF'
    };
    const updateResponse = await DataService.put('/users/profile', updateData);
    if (updateResponse.data.success) {
      results.success.push('✅ Mise à jour du profil: OK');
    } else {
      results.errors.push('❌ Mise à jour du profil: Échec');
    }
  } catch (error) {
    results.errors.push(`❌ Mise à jour du profil: ${error.response?.data?.error || error.message}`);
  }

  // Test 3: Mise à jour des préférences
  try {
    const preferencesData = {
      emailNotifications: {
        donations: true,
        reminders: true
      }
    };
    const prefsResponse = await DataService.put('/users/preferences', preferencesData);
    if (prefsResponse.data.success) {
      results.success.push('✅ Mise à jour des préférences: OK');
    } else {
      results.errors.push('❌ Mise à jour des préférences: Échec');
    }
  } catch (error) {
    results.errors.push(`❌ Mise à jour des préférences: ${error.response?.data?.error || error.message}`);
  }

  return results;
};

/**
 * Valide la structure des données de profil retournées par le backend
 */
export const validateProfileStructure = (profile) => {
  const issues = [];
  
  // Vérifier la présence des données utilisateur
  if (!profile.user && !profile.firstName) {
    issues.push('❌ Données utilisateur manquantes');
  }
  
  // Vérifier les champs obligatoires
  const requiredUserFields = ['firstName', 'lastName', 'email', 'phone'];
  const userData = profile.user || profile;
  
  requiredUserFields.forEach(field => {
    if (!userData[field]) {
      issues.push(`❌ Champ obligatoire manquant: ${field}`);
    }
  });

  // Vérifier la cohérence des données
  if (profile.user && profile.firstName && profile.user.firstName !== profile.firstName) {
    issues.push('⚠️ Incohérence dans les données utilisateur');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Affiche les résultats des tests dans la console
 */
export const displayTestResults = (results) => {
  console.group('🧪 Résultats des tests du profil');
  
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
 * Teste la connexion à l'API de base
 */
export const testApiConnection = async () => {
  try {
    const response = await DataService.get('/health');
    return {
      success: true,
      message: '✅ Connexion à l\'API: OK',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Connexion à l\'API: ${error.message}`,
      error
    };
  }
};

// Fonction pour tester tout en une fois
export const runAllProfileTests = async () => {
  console.log('🚀 Lancement des tests du profil...\n');
  
  // Test de connexion API
  const connectionTest = await testApiConnection();
  console.log(connectionTest.message);
  
  if (!connectionTest.success) {
    console.error('❌ Impossible de continuer les tests - pas de connexion API');
    return;
  }
  
  // Tests des endpoints du profil
  const profileTests = await testProfileEndpoints();
  displayTestResults(profileTests);
  
  return {
    connection: connectionTest,
    profile: profileTests
  };
}; 