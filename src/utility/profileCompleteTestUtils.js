import { client } from '../config/dataService/dataService';

// Configuration des tests
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Données de test pour un profil complet
const COMPLETE_PROFILE_DATA = {
  // Informations de base
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '+2250707123456',
  
  // Informations personnelles détaillées
  dateOfBirth: '1985-05-15T00:00:00.000Z',
  gender: 'male',
  maritalStatus: 'married',
  
  // Adresse
  'address.street': '123 Avenue de la République',
  'address.neighborhood': 'Plateau',
  'address.postalCode': '01 BP 1234',
  'address.state': 'Abidjan',
  'address.country': "Côte d'Ivoire",
  
  // Informations professionnelles
  occupation: 'Ingénieur Informatique',
  employer: 'Orange CI',
  monthlyIncome: 500000,
  
  // Contact d'urgence
  'emergencyContact.name': 'Marie Dupont',
  'emergencyContact.relationship': 'Époux/Épouse',
  'emergencyContact.phone': '+2250707654321',
  'emergencyContact.email': 'marie.dupont@email.com',
  
  // Informations ecclésiastiques
  'churchMembership.isChurchMember': true,
  'churchMembership.churchName': 'Église Baptiste de Cocody',
  'churchMembership.membershipDate': '2010-01-01T00:00:00.000Z',
  'churchMembership.baptismDate': '2010-03-15T00:00:00.000Z',
  'churchMembership.ministry': 'Chorale',
  'churchMembership.churchRole': 'member',
  
  // Préférences de donation
  'donationPreferences.preferredAmount': 50000,
  'donationPreferences.preferredFrequency': 'monthly',
  'donationPreferences.preferredDay': 15,
  'donationPreferences.preferredPaymentMethod': 'mobile_money',
  'donationPreferences.donationCategories': ['tithe', 'offering', 'missions'],
  
  // Préférences de communication
  'communicationPreferences.language': 'fr',
  'communicationPreferences.preferredContactMethod': 'whatsapp',
  'communicationPreferences.receiveNewsletters': true,
  'communicationPreferences.receiveEventNotifications': true,
  'communicationPreferences.receiveDonationReminders': true,
  
  // Bénévolat
  'volunteer.isAvailable': true,
  'volunteer.skills': ['Informatique', 'Enseignement', 'Musique'],
  'volunteer.interests': ['technical', 'education', 'music'],
  
  // Famille
  'familyInfo.numberOfChildren': 2,
  'familyInfo.spouse.name': 'Marie Kouassi',
  'familyInfo.spouse.dateOfBirth': '1987-08-20T00:00:00.000Z',
  'familyInfo.spouse.isChurchMember': true,
};

// Données de test partielles pour tester les mises à jour
const PARTIAL_PROFILE_DATA = {
  occupation: 'Développeur Senior',
  'donationPreferences.preferredAmount': 75000,
  'communicationPreferences.receiveNewsletters': false,
  'volunteer.skills': ['Informatique', 'Formation', 'Gestion de projet']
};

// Fonction utilitaire pour afficher les résultats de test
const displayTestResults = (results, testName) => {
  console.group(`📊 ${testName}`);
  console.log(`✅ Succès: ${results.success.length}`);
  console.log(`❌ Erreurs: ${results.errors.length}`);
  
  if (results.success.length > 0) {
    console.group('✅ Tests réussis:');
    results.success.forEach(test => console.log(`  • ${test}`));
    console.groupEnd();
  }
  
  if (results.errors.length > 0) {
    console.group('❌ Tests échoués:');
    results.errors.forEach(error => console.error(`  • ${error}`));
    console.groupEnd();
  }
  
  console.groupEnd();
  return results;
};

