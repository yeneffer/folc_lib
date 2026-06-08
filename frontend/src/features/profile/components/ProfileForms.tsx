'use client';

import { useState } from 'react';
import { Alert, Button, Card, Field } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { ApiClientError } from '@/lib/apiClient';
import { profileService } from '../services/profileService';

export function ProfileForms() {
  const { user, setUser } = useAuth();

  const [nome, setNome] = useState(user?.nome ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [profileMsg, setProfileMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [secMsg, setSecMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [savingSec, setSavingSec] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const updated = await profileService.updateProfile({
        nome,
        avatarUrl: avatarUrl || undefined,
      });
      setUser(updated);
      setProfileMsg({ tone: 'success', text: 'Perfil atualizado.' });
    } catch (err) {
      setProfileMsg({
        tone: 'error',
        text: err instanceof ApiClientError ? err.message : 'Falha ao salvar.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const saveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !novaSenha) {
      setSecMsg({ tone: 'error', text: 'Informe um novo e-mail ou senha.' });
      return;
    }
    setSavingSec(true);
    setSecMsg(null);
    try {
      const updated = await profileService.updateSecurity({
        email: email || undefined,
        novaSenha: novaSenha || undefined,
      });
      setUser(updated);
      setNovaSenha('');
      setSecMsg({ tone: 'success', text: 'Dados de acesso atualizados.' });
    } catch (err) {
      setSecMsg({
        tone: 'error',
        text: err instanceof ApiClientError ? err.message : 'Falha ao salvar.',
      });
    } finally {
      setSavingSec(false);
    }
  };

  return (
    <div className="stack">
      <Card>
        <form onSubmit={saveProfile}>
          <h3 style={{ marginTop: 0 }}>Dados do perfil</h3>
          {profileMsg && <Alert tone={profileMsg.tone}>{profileMsg.text}</Alert>}
          <Field label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Field
            label="URL do avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
          <Button type="submit" loading={savingProfile}>
            Salvar perfil
          </Button>
        </form>
      </Card>

      <Card>
        <form onSubmit={saveSecurity}>
          <h3 style={{ marginTop: 0 }}>Segurança</h3>
          {secMsg && <Alert tone={secMsg.tone}>{secMsg.text}</Alert>}
          <Field
            label="Novo e-mail"
            type="email"
            placeholder={user?.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Nova senha (mín. 8 caracteres)"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <Button type="submit" loading={savingSec}>
            Atualizar acesso
          </Button>
        </form>
      </Card>
    </div>
  );
}
