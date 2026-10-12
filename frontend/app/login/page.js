'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getToken, saveSession } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('lead@adr.local');
  const [password, setPassword] = useState('Password123!');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getToken()) router.replace('/');
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const session = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      saveSession(session);
      window.dispatchEvent(new Event('adr-session-changed'));
      router.replace('/');
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="login-layout">
      <div className="login-intro">
        <p className="eyebrow">ARCHITECTURE GOVERNANCE</p>
        <h1>Dokumentasikan keputusan. Jaga konteksnya.</h1>
        <p className="muted">Simpan rationale, alternatif, konsekuensi, dan status keputusan arsitektur di satu tempat.</p>
        <div className="login-feature"><span>01</span><div><strong>Terstruktur</strong><p>Setiap ADR memiliki konteks dan keputusan yang jelas.</p></div></div>
        <div className="login-feature"><span>02</span><div><strong>Terlacak</strong><p>Status tersimpan bersama identitas pembuat/perubahnya.</p></div></div>
      </div>
      <form className="panel login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">WELCOME BACK</p>
        <h2>Masuk ke ADR System</h2>
        <p className="muted small-copy">Gunakan akun yang sudah terdaftar.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <button className="button button-primary button-full" type="submit" disabled={submitting}>{submitting ? 'Memproses…' : 'Login'}</button>
        <p className="demo-note">Demo awal: <code>lead@adr.local</code> / <code>Password123!</code></p>
      </form>
    </section>
  );
}