// Tests de base pour le profil
export const testBasicProfile = async () => {
  const results = { success: [], errors: [] };
  
  try {
    // Test 1: Récupération du profil existant
    try {
      const response = await client.get('/users/profile');
      if (response.data.success) {
        results.success.push('Récupération du profil réussie');
        console.log('📄 Profil actuel:', response.data.data);
      } else {
        results.errors.push('Échec de récupération du profil');
      }
    } catch (error) {
      results.errors.push(`Erreur récupération profil: ${error.response?.data?.error || error.message}`);
    }
    
    // Test 2: Mise à jour avec données de base
    try {
      const basicData = {
        firstName: 'Jean',
        lastName: 'Test',
        phone: '+2250707111111',
        occupation: 'Testeur'
      };
      
      const response = await client.put('/users/profile', basicData);
      if (response.data.success) {
        results.success.push('Mise à jour basique réussie');
      } else {
        results.errors.push('Échec mise à jour basique');
      }
    } catch (error) {
      results.errors.push(`Erreur mise à jour basique: ${error.response?.data?.error || error.message}`);
    }
    
    // Test 3: Validation des données requises
    try {
      const invalidData = { gender: 'invalid_gender' };
      
      await client.put('/users/profile', invalidData);
      results.errors.push('Validation échouée - données invalides acceptées');
    } catch (error) {
      if (error.response?.status === 400) {
        results.success.push('Validation des données fonctionne correctement');
      } else {
        results.errors.push(`Erreur inattendue validation: ${error.message}`);
      }
    }
    
  } catch (error) {
    results.errors.push(`Erreur générale tests de base: ${error.message}`);
  }
  
  return results;
};

// Tests pour les champs imbriqués
export const testNestedFields = async () => {
  const results = { success: [], errors: [] };
  
  try {
    // Test 1: Mise à jour de l'adresse
    try {
      const addressData = {
        'address.street': 'Nouvelle rue test',
        'address.neighborhood': 'Nouveau quartier',
        'address.country': 'France'
      };
      
      const response = await client.put('/users/profile', addressData);
      if (response.data.success) {
        results.success.push('Mise à jour adresse réussie');
        
        // Vérifier que les données sont bien sauvegardées
        const profileResponse = await client.get('/users/profile');
        const profile = profileResponse.data.data.profile;
        
        if (profile.address && profile.address.street === 'Nouvelle rue test') {
          results.success.push('Persistance adresse vérifiée');
        } else {
          results.errors.push('Adresse non persistée correctement');
        }
      } else {
        results.errors.push('Échec mise à jour adresse');
      }
    } catch (error) {
      results.errors.push(`Erreur mise à jour adresse: ${error.response?.data?.error || error.message}`);
    }
    
    // Test 2: Contact d'urgence
    try {
      const emergencyData = {
        'emergencyContact.name': 'Contact Test',
        'emergencyContact.relationship': 'Ami(e)',
        'emergencyContact.phone': '+2250707999999'
      };
      
      const response = await client.put('/users/profile', emergencyData);
      if (response.data.success) {
        results.success.push('Mise à jour contact d\'urgence réussie');
      } else {
        results.errors.push('Échec mise à jour contact d\'urgence');
      }
    } catch (error) {
      results.errors.push(`Erreur contact urgence: ${error.response?.data?.error || error.message}`);
    }
    
    // Test 3: Préférences de donation
    try {
      const donationData = {
        'donationPreferences.preferredAmount': 25000,
        'donationPreferences.preferredFrequency': 'weekly',
        'donationPreferences.donationCategories': ['tithe', 'charity']
      };
      
      const response = await client.put('/users/profile', donationData);
      if (response.data.success) {
        results.success.push('Mise à jour préférences donation réussie');
      } else {
        results.errors.push('Échec mise à jour préférences donation');
      }
    } catch (error) {
      results.errors.push(`Erreur préférences donation: ${error.response?.data?.error || error.message}`);
    }
    
    // Test 4: Informations église
    try {
      const churchData = {
        'churchMembership.isChurchMember': true,
        'churchMembership.churchName': 'Église Test',
        'churchMembership.churchRole': 'deacon'
      };
      
      const response = await client.put('/users/profile', churchData);
      if (response.data.success) {
        results.success.push('Mise à jour informations église réussie');
      } else {
        results.errors.push('Échec mise à jour informations église');
      }
    } catch (error) {
      results.errors.push(`Erreur informations église: ${error.response?.data?.error || error.message}`);
    }
    
  } catch (error) {
    results.errors.push(`Erreur générale tests champs imbriqués: ${error.message}`);
  }
  
  return results;
};

