import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'magb_access_token';
const REFRESH_TOKEN_KEY = 'magb_refresh_token';

export interface User {
  id: string;
  nom: string;
  prenoms: string;
  telephone: string;
  email: string;
  pays: string;
  dateNaissance: string;
  password: string;
  firstLogin: boolean;
  profileCompleted: boolean;
  role: 'user' | 'admin';
  actif: boolean;
}

export interface Profile {
  situationMatrimoniale: string;
  nombreEnfants: number;
  ville: string;
  photoUrl: string;
  reseauxSociaux: string;
  telephone2: string;
}

export interface Contribution {
  id: string;
  userId: string;
  type: 'ponctuelle' | 'recurrente';
  frequence?: 'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle';
  montant: number;
  devise: 'FCFA' | 'USD';
  dateCreation: string;
  datesEngagement: string[];
  statut: 'en_attente' | 'payee' | 'annulee';
}

export interface Payment {
  id: string;
  contributionId: string;
  userId: string;
  montant: number;
  devise: 'FCFA' | 'USD';
  date: string;
  statut: 'succes' | 'echoue' | 'en_attente';
  reference: string;
}

export interface Notification {
  id: string;
  titre: string;
  message: string;
  date: string;
  destinataires: 'tous' | string[];
  lue: string[];
}

export interface LienUtile {
  id: string;
  titre: string;
  url: string;
  description: string;
  dateCreation: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isDataLoading: boolean;
  contributions: Contribution[];
  payments: Payment[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'firstLogin' | 'profileCompleted' | 'role' | 'actif'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Profile) => void;
  completeFirstLogin: () => void;
  addContribution: (contribution: Omit<Contribution, 'id' | 'userId' | 'dateCreation'>) => Promise<Contribution | null>;
  addPayment: (payment: Omit<Payment, 'id' | 'userId'>) => Promise<Payment | null>;
  initializePayment: (
    donationId: string,
    method: 'mobile_money' | 'card'
  ) => Promise<{ success: boolean; paymentUrl?: string; paymentId?: string; transactionId?: string; error?: string }>;
  verifyPaymentStatus: (paymentId: string) => Promise<{ success: boolean; status?: 'pending' | 'completed' | 'failed'; error?: string }>;
  refreshFinancialData: () => Promise<void>;
  getTotalDons: () => number;
  getGamificationLevel: () => { level: string; color: string; min: number; max: number | null };
  getAllUsers: () => User[];
  getAllContributions: () => Contribution[];
  getAllPayments: () => Payment[];
  isAdmin: () => boolean;
  updateUserRole: (userId: string, role: 'user' | 'admin') => void;
  toggleUserActive: (userId: string) => void;
  updateUser: (userId: string, data: Partial<Pick<User, 'nom' | 'prenoms' | 'telephone' | 'email' | 'pays' | 'dateNaissance'>>) => void;
  deleteUser: (userId: string) => void;
  sendNotification: (notif: Omit<Notification, 'id' | 'date' | 'lue'>) => void;
  getNotifications: () => Notification[];
  getUserNotifications: () => Notification[];
  markNotificationRead: (notifId: string) => void;
  getLiensUtiles: () => LienUtile[];
  addLienUtile: (lien: Omit<LienUtile, 'id' | 'dateCreation'>) => void;
  updateLienUtile: (id: string, lien: Partial<Omit<LienUtile, 'id' | 'dateCreation'>>) => void;
  deleteLienUtile: (id: string) => void;
  sendEmailVerificationCode: () => Promise<{ success: boolean; error?: string }>;
  verifyEmailCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  sendPhoneVerificationCode: () => Promise<{ success: boolean; error?: string }>;
  verifyPhoneCode: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const tryRefreshToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (response.ok && data?.success && data?.data?.token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.data.token);
      if (data.data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);
      return true;
    }
  } catch { /* ignore */ }
  return false;
};

const authApiRequest = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  // Si 401, tenter un refresh token puis retry
  if (response.status === 401 && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken();
    }
    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      const newHeaders = new Headers(options.headers || {});
      if (!newHeaders.has('Content-Type') && options.body) newHeaders.set('Content-Type', 'application/json');
      newHeaders.set('Authorization', `Bearer ${getAccessToken()}`);
      response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: newHeaders });
    }
  }

  return response;
};

