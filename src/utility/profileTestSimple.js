import { client } from '../config/dataService/dataService';

// Test simple pour vérifier le profil
export const testProfileBasic = async () => {
  console.log('🔍 Test de récupération du profil...');
  
  try {
    const response = await client.get('/users/profile');
    console.log('✅ Réponse reçue:', response.data);
    
    if (response.data.success) {
      console.log('✅ Profil récupéré avec succès');
      console.log('📊 Structure des données:', {
        hasProfile: !!response.data.data.profile,
        hasUser: !!response.data.data.profile.user,
        userInfo: response.data.data.profile.user ? {
          firstName: response.data.data.profile.user.firstName,
          lastName: response.data.data.profile.user.lastName,
          email: response.data.data.profile.user.email
        } : null,
        profileInfo: {
          dateOfBirth: response.data.data.profile.dateOfBirth,
          gender: response.data.data.profile.gender,
          occupation: response.data.data.profile.occupation,
          completionPercentage: response.data.data.profile.completionPercentage
        }
      });
      
      return response.data.data.profile;
    } else {
      console.error('❌ Échec de récupération du profil');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    return null;
  }
};

// Test de mise à jour simple
export const testProfileUpdate = async () => {
  console.log('🔍 Test de mise à jour du profil...');
  
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    occupation: 'Développeur Test'
  };
  
  try {
    const response = await client.put('/users/profile', testData);
    console.log('✅ Réponse mise à jour:', response.data);
    
    if (response.data.success) {
      console.log('✅ Profil mis à jour avec succès');
      console.log('📊 Données mises à jour:', {
        userUpdated: response.data.data.user,
        profileUpdated: response.data.data.profile
      });
      
      return response.data.data;
    } else {
      console.error('❌ Échec de mise à jour du profil');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.response?.data || error.message);
    return null;
  }
};

// Exécution automatique au chargement (pour debug)
export const runQuickProfileTest = async () => {
  console.group('🚀 Tests rapides du profil');
  
  const profile = await testProfileBasic();
  if (profile) {
    await testProfileUpdate();
  }
  
  console.groupEnd();
  return profile;
};

export default {
  testProfileBasic,
  testProfileUpdate,
  runQuickProfileTest
}; 