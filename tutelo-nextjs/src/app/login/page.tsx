'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './login.module.scss';

export default function LoginPage() {
  const { login, register, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setIsRegister((v) => !v);
    setError(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        await register(email, password, fullName || undefined);
        setIsRegister(false);
        setPassword('');
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err?.message || "Errore durante l'autenticazione");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <svg width="48" height="48" viewBox="0 0 72 72" fill="none">
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3A82D4" />
                <stop offset="100%" stopColor="#5BAAFF" />
              </linearGradient>
            </defs>
            <circle cx="17" cy="18" r="11" fill="url(#lg1)" />
            <circle cx="55" cy="18" r="11" fill="url(#lg1)" />
            <circle cx="17" cy="18" r="6" fill="white" opacity="0.15" />
            <circle cx="55" cy="18" r="6" fill="white" opacity="0.15" />
            <ellipse cx="36" cy="44" rx="28" ry="26" fill="url(#lg1)" />
            <circle cx="26" cy="40" r="5" fill="white" opacity="0.95" />
            <circle cx="46" cy="40" r="5" fill="white" opacity="0.95" />
            <circle cx="26" cy="40" r="2.5" fill="#1A3A6B" />
            <circle cx="46" cy="40" r="2.5" fill="#1A3A6B" />
            <circle cx="27.5" cy="38.5" r="1" fill="white" opacity="0.8" />
            <circle cx="47.5" cy="38.5" r="1" fill="white" opacity="0.8" />
            <ellipse cx="36" cy="51" rx="5.5" ry="4" fill="white" opacity="0.6" />
          </svg>
          <div className={styles.loginBrand}>
            tutelo<span className={styles.ai}>.ai</span>
          </div>
        </div>

        <h1 className={styles.loginTitle}>
          {isRegister ? 'Crea un account' : 'Accedi al tuo account'}
        </h1>
        <p className={styles.loginSubtitle}>
          {isRegister
            ? 'Inserisci i tuoi dati per registrarti'
            : 'Inserisci le tue credenziali per continuare'}
        </p>

        {error && <div className={styles.loginError}>{error}</div>}

        <form onSubmit={onSubmit} className={styles.loginForm}>
          {isRegister && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nome completo</label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="es. Marco Pellegrini"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              className={styles.formInput}
              type="email"
              placeholder="email@esempio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
              className={styles.formInput}
              type="password"
              placeholder="La tua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className={styles.loginBtn} type="submit" disabled={loading}>
            {loading ? 'Caricamento...' : isRegister ? 'Registrati' : 'Accedi'}
          </button>
        </form>

        <div className={styles.loginSwitch}>
          {isRegister ? (
            <>
              Hai già un account?{' '}
              <button className={styles.linkBtn} onClick={toggleMode}>
                Accedi
              </button>
            </>
          ) : (
            <>
              Non hai un account?{' '}
              <button className={styles.linkBtn} onClick={toggleMode}>
                Registrati
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