// Test pour le profil complet
export const testCompleteProfile = async () => {
  const results = { success: [], errors: [] };
  
  try {
    // Test avec toutes les données
    const response = await client.put('/users/profile', COMPLETE_PROFILE_DATA);
    
    if (response.data.success) {
      results.success.push('Mise à jour profil complet réussie');
      
      // Vérifier le pourcentage de completion
      const profileData = response.data.data.profile;
      if (profileData.completionPercentage) {
        results.success.push(`Pourcentage de completion: ${profileData.completionPercentage}%`);
        
        if (profileData.completionPercentage >= 80) {
          results.success.push('Profil marqué comme complet');
        } else {
          results.errors.push(`Profil pas assez complet: ${profileData.completionPercentage}%`);
        }
      } else {
        results.errors.push('Pourcentage de completion non calculé');
      }
      
      // Vérifier la structure des données retournées
      const expectedFields = [
        'dateOfBirth', 'gender', 'maritalStatus', 'occupation',
        'address', 'emergencyContact', 'churchMembership',
        'donationPreferences', 'communicationPreferences',
        'volunteer', 'familyInfo'
      ];
      
      const missingFields = expectedFields.filter(field => !profileData[field]);
      if (missingFields.length === 0) {
        results.success.push('Tous les champs attendus sont présents');
      } else {
        results.errors.push(`Champs manquants: ${missingFields.join(', ')}`);
      }
      
    } else {
      results.errors.push('Échec mise à jour profil complet');
    }
    
  } catch (error) {
    results.errors.push(`Erreur profil complet: ${error.response?.data?.error || error.message}`);
  }
  
  return results;
};

// Test des mises à jour partielles
export const testPartialUpdates = async () => {
  const results = { success: [], errors: [] };
  
  try {
    // Obtenir l'état initial
    const initialResponse = await client.get('/users/profile');
    const initialProfile = initialResponse.data.data.profile;
    
    // Faire une mise à jour partielle
    const response = await client.put('/users/profile', PARTIAL_PROFILE_DATA);
    
    if (response.data.success) {
      results.success.push('Mise à jour partielle réussie');
      
      // Vérifier que seuls les champs modifiés ont changé
      const updatedProfile = response.data.data.profile;
      
      if (updatedProfile.occupation === 'Développeur Senior') {
        results.success.push('Champ occupation mis à jour correctement');
      } else {
        results.errors.push('Champ occupation non mis à jour');
      }
      
      if (updatedProfile.donationPreferences?.preferredAmount === 75000) {
        results.success.push('Préférence donation mise à jour correctement');
      } else {
        results.errors.push('Préférence donation non mise à jour');
      }
      
      // Vérifier qu'un champ non modifié n'a pas changé
      if (initialProfile.gender && updatedProfile.gender === initialProfile.gender) {
        results.success.push('Champs non modifiés préservés');
      } else if (!initialProfile.gender) {
        results.success.push('Pas de champ genre initial à vérifier');
      } else {
        results.errors.push('Champs non modifiés ont été altérés');
      }
      
    } else {
      results.errors.push('Échec mise à jour partielle');
    }
    
  } catch (error) {
    results.errors.push(`Erreur mise à jour partielle: ${error.response?.data?.error || error.message}`);
  }
  
  return results;
};

// Test des endpoints de préférences
export const testPreferences = async () => {
  const results = { success: [], errors: [] };
  
  try {
    // Test mise à jour préférences
    const preferencesData = {
      language: 'fr',
      currency: 'XOF',
      emailNotifications: {
        newsletters: true,
        events: true,
        donations: false
      },
      smsNotifications: {
        reminders: true,
        alerts: false
      }
    };
    
    const response = await client.put('/users/preferences', preferencesData);
    if (response.data.success) {
      results.success.push('Mise à jour préférences utilisateur réussie');
    } else {
      results.errors.push('Échec mise à jour préférences');
    }
    
  } catch (error) {
    results.errors.push(`Erreur préférences: ${error.response?.data?.error || error.message}`);
  }
  
  return results;
};

