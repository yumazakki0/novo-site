import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { client } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Login() {
  const { checkUserAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Email é obrigatório');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const isGM = normalizedEmail === 'yumazakki0@gmail.com';

      // Simple local authentication - store user in localStorage
      const user = {
        email: normalizedEmail,
        full_name: normalizedEmail.split('@')[0],
        role: isGM ? 'admin' : 'player',
      };

      await client.auth.login(user);
      await checkUserAuth();
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setError(null);
      setLoading(true);

      const defaultUser = {
        email: 'player@example.com',
        full_name: 'Visitante',
        role: 'player',
      };

      await client.auth.login(defaultUser);
      await checkUserAuth();
    } catch (err) {
      setError(err.message || 'Erro ao fazer login como visitante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0f0a 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Atmospheric effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(196,169,90,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 fade-in-up">
          <div className="text-5xl mb-4" style={{ color: 'var(--gold)' }}>
            ◈
          </div>
          <h1
            className="font-grimoire text-3xl mb-2"
            style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
          >
            CENCURSA
          </h1>
          <p
            className="font-terminal text-xs tracking-widest opacity-50"
            style={{ color: 'var(--cold-white)' }}
          >
            WHEN THE BELLS TOLL
          </p>
        </div>

        {/* Login Card */}
        <Card
          className="p-6 fade-in-up-delay-1"
          style={{
            background: 'rgba(10,10,10,0.8)',
            border: '1px solid rgba(196,169,90,0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="mb-6">
            <label
              className="block text-xs font-terminal tracking-widest mb-2"
              style={{ color: 'var(--gold-dark)' }}
            >
              EMAIL
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="font-terminal text-sm"
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(196,169,90,0.15)',
                color: 'var(--cold-white)',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3 rounded-sm text-xs font-terminal"
              style={{
                background: 'rgba(204,0,0,0.1)',
                border: '1px solid rgba(204,0,0,0.3)',
                color: 'var(--alert)',
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Login Button */}
          <Button
            onClick={handleLocalLogin}
            disabled={loading || !email.trim()}
            className="w-full mb-3 font-terminal tracking-widest"
            style={{
              background:
                'linear-gradient(135deg, rgba(196,169,90,0.3) 0%, rgba(196,169,90,0.1) 100%)',
              border: '1px solid rgba(196,169,90,0.3)',
              color: 'var(--gold)',
            }}
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR'}
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div
              className="absolute inset-0 flex items-center"
              style={{ borderTop: '1px solid rgba(196,169,90,0.1)' }}
            />
            <div className="relative flex justify-center text-xs">
              <span
                className="px-2 font-terminal opacity-50"
                style={{ background: 'rgba(10,10,10,0.8)', color: 'var(--cold-white)' }}
              >
                OU
              </span>
            </div>
          </div>

          {/* Guest Login */}
          <Button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full font-terminal tracking-widest text-xs"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(196,169,90,0.15)',
              color: 'rgba(196,169,90,0.6)',
            }}
          >
            VISITANTE
          </Button>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)' }}>
          <p>Sistema de autenticação local</p>
          <p className="mt-1">Nenhuma senha é armazenada</p>
        </div>
      </div>
    </div>
  );
}
