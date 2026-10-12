'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStoredUser, getToken, logout } from '../../lib/api';

export default function Header() {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setAuthenticated(Boolean(getToken()));
    const refresh = () => {
      setUser(getStoredUser());
      setAuthenticated(Boolean(getToken()));
    };
    window.addEventListener('storage', refresh);
    window.addEventListener('adr-session-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('adr-session-changed', refresh);
    };
  }, []);

  return (
    <header className="topbar">
      <Link className="brand" href="/">ADR<span>System</span></Link>
      <nav className="nav-links" aria-label="Navigasi utama">
        {authenticated ? <>
          <Link href="/">Dashboard</Link>
          <Link href="/decisions">ADR</Link>
          <Link href="/users">Users</Link>
          <span className="nav-user">{user?.name || 'User'}{user?.position ? ` · ${user.position}` : ''}</span>
          <button className="button button-quiet button-small" onClick={logout}>Keluar</button>
        </> : <Link href="/login">Login</Link>}
      </nav>
    </header>
  );
}
