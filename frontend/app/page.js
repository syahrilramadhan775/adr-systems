'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

const initialSummary = { completed: 0, pengajuan: 0, research: 0, total: 0 };

export default function DashboardPage() {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/dashboard/summary')
      .then(setSummary)
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { key: 'completed', label: 'Completed', color: 'status-completed', hint: 'ADR yang selesai' },
    { key: 'pengajuan', label: 'Pengajuan', color: 'status-pengajuan', hint: 'Menunggu proses/review' },
    { key: 'research', label: 'Research', color: 'status-research', hint: 'Sedang diteliti' }
  ];

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE / OVERVIEW</p>
          <h1>Dashboard ADR</h1>
          <p className="muted">Ringkasan Architecture Decision Record yang kamu buat.</p>
        </div>
        <Link className="button button-primary" href="/decisions">+ Buat ADR</Link>
      </section>
      {error && <div className="alert alert-error">{error}</div>}
      <section className="stats-grid" aria-label="Ringkasan status ADR">
        {cards.map((card) => (
          <article className="stat-card" key={card.key}>
            <div className={`status-dot ${card.color}`} />
            <p className="stat-label">{card.label}</p>
            <p className="stat-number">{loading ? '—' : summary[card.key]}</p>
            <p className="stat-hint">{card.hint}</p>
          </article>
        ))}
      </section>
      <section className="panel dashboard-bottom">
        <div>
          <p className="eyebrow">TOTAL RECORDS</p>
          <h2>{loading ? '—' : summary.total} ADR</h2>
          <p className="muted">Jumlah seluruh keputusan arsitektur milik akun yang sedang login.</p>
        </div>
        <Link className="text-link" href="/decisions">Kelola semua ADR <span aria-hidden="true">→</span></Link>
      </section>
    </>
  );
}
