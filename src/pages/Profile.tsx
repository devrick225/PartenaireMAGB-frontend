import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Save, User, Camera, Lock, Shield, Download, Trash2, Loader2, Eye, EyeOff, Mail, Phone, CheckCircle, Send, Settings, Bell } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import PageLoader from '@/components/PageLoader';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function Profile() {
  const { user, isDataLoading, logout, sendEmailVerificationCode, verifyEmailCode, sendPhoneVerificationCode, verifyPhoneCode } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Password change
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Email/Phone verification
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState({ language: 'fr', currency: 'XOF', emailDonations: true, emailReminders: true, emailNewsletters: false, smsDonations: false, smsReminders: false });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', city: '', country: '',
    gender: '', maritalStatus: '', occupation: '', dateOfBirth: '',
    street: '', neighborhood: '', postalCode: '',
    numberOfChildren: 0, telephone2: '',
  });

  useEffect(() => {
    const load = async () => {
      const res = await apiRequest<any>('/api/users/profile');
      if (res.ok && res.data?.success) {
        const p = res.data.data?.profile || res.data.data?.user || res.data.data;
        const u = p?.user || p;
        setProfileData(p);
        setEmailVerified(!!u.isEmailVerified);
        setPhoneVerified(!!u.isPhoneVerified);
        setForm({
          firstName: u.firstName || '', lastName: u.lastName || '',
          phone: u.phone || '', city: u.city || '', country: u.country || '',
          gender: p.gender || '', maritalStatus: p.maritalStatus || '',
          occupation: p.occupation || '', dateOfBirth: p.dateOfBirth?.slice?.(0, 10) || '',
          street: p.address?.street || '', neighborhood: p.address?.neighborhood || '',
          postalCode: p.address?.postalCode || '',
          numberOfChildren: p.familyInfo?.numberOfChildren || 0,
          telephone2: u.phone2 || '',
        });
      }
      setLoading(false);
    };
    void load();
  }, []);

  // Load preferences
  useEffect(() => {
    const loadPrefs = async () => {
      const res = await apiRequest<any>('/api/users/preferences');
      if (res.ok && res.data?.success) {
        const d = res.data.data;
        setPrefs({
          language: d.language || 'fr', currency: d.currency || 'XOF',
          emailDonations: d.emailNotifications?.donations ?? true,
          emailReminders: d.emailNotifications?.reminders ?? true,
          emailNewsletters: d.emailNotifications?.newsletters ?? false,
          smsDonations: d.smsNotifications?.donations ?? false,
          smsReminders: d.smsNotifications?.reminders ?? false,
        });
      }
    };
    void loadPrefs();
  }, []);

  const update = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await apiRequest('/api/users/profile', 'PUT', {
      firstName: form.firstName, lastName: form.lastName,
      phone: form.phone, city: form.city, country: form.country,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined, maritalStatus: form.maritalStatus || undefined,
      occupation: form.occupation || undefined,
      address: { street: form.street, neighborhood: form.neighborhood, postalCode: form.postalCode },
      familyInfo: { numberOfChildren: form.numberOfChildren },
    });
    setSaving(false);
    if (res.ok) toast.success('Profil mis à jour');
    else toast.error('Erreur lors de la mise à jour');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 2 Mo"); return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const imageData = ev.target?.result as string;
      const res = await apiRequest('/api/users/upload-avatar-base64', 'POST', { imageData });
      if (res.ok) { toast.success('Photo mise à jour'); window.location.reload(); }
      else toast.error('Erreur upload photo');
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if (newPassword.length < 8) { toast.error('8 caractères minimum'); return; }
    setChangingPassword(true);
    const res = await apiRequest('/api/auth/change-password', 'PUT', { currentPassword, newPassword });
    setChangingPassword(false);
    if (res.ok) {
      toast.success('Mot de passe modifié');
      setShowPasswordDialog(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } else toast.error(res.data?.error || 'Erreur');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Tapez DELETE pour confirmer'); return; }
    setDeleting(true);
    const res = await apiRequest('/api/users/account', 'DELETE', { password: deletePassword, confirmation: 'DELETE' });
    setDeleting(false);
    if (res.ok) { toast.success('Compte supprimé'); logout(); }
    else toast.error(res.data?.error || 'Erreur');
  };

  const handleSendEmailCode = async () => {
    setSendingEmailCode(true);
    const res = await sendEmailVerificationCode();
    setSendingEmailCode(false);
    if (res.success) toast.success('Code envoyé par email');
    else toast.error(res.error || 'Erreur');
  };

  const handleVerifyEmail = async () => {
    if (emailCode.length !== 6) { toast.error('Code à 6 chiffres requis'); return; }
    setVerifyingEmail(true);
    const res = await verifyEmailCode(emailCode);
    setVerifyingEmail(false);
    if (res.success) { setEmailVerified(true); setEmailCode(''); toast.success('Email vérifié !'); }
    else toast.error(res.error || 'Code invalide');
  };

  const handleSendPhoneCode = async () => {
    setSendingPhoneCode(true);
    const res = await sendPhoneVerificationCode();
    setSendingPhoneCode(false);
    if (res.success) toast.success('Code envoyé par SMS');
    else toast.error(res.error || 'Erreur');
  };

  const handleVerifyPhone = async () => {
    if (phoneCode.length !== 6) { toast.error('Code à 6 chiffres requis'); return; }
    setVerifyingPhone(true);
    const res = await verifyPhoneCode(phoneCode);
    setVerifyingPhone(false);
    if (res.success) { setPhoneVerified(true); setPhoneCode(''); toast.success('Téléphone vérifié !'); }
    else toast.error(res.error || 'Code invalide');
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    const res = await apiRequest('/api/users/preferences', 'PUT', {
      language: prefs.language, currency: prefs.currency,
      emailNotifications: { donations: prefs.emailDonations, reminders: prefs.emailReminders, newsletters: prefs.emailNewsletters },
      smsNotifications: { donations: prefs.smsDonations, reminders: prefs.smsReminders },
    });
    setSavingPrefs(false);
    if (res.ok) toast.success('Préférences enregistrées');
    else toast.error('Erreur');
  };

  const handleDownloadData = async () => {
    try {
      const token = localStorage.getItem('magb_access_token');
      const response = await fetch(`${API_BASE}/api/users/profile/download-data`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'mes_donnees.json'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Données téléchargées');
    } catch { toast.error('Erreur téléchargement'); }
  };

  if (isDataLoading || loading) return <AppLayout><PageLoader message="Chargement du profil..." /></AppLayout>;

  const userData = profileData?.user || profileData;
  const avatarUrl = userData?.avatar?.url;

  return (
    <AppLayout>
      <div className="container max-w-2xl py-8 px-4 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Mon Profil</h1>

        {/* Avatar + info */}
        <Card className="mb-6 border-border">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-10 h-10 text-primary-foreground" />
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center cursor-pointer">
                <Camera className="w-6 h-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">{user?.prenoms} {user?.nom}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.telephone}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Infos</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="verification">Vérification</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="data">Données</TabsTrigger>
          </TabsList>

          {/* Informations */}
          <TabsContent value="info">
            <Card className="border-border">
              <CardHeader><CardTitle className="font-display">Informations personnelles</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Prénom</Label><Input value={form.firstName} onChange={e => update('firstName', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Nom</Label><Input value={form.lastName} onChange={e => update('lastName', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Téléphone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Date de naissance</Label><Input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Ville</Label><Input value={form.city} onChange={e => update('city', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Pays</Label><Input value={form.country} onChange={e => update('country', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select value={form.gender} onValueChange={v => update('gender', v)}>
                      <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Situation matrimoniale</Label>
                    <Select value={form.maritalStatus} onValueChange={v => update('maritalStatus', v)}>
                      <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Célibataire</SelectItem>
                        <SelectItem value="married">Marié(e)</SelectItem>
                        <SelectItem value="divorced">Divorcé(e)</SelectItem>
                        <SelectItem value="widowed">Veuf/Veuve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Profession</Label><Input value={form.occupation} onChange={e => update('occupation', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Nombre d'enfants</Label><Input type="number" min={0} value={form.numberOfChildren} onChange={e => update('numberOfChildren', parseInt(e.target.value) || 0)} /></div>
                </div>
                <div className="space-y-2"><Label>Adresse</Label><Input placeholder="Rue" value={form.street} onChange={e => update('street', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Quartier</Label><Input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Code postal</Label><Input value={form.postalCode} onChange={e => update('postalCode', e.target.value)} /></div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Préférences */}
          <TabsContent value="preferences">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2"><Settings className="w-5 h-5" /> Préférences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <Select value={prefs.language} onValueChange={v => setPrefs(p => ({ ...p, language: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Select value={prefs.currency} onValueChange={v => setPrefs(p => ({ ...p, currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="USD">Dollar (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications email</p>
                  <div className="space-y-2 pl-6">
                    {([['emailDonations', 'Confirmations de dons'], ['emailReminders', 'Rappels de paiement'], ['emailNewsletters', 'Newsletters']] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <Switch checked={prefs[key]} onCheckedChange={v => setPrefs(p => ({ ...p, [key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Notifications SMS</p>
                  <div className="space-y-2 pl-6">
                    {([['smsDonations', 'Confirmations de dons'], ['smsReminders', 'Rappels de paiement']] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <Switch checked={prefs[key]} onCheckedChange={v => setPrefs(p => ({ ...p, [key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSavePrefs} disabled={savingPrefs} className="w-full gap-2">
                  {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingPrefs ? 'Enregistrement...' : 'Enregistrer les préférences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vérification */}
          <TabsContent value="verification">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2"><Mail className="w-5 h-5" /> Vérification du compte</CardTitle>
                <CardDescription>Vérifiez votre email et téléphone pour sécuriser votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="space-y-3 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{user?.email}</span>
                    </div>
                    {emailVerified ? (
                      <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="w-4 h-4" /> Vérifié</span>
                    ) : (
                      <span className="text-sm text-orange-500">Non vérifié</span>
                    )}
                  </div>
                  {!emailVerified && (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={handleSendEmailCode} disabled={sendingEmailCode}>
                        {sendingEmailCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Envoyer le code
                      </Button>
                      <div className="flex gap-2">
                        <Input placeholder="Code à 6 chiffres" value={emailCode} onChange={e => setEmailCode(e.target.value)} maxLength={6} className="w-40" />
                        <Button size="sm" onClick={handleVerifyEmail} disabled={verifyingEmail || emailCode.length !== 6}>
                          {verifyingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vérifier'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Téléphone */}
                <div className="space-y-3 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{user?.telephone || 'Non renseigné'}</span>
                    </div>
                    {phoneVerified ? (
                      <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="w-4 h-4" /> Vérifié</span>
                    ) : (
                      <span className="text-sm text-orange-500">Non vérifié</span>
                    )}
                  </div>
                  {!phoneVerified && user?.telephone && (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={handleSendPhoneCode} disabled={sendingPhoneCode}>
                        {sendingPhoneCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Envoyer le code SMS
                      </Button>
                      <div className="flex gap-2">
                        <Input placeholder="Code à 6 chiffres" value={phoneCode} onChange={e => setPhoneCode(e.target.value)} maxLength={6} className="w-40" />
                        <Button size="sm" onClick={handleVerifyPhone} disabled={verifyingPhone || phoneCode.length !== 6}>
                          {verifyingPhone ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vérifier'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security">
            <Card className="border-border">
              <CardHeader><CardTitle className="font-display flex items-center gap-2"><Shield className="w-5 h-5" /> Sécurité</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full gap-2" onClick={() => setShowPasswordDialog(true)}>
                  <Lock className="w-4 h-4" /> Changer le mot de passe
                </Button>
                <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="w-4 h-4" /> Supprimer mon compte
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Données */}
          <TabsContent value="data">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display">Mes données personnelles</CardTitle>
                <CardDescription>Conformément au RGPD, vous pouvez télécharger toutes vos données.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2" onClick={handleDownloadData}>
                  <Download className="w-4 h-4" /> Télécharger mes données
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Password dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Changer le mot de passe</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Mot de passe actuel</Label>
                <div className="relative">
                  <Input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowCurrent(!showCurrent)}>
                    {showCurrent ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <div className="relative">
                  <Input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowNew(!showNew)}>
                    {showNew ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmer</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Annuler</Button>
              <Button onClick={handleChangePassword} disabled={changingPassword}>
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Supprimer mon compte</DialogTitle>
              <DialogDescription>Cette action est irréversible. Toutes vos données seront supprimées.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Mot de passe</Label><Input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} /></div>
              <div className="space-y-2"><Label>Tapez DELETE pour confirmer</Label><Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Annuler</Button>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