const mapApiUserToLocalUser = (apiUser: any): User => ({
  id: apiUser.id,
  nom: apiUser.lastName || '',
  prenoms: apiUser.firstName || '',
  telephone: apiUser.phone || '',
  email: apiUser.email || '',
  pays: apiUser.country || '',
  dateNaissance: '',
  password: '',
  firstLogin: false,
  profileCompleted: !!apiUser.profileComplete,
  role: apiUser.role === 'admin' ? 'admin' : 'user',
  actif: true,
});

const mapDonationStatusToLocal = (status?: string): Contribution['statut'] => {
  if (status === 'completed') return 'payee';
  if (status === 'failed' || status === 'cancelled' || status === 'refunded') return 'annulee';
  return 'en_attente';
};

const mapPaymentStatusToLocal = (status?: string): Payment['statut'] => {
  if (status === 'completed') return 'succes';
  if (status === 'failed' || status === 'cancelled' || status === 'refunded' || status === 'expired') return 'echoue';
  return 'en_attente';
};

const mapApiDonationToLocalContribution = (donation: any, currentUserId: string): Contribution => {
  const isRecurring = donation.type === 'recurring';
  const frequencyMap: Record<string, Contribution['frequence']> = {
    monthly: 'mensuelle',
    quarterly: 'trimestrielle',
    yearly: 'annuelle',
  };

  const startDate = donation.recurring?.startDate || donation.createdAt || new Date().toISOString();
  const nextDate = donation.recurring?.nextPaymentDate;
  const datesEngagement = [startDate, nextDate].filter(Boolean);

  return {
    id: donation._id || donation.id,
    userId: currentUserId,
    type: isRecurring ? 'recurrente' : 'ponctuelle',
    frequence: isRecurring ? (frequencyMap[donation.recurring?.frequency] || 'mensuelle') : undefined,
    montant: Number(donation.amount || 0),
    devise: donation.currency === 'USD' ? 'USD' : 'FCFA',
    dateCreation: donation.createdAt || new Date().toISOString(),
    datesEngagement: datesEngagement.length > 0 ? datesEngagement : [new Date().toISOString()],
    statut: mapDonationStatusToLocal(donation.status),
  };
};

const mapApiPaymentToLocalPayment = (payment: any, currentUserId: string): Payment => ({
  id: payment._id || payment.id,
  contributionId: payment.donation?._id || payment.donation || '',
  userId: currentUserId,
  montant: Number(payment.amount || 0),
  devise: payment.currency === 'USD' ? 'USD' : 'FCFA',
  date: payment.createdAt || new Date().toISOString(),
  statut: mapPaymentStatusToLocal(payment.status),
  reference: payment.transaction?.reference || payment.transaction?.externalId || payment._id || `PAY-${Date.now()}`,
});

const mapApiNotificationToLocal = (item: any): Notification => ({
  id: item.id || item._id,
  titre: item.titre || item.title || '',
  message: item.message || '',
  date: item.date || item.createdAt || new Date().toISOString(),
  destinataires: item.destinataires || (item.recipientsType === 'all' ? 'tous' : (item.recipients || [])),
  lue: item.lue || (item.readBy || []).map((id: any) => String(id)),
});

const mapApiLinkToLocal = (item: any): LienUtile => ({
  id: item.id || item._id,
  titre: item.titre || item.title || '',
  url: item.url || '',
  description: item.description || '',
  dateCreation: item.dateCreation || item.createdAt || new Date().toISOString(),
});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('magb_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    const stored = localStorage.getItem('magb_current_profile');
    return stored ? JSON.parse(stored) : null;
  });

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [liensUtiles, setLiensUtiles] = useState<LienUtile[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadFinancialData = useCallback(async (currentUser: User) => {
    setIsDataLoading(true);
    const token = getAccessToken();

    if (token) {
      try {
        const [donationsRes, paymentsRes] = await Promise.all([
          authApiRequest('/api/donations?includeAll=true&limit=200'),
          authApiRequest('/api/payments?limit=200'),
        ]);

        if (donationsRes.ok) {
          const donationsPayload = await donationsRes.json();
          const apiDonations = donationsPayload?.data?.donations || [];
          const mappedContributions = apiDonations.map((d: any) => mapApiDonationToLocalContribution(d, currentUser.id));
          setContributions(mappedContributions);
        } else {
          setContributions([]);
        }

        if (paymentsRes.ok) {
          const paymentsPayload = await paymentsRes.json();
          const apiPayments = paymentsPayload?.data?.payments || [];
          const mappedPayments = apiPayments.map((p: any) => mapApiPaymentToLocalPayment(p, currentUser.id));
          setPayments(mappedPayments);
        } else {
          setPayments([]);
        }

        setIsDataLoading(false);
        return;
      } catch {
        // Fallback local ci-dessous
      }
    }

    const allContribs: Contribution[] = JSON.parse(localStorage.getItem('magb_contributions') || '[]');
    setContributions(allContribs.filter(c => c.userId === currentUser.id));
    const allPayments: Payment[] = JSON.parse(localStorage.getItem('magb_payments') || '[]');
    setPayments(allPayments.filter(p => p.userId === currentUser.id));
    setIsDataLoading(false);
  }, []);

  const refreshFinancialData = useCallback(async () => {
    if (!user) return;
    await loadFinancialData(user);
  }, [user, loadFinancialData]);

  const loadAuxData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setNotifications(JSON.parse(localStorage.getItem('magb_notifications') || '[]'));
      setLiensUtiles(JSON.parse(localStorage.getItem('magb_liens_utiles') || '[]'));
      return;
    }

    try {
      const [notifsRes, linksRes] = await Promise.all([
        authApiRequest('/api/notifications/my'),
        authApiRequest('/api/links'),
      ]);

      if (notifsRes.ok) {
        const payload = await notifsRes.json();
        const apiNotifs = payload?.data?.notifications || [];
        setNotifications(apiNotifs.map((n: any) => mapApiNotificationToLocal(n)));
      } else {
        setNotifications([]);
      }

      if (linksRes.ok) {
        const payload = await linksRes.json();
        const apiLinks = payload?.data?.links || [];
        setLiensUtiles(apiLinks.map((l: any) => mapApiLinkToLocal(l)));
      } else {
        setLiensUtiles([]);
      }
    } catch {
      setNotifications(JSON.parse(localStorage.getItem('magb_notifications') || '[]'));
      setLiensUtiles(JSON.parse(localStorage.getItem('magb_liens_utiles') || '[]'));
    }
  }, []);

  // Synchroniser la session API si token présent
  useEffect(() => {
    const syncSession = async () => {
      const token = getAccessToken();
      if (!token) return;

      try {
        const response = await authApiRequest('/api/auth/me');
        if (!response.ok) {
          throw new Error('Session invalide');
        }

        const payload = await response.json();
        if (!payload?.success || !payload?.data?.user) {
          throw new Error('Format de réponse invalide');
        }

        const mappedUser = mapApiUserToLocalUser(payload.data.user);
        setUser(mappedUser);
        localStorage.setItem('magb_current_user', JSON.stringify(mappedUser));
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('magb_current_user');
      }
    };

    void syncSession();
  }, []);

  // Seed default admin account if none exists
  useEffect(() => {
    const users: User[] = JSON.parse(localStorage.getItem('magb_users') || '[]');
    if (!users.some(u => u.role === 'admin')) {
      const adminUser: User = {
        id: crypto.randomUUID(),
        nom: 'Admin',
        prenoms: 'MAGB',
        telephone: '0000000000',
        email: 'admin@magb.com',
        pays: "Côte d'Ivoire",
        dateNaissance: '1990-01-01',
        password: 'Admin2025!',
        firstLogin: false,
        profileCompleted: false,
        role: 'admin',
        actif: true,
      };
      users.push(adminUser);
      localStorage.setItem('magb_users', JSON.stringify(users));
    }
    // Migrate existing users without actif field
    let migrated = false;
    users.forEach(u => { if (u.actif === undefined) { (u as any).actif = true; migrated = true; } });
    if (migrated) localStorage.setItem('magb_users', JSON.stringify(users));
  }, []);

  useEffect(() => {
    if (user) {
      void loadFinancialData(user);
      void loadAuxData();
    }
  }, [user, loadFinancialData, loadAuxData]);

  const signup = async (userData: Omit<User, 'id' | 'firstLogin' | 'profileCompleted' | 'role' | 'actif'>): Promise<boolean> => {
    try {
      const response = await authApiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: userData.prenoms,
          lastName: userData.nom,
          email: userData.email,
          phone: userData.telephone,
          password: userData.password,
          country: userData.pays,
          // Le formulaire frontend-new ne collecte pas encore la ville
          city: userData.pays || 'Abidjan',
          language: 'fr',
          currency: 'XOF',
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success || !payload?.data?.user) {
        return false;
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, payload.data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, payload.data.refreshToken);

      const mappedUser = mapApiUserToLocalUser(payload.data.user);
      localStorage.setItem('magb_current_user', JSON.stringify(mappedUser));
      setUser(mappedUser);

      return true;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success || !payload?.data?.user) {
        return false;
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, payload.data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, payload.data.refreshToken);

      const mappedUser = mapApiUserToLocalUser(payload.data.user);
      localStorage.setItem('magb_current_user', JSON.stringify(mappedUser));
      setUser(mappedUser);

      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('magb_current_user');
    localStorage.removeItem('magb_current_profile');
    setUser(null);
    setProfile(null);
    setContributions([]);
    setPayments([]);
  };

  const completeFirstLogin = () => {
    if (!user) return;
    const updated = { ...user, firstLogin: false };
    setUser(updated);
    localStorage.setItem('magb_current_user', JSON.stringify(updated));
    const users: User[] = JSON.parse(localStorage.getItem('magb_users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) { users[idx] = updated; localStorage.setItem('magb_users', JSON.stringify(users)); }
  };

  const updateProfile = (p: Profile) => {
    if (!user) return;
    setProfile(p);
    localStorage.setItem('magb_current_profile', JSON.stringify(p));
    const profiles: Record<string, Profile> = JSON.parse(localStorage.getItem('magb_profiles') || '{}');
    profiles[user.id] = p;
    localStorage.setItem('magb_profiles', JSON.stringify(profiles));
    const updated = { ...user, profileCompleted: true };
    setUser(updated);
    localStorage.setItem('magb_current_user', JSON.stringify(updated));
    const users: User[] = JSON.parse(localStorage.getItem('magb_users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) { users[idx] = updated; localStorage.setItem('magb_users', JSON.stringify(users)); }
  };

  const getLevelForTotal = (total: number) => {
    if (total >= 10_000_000) return 'Or';
    if (total >= 1_000_001) return 'Argent';
    if (total >= 300_001) return 'Bronze';
    return 'Classique';
  };

  const autoNotify = (titre: string, message: string, userId: string) => {
    sendNotification({
      titre,
      message,
      destinataires: [userId],
    });
  };

  const addContribution = async (c: Omit<Contribution, 'id' | 'userId' | 'dateCreation'>): Promise<Contribution | null> => {
    if (!user) return null;
    const token = getAccessToken();

    if (token) {
      try {
        const type = c.type === 'recurrente' ? 'recurring' : 'one_time';
        const frequencyMap: Record<string, string> = {
          mensuelle: 'monthly',
          trimestrielle: 'quarterly',
          semestrielle: 'monthly',
          annuelle: 'yearly',
        };
        const recurringInterval = c.frequence === 'semestrielle' ? 6 : 1;

        const categoryMap: Record<string, string> = {
          mensuelle: 'don_mensuel',
          trimestrielle: 'don_trimestriel',
          semestrielle: 'don_semestriel',
          annuelle: 'don_mensuel',
        };

        const response = await authApiRequest('/api/donations', {
          method: 'POST',
          body: JSON.stringify({
            amount: c.montant,
            currency: c.devise === 'USD' ? 'USD' : 'XOF',
            category: type === 'one_time' ? 'don_ponctuel' : (categoryMap[c.frequence || 'mensuelle'] || 'don_mensuel'),
            type,
            paymentMethod: 'mobile_money',
            recurring: type === 'recurring' ? {
              frequency: frequencyMap[c.frequence || 'mensuelle'] || 'monthly',
              interval: recurringInterval,
              startDate: c.datesEngagement[0] || new Date().toISOString(),
            } : undefined,
          }),
        });

        const payload = await response.json();
        if (response.ok && payload?.success && payload?.data?.donation) {
          const created = mapApiDonationToLocalContribution(payload.data.donation, user.id);
          setContributions(prev => [...prev, created]);
          return created;
        }
      } catch {
        // Fallback local ci-dessous
      }
    }

    const newC: Contribution = { ...c, id: crypto.randomUUID(), userId: user.id, dateCreation: new Date().toISOString() };
    const all: Contribution[] = JSON.parse(localStorage.getItem('magb_contributions') || '[]');
    all.push(newC);
    localStorage.setItem('magb_contributions', JSON.stringify(all));
    setContributions(prev => [...prev, newC]);

    const deviseLabel = c.devise === 'USD' ? `$${c.montant.toLocaleString()}` : `${c.montant.toLocaleString()} FCFA`;
    autoNotify(
      '🎉 Nouveau don enregistré',
      `Votre ${c.type === 'recurrente' ? 'don récurrent' : 'don ponctuel'} de ${deviseLabel} a été enregistré avec succès.`,
      user.id
    );
    return newC;
  };

  const addPayment = async (p: Omit<Payment, 'id' | 'userId'>): Promise<Payment | null> => {
    if (!user) return null;
    const previousTotal = payments.filter(pm => pm.statut === 'succes').reduce((sum, pm) => sum + (pm.devise === 'USD' ? pm.montant * 600 : pm.montant), 0);
    const previousLevel = getLevelForTotal(previousTotal);

    const newP: Payment = { ...p, id: crypto.randomUUID(), userId: user.id };
    const all: Payment[] = JSON.parse(localStorage.getItem('magb_payments') || '[]');
    all.push(newP);
    localStorage.setItem('magb_payments', JSON.stringify(all));
    setPayments(prev => {
      const updated = [...prev, newP];
      // Check level change after adding payment
      if (p.statut === 'succes') {
        const newTotal = previousTotal + (p.devise === 'USD' ? p.montant * 600 : p.montant);
        const newLevel = getLevelForTotal(newTotal);
        if (newLevel !== previousLevel) {
          autoNotify(
            '🏆 Nouveau niveau atteint !',
            `Félicitations ! Vous êtes passé au niveau ${newLevel}. Continuez ainsi !`,
            user.id
          );
        }
      }
      return updated;
    });
    return newP;
  };

  const initializePayment = async (
    donationId: string,
    method: 'mobile_money' | 'card'
  ): Promise<{ success: boolean; paymentUrl?: string; paymentId?: string; transactionId?: string; error?: string }> => {
    const token = getAccessToken();
    if (!token) {
      return { success: false, error: 'Session expirée, reconnectez-vous' };
    }

    try {
      const payload: Record<string, string> = {
        donationId,
        provider: 'moneyfusion',
        paymentMethod: 'moneyfusion',
      };

      if (user?.telephone && /^\+?[1-9]\d{1,14}$/.test(user.telephone)) {
        payload.customerPhone = user.telephone;
      }

      const response = await authApiRequest('/api/payments/initialize', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result?.success || !result?.data) {
        return { success: false, error: result?.error || 'Initialisation du paiement échouée' };
      }

      await refreshFinancialData();

      return {
        success: true,
        paymentUrl: result.data.paymentUrl,
        paymentId: result.data.paymentId,
        transactionId: result.data.transactionId,
      };
    } catch {
      return { success: false, error: 'Erreur réseau pendant l\'initialisation du paiement' };
    }
  };

  const verifyPaymentStatus = async (
    paymentId: string
  ): Promise<{ success: boolean; status?: 'pending' | 'completed' | 'failed'; error?: string }> => {
    const token = getAccessToken();
    if (!token) {
      return { success: false, error: 'Session expirée' };
    }

    try {
      const response = await authApiRequest(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
      });

      const result = await response.json();
      if (!response.ok || !result) {
        return { success: false, error: result?.error || 'Erreur de vérification' };
      }

      const status = result?.data?.status;
      if (status === 'completed' || status === 'failed' || status === 'pending') {
        if (status !== 'pending') {
          await refreshFinancialData();
        }
        return { success: true, status };
      }

      return { success: true, status: 'pending' };
    } catch {
      return { success: false, error: 'Erreur réseau pendant la vérification' };
    }
  };

  const getTotalDons = (): number => {
    return payments.filter(p => p.statut === 'succes').reduce((sum, p) => {
      return sum + (p.devise === 'USD' ? p.montant * 600 : p.montant);
    }, 0);
  };

  const getGamificationLevel = () => {
    const total = getTotalDons();
    if (total >= 10_000_000) return { level: 'Or', color: 'text-secondary', min: 10_000_000, max: null };
    if (total >= 1_000_001) return { level: 'Argent', color: 'text-muted-foreground', min: 1_000_001, max: 9_999_999 };
    if (total >= 300_001) return { level: 'Bronze', color: 'text-gold-dark', min: 300_001, max: 1_000_000 };
    return { level: 'Classique', color: 'text-foreground', min: 0, max: 300_000 };
  };

  const getAllUsers = (): User[] => JSON.parse(localStorage.getItem('magb_users') || '[]');
  const getAllContributions = (): Contribution[] => JSON.parse(localStorage.getItem('magb_contributions') || '[]');
  const getAllPayments = (): Payment[] => JSON.parse(localStorage.getItem('magb_payments') || '[]');
  const isAdmin = () => user?.role === 'admin';

  const updateUserRole = (userId: string, role: 'user' | 'admin') => {
    const users: User[] = JSON.parse(localStorage.getItem('magb_users') || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx].role = role;
      localStorage.setItem('magb_users', JSON.stringify(users));
    }
  };

  const toggleUserActive = (userId: string) => {
    const users: User[] = JSON.parse(localStorage.getItem('magb_users') || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx].actif = !users[idx].actif;
      localStorage.setItem('magb_users', JSON.stringify(users));
    }
  };

  const updateUser = (userId: string, data: Partial<Pick<User, 'nom' | 'prenoms' | 'telephone' | 'email' | 'pays' | 'dateNaissance'>>) => {
    const users: User[] = JSON.parse(localStorage.getItem('magb_users') || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      Object.assign(users[idx], data);
      localStorage.setItem('magb_users', JSON.stringify(users));
    }
  };

  const deleteUser = (userId: string) => {
    let users: User[] = JSON.parse(localStorage.getItem('magb_users') || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('magb_users', JSON.stringify(users));
    // Clean up related data
    let contribs: Contribution[] = JSON.parse(localStorage.getItem('magb_contributions') || '[]');
    contribs = contribs.filter(c => c.userId !== userId);
    localStorage.setItem('magb_contributions', JSON.stringify(contribs));
    let pays: Payment[] = JSON.parse(localStorage.getItem('magb_payments') || '[]');
    pays = pays.filter(p => p.userId !== userId);
    localStorage.setItem('magb_payments', JSON.stringify(pays));
    const profiles: Record<string, Profile> = JSON.parse(localStorage.getItem('magb_profiles') || '{}');
    delete profiles[userId];
    localStorage.setItem('magb_profiles', JSON.stringify(profiles));
  };

  const sendNotification = (notif: Omit<Notification, 'id' | 'date' | 'lue'>) => {
    const tempId = crypto.randomUUID();
    const optimistic: Notification = {
      ...notif,
      id: tempId,
      date: new Date().toISOString(),
      lue: [],
    };
    setNotifications(prev => [optimistic, ...prev]);

    const token = getAccessToken();
    if (!token) {
      const all: Notification[] = JSON.parse(localStorage.getItem('magb_notifications') || '[]');
      all.push(optimistic);
      localStorage.setItem('magb_notifications', JSON.stringify(all));
      return;
    }

    void (async () => {
      try {
        const response = await authApiRequest('/api/notifications', {
          method: 'POST',
          body: JSON.stringify({
            titre: notif.titre,
            message: notif.message,
            destinataires: notif.destinataires,
          }),
        });
        const payload = await response.json();
        if (response.ok && payload?.success && payload?.data?.notification) {
          const created = mapApiNotificationToLocal(payload.data.notification);
          setNotifications(prev => prev.map(item => item.id === tempId ? created : item));
          return;
        }
      } catch {
        // fallback local
      }

      const all: Notification[] = JSON.parse(localStorage.getItem('magb_notifications') || '[]');
      all.push(optimistic);
      localStorage.setItem('magb_notifications', JSON.stringify(all));
    })();
  };

  const getNotifications = (): Notification[] => notifications;

  const getUserNotifications = (): Notification[] => {
    if (!user) return [];
    return notifications.filter(n => n.destinataires === 'tous' || (Array.isArray(n.destinataires) && n.destinataires.includes(user.id)));
  };

  const markNotificationRead = (notifId: string) => {
    if (!user) return;
    setNotifications(prev => prev.map(n => {
      if (n.id !== notifId || n.lue.includes(user.id)) return n;
      return { ...n, lue: [...n.lue, user.id] };
    }));

    const token = getAccessToken();
    if (!token) {
      const all: Notification[] = JSON.parse(localStorage.getItem('magb_notifications') || '[]');
      const idx = all.findIndex(n => n.id === notifId);
      if (idx >= 0 && !all[idx].lue.includes(user.id)) {
        all[idx].lue.push(user.id);
        localStorage.setItem('magb_notifications', JSON.stringify(all));
      }
      return;
    }

    void authApiRequest(`/api/notifications/${notifId}/read`, { method: 'PATCH' });
  };

  const getLiensUtiles = (): LienUtile[] => liensUtiles;

  const addLienUtile = (lien: Omit<LienUtile, 'id' | 'dateCreation'>) => {
    const tempId = crypto.randomUUID();
    const optimistic: LienUtile = { ...lien, id: tempId, dateCreation: new Date().toISOString() };
    setLiensUtiles(prev => [optimistic, ...prev]);

    const token = getAccessToken();
    if (!token) {
      const all = [...liensUtiles, optimistic];
      localStorage.setItem('magb_liens_utiles', JSON.stringify(all));
      return;
    }

    void (async () => {
      try {
        const response = await authApiRequest('/api/links', {
          method: 'POST',
          body: JSON.stringify({
            titre: lien.titre,
            url: lien.url,
            description: lien.description,
          }),
        });
        const payload = await response.json();
        if (response.ok && payload?.success && payload?.data?.link) {
          const created = mapApiLinkToLocal(payload.data.link);
          setLiensUtiles(prev => prev.map(item => item.id === tempId ? created : item));
          return;
        }
      } catch {
        // fallback local
      }

      const all = [...liensUtiles, optimistic];
      localStorage.setItem('magb_liens_utiles', JSON.stringify(all));
    })();
  };

  const updateLienUtile = (id: string, lien: Partial<Omit<LienUtile, 'id' | 'dateCreation'>>) => {
    setLiensUtiles(prev => prev.map(item => item.id === id ? { ...item, ...lien } : item));

    const token = getAccessToken();
    if (!token) {
      const all = liensUtiles.map(item => item.id === id ? { ...item, ...lien } : item);
      localStorage.setItem('magb_liens_utiles', JSON.stringify(all));
      return;
    }

    void authApiRequest(`/api/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        titre: lien.titre,
        url: lien.url,
        description: lien.description,
      }),
    });
  };

  const deleteLienUtile = (id: string) => {
    setLiensUtiles(prev => prev.filter(item => item.id !== id));

    const token = getAccessToken();
    if (!token) {
      const all = liensUtiles.filter(item => item.id !== id);
      localStorage.setItem('magb_liens_utiles', JSON.stringify(all));
      return;
    }

    void authApiRequest(`/api/links/${id}`, { method: 'DELETE' });
  };

  const sendEmailVerificationCode = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApiRequest('/api/auth/send-email-verification-code', { method: 'POST' });
      const data = await response.json();
      return response.ok ? { success: true } : { success: false, error: data?.error || 'Erreur envoi code email' };
    } catch { return { success: false, error: 'Erreur réseau' }; }
  };

  const verifyEmailCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApiRequest('/api/auth/verify-email-code', {
        method: 'POST', body: JSON.stringify({ code }),
      });
      const data = await response.json();
      return response.ok ? { success: true } : { success: false, error: data?.error || 'Code invalide' };
    } catch { return { success: false, error: 'Erreur réseau' }; }
  };

  const sendPhoneVerificationCode = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApiRequest('/api/auth/send-phone-verification-code', { method: 'POST' });
      const data = await response.json();
      return response.ok ? { success: true } : { success: false, error: data?.error || 'Erreur envoi code SMS' };
    } catch { return { success: false, error: 'Erreur réseau' }; }
  };

  const verifyPhoneCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApiRequest('/api/auth/verify-phone-code', {
        method: 'POST', body: JSON.stringify({ code }),
      });
      const data = await response.json();
      return response.ok ? { success: true } : { success: false, error: data?.error || 'Code invalide' };
    } catch { return { success: false, error: 'Erreur réseau' }; }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, contributions, payments, isDataLoading,
      login, signup, logout, updateProfile, completeFirstLogin,
      addContribution, addPayment, initializePayment, verifyPaymentStatus, refreshFinancialData, getTotalDons, getGamificationLevel,
      getAllUsers, getAllContributions, getAllPayments,
      isAdmin, updateUserRole, toggleUserActive, updateUser, deleteUser,
      sendNotification, getNotifications, getUserNotifications, markNotificationRead,
      getLiensUtiles, addLienUtile, updateLienUtile, deleteLienUtile,
      sendEmailVerificationCode, verifyEmailCode, sendPhoneVerificationCode, verifyPhoneCode,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