// Test des fonctions de téléchargement
export const testDownloadData = async () => {
  const results = { success: [], errors: [] };
  
  try {
    const response = await client.get('/users/profile/download-data', {
      responseType: 'blob'
    });
    
    if (response.data && response.status === 200) {
      results.success.push('Téléchargement données personnelles réussi');
      
      // Vérifier la taille du fichier
      if (response.data.size > 0) {
        results.success.push(`Fichier généré: ${response.data.size} bytes`);
      } else {
        results.errors.push('Fichier vide généré');
      }
    } else {
      results.errors.push('Échec téléchargement données');
    }
    
  } catch (error) {
    results.errors.push(`Erreur téléchargement: ${error.response?.data?.error || error.message}`);
  }
  
  return results;
};

// Test principal qui lance tous les tests
export const runAllProfileTests = async () => {
  console.log('🚀 Démarrage des tests du système de profil complet...\n');
  
  try {
    const basicTests = await testBasicProfile();
    displayTestResults(basicTests, 'Tests de Base du Profil');
    
    const nestedTests = await testNestedFields();
    displayTestResults(nestedTests, 'Tests des Champs Imbriqués');
    
    const completeTests = await testCompleteProfile();
    displayTestResults(completeTests, 'Tests du Profil Complet');
    
    const partialTests = await testPartialUpdates();
    displayTestResults(partialTests, 'Tests des Mises à Jour Partielles');
    
    const preferencesTests = await testPreferences();
    displayTestResults(preferencesTests, 'Tests des Préférences');
    
    const downloadTests = await testDownloadData();
    displayTestResults(downloadTests, 'Tests de Téléchargement');
    
    // Résumé final
    const totalSuccess = basicTests.success.length + nestedTests.success.length + 
                        completeTests.success.length + partialTests.success.length +
                        preferencesTests.success.length + downloadTests.success.length;
    
    const totalErrors = basicTests.errors.length + nestedTests.errors.length + 
                       completeTests.errors.length + partialTests.errors.length +
                       preferencesTests.errors.length + downloadTests.errors.length;
    
    console.log('\n📊 RÉSUMÉ FINAL DES TESTS:');
    console.log(`✅ Total réussis: ${totalSuccess}`);
    console.log(`❌ Total échoués: ${totalErrors}`);
    console.log(`📈 Taux de réussite: ${Math.round((totalSuccess / (totalSuccess + totalErrors)) * 100)}%`);
    
    return {
      summary: {
        totalSuccess,
        totalErrors,
        successRate: Math.round((totalSuccess / (totalSuccess + totalErrors)) * 100)
      },
      details: {
        basic: basicTests,
        nested: nestedTests,
        complete: completeTests,
        partial: partialTests,
        preferences: preferencesTests,
        download: downloadTests
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
    return {
      summary: { totalSuccess: 0, totalErrors: 1, successRate: 0 },
      details: { error: error.message }
    };
  }
};

// Fonctions utilitaires pour les tests individuels
export const testProfileField = async (fieldName, value) => {
  try {
    const response = await client.put('/users/profile', { [fieldName]: value });
    return response.data.success;
  } catch (error) {
    console.error(`Erreur test champ ${fieldName}:`, error.response?.data?.error || error.message);
    return false;
  }
};

export const getProfileCompletion = async () => {
  try {
    const response = await client.get('/users/profile');
    return response.data.data.profile?.completionPercentage || 0;
  } catch (error) {
    console.error('Erreur récupération completion:', error);
    return 0;
  }
};

// Export des données de test pour utilisation externe
export { COMPLETE_PROFILE_DATA, PARTIAL_PROFILE_DATA };

export default {
  runAllProfileTests,
  testBasicProfile,
  testNestedFields,
  testCompleteProfile,
  testPartialUpdates,
  testPreferences,
  testDownloadData,
  testProfileField,
  getProfileCompletion,
  COMPLETE_PROFILE_DATA,
  PARTIAL_PROFILE_DATA
}; 