'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

const blankForm = {
  cve: '', title: '', context: '', decision: '', consequences: '', alternatives: '', historyDescription: ''
};

function statusClass(status) {
  return `status-pill status-${status}`;
}

export default function DecisionsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await apiFetch('/decisions'));
      setError('');
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function beginEdit(item) {
    setEditingId(item.id);
    setForm({
      cve: item.cve,
      title: item.title,
      context: item.context,
      decision: item.decision,
      consequences: item.consequences,
      alternatives: item.alternatives,
      historyDescription: item.historyDescription || ''
    });
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(blankForm);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editingId) {
        await apiFetch(`/decisions/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
        setNotice('ADR berhasil diperbarui.');
      } else {
        await apiFetch('/decisions', { method: 'POST', body: JSON.stringify(form) });
        setNotice('ADR berhasil dibuat dengan status pengajuan.');
      }
      resetForm();
      await load();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id, status) {
    setError('');
    setNotice('');
    try {
      await apiFetch(`/decisions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setNotice(`Status ADR berhasil diubah menjadi ${status}.`);
      await load();
    } catch (reason) {
      await load();
      setError(reason.message);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Hapus ADR ${item.cve} — ${item.title}?`)) return;
    setError('');
    setNotice('');
    try {
      await apiFetch(`/decisions/${item.id}`, { method: 'DELETE' });
      setNotice('ADR berhasil dihapus.');
      if (editingId === item.id) resetForm();
      await load();
    } catch (reason) {
      setError(reason.message);
    }
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE / RECORDS</p>
          <h1>Architecture Decision Records</h1>
          <p className="muted">Buat dan kelola ADR. Saat dibuat, status selalu dimulai dari pengajuan.</p>
        </div>
        <span className="record-count">{items.length} records</span>
      </section>
      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <section className="panel form-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">{editingId ? 'EDIT RECORD' : 'NEW RECORD'}</p><h2>{editingId ? 'Perbarui ADR' : 'Buat ADR baru'}</h2></div>
          {editingId && <button type="button" className="button button-quiet" onClick={resetForm}>Batal edit</button>}
        </div>
        <form className="form-grid" onSubmit={submit}>
          <label>Kode ADR / CVE<input name="cve" value={form.cve} onChange={updateField} placeholder="ADR-2026-006" required maxLength={80} /></label>
          <label className="field-span-2">Judul keputusan<input name="title" value={form.title} onChange={updateField} placeholder="Contoh: Gunakan Redis untuk cache" required maxLength={240} /></label>
          <label className="field-span-3">Konteks<textarea name="context" value={form.context} onChange={updateField} required rows={3} placeholder="Masalah, konteks teknis, dan faktor yang memengaruhi keputusan…" /></label>
          <label className="field-span-3">Keputusan<textarea name="decision" value={form.decision} onChange={updateField} required rows={3} placeholder="Keputusan arsitektur yang dipilih…" /></label>
          <label className="field-span-3">Konsekuensi<textarea name="consequences" value={form.consequences} onChange={updateField} required rows={2} placeholder="Dampak positif, trade-off, dan konsekuensi…" /></label>
          <label className="field-span-3">Alternatif yang dipertimbangkan<textarea name="alternatives" value={form.alternatives} onChange={updateField} required rows={2} placeholder="Alternatif yang ditimbang dan alasan pemilihannya…" /></label>
          <label className="field-span-3">History / catatan<textarea name="historyDescription" value={form.historyDescription} onChange={updateField} required rows={2} placeholder="Catatan review atau ringkasan riwayat ADR…" /></label>
          <div className="form-actions field-span-3">
            <span className="muted small-copy">Semua field wajib diisi. Status awal otomatis <strong>pengajuan</strong>.</span>
            <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Buat ADR'}</button>
          </div>
        </form>
      </section>

      <section className="panel table-panel">
        <div className="panel-heading"><div><p className="eyebrow">YOUR ADRs</p><h2>Daftar ADR</h2></div></div>
        {loading ? <p className="muted">Memuat ADR…</p> : items.length === 0 ? <div className="empty-state"><h3>Belum ada ADR</h3><p className="muted">Isi form di atas untuk membuat keputusan arsitektur pertama.</p></div> : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Kode / Judul</th><th>Status</th><th>Diubah oleh</th><th>Terakhir diperbarui</th><th className="align-right">Aksi</th></tr></thead>
              <tbody>{items.map((item) => (
                <tr key={item.id}>
                  <td className="decision-title-cell"><strong>{item.cve}</strong><span>{item.title}</span><small>{item.context.slice(0, 100)}{item.context.length > 100 ? '…' : ''}</small></td>
                  <td><span className={statusClass(item.status)}>{item.status}</span><select aria-label={`Ubah status ${item.cve}`} className="status-select" value={item.status} onChange={(event) => changeStatus(item.id, event.target.value)}>
                    {item.status === 'pengajuan' && <option value="pengajuan" disabled>pengajuan</option>}
                    <option value="research">research</option><option value="completed">completed</option>
                  </select></td>
                  <td>{item.statusUpdatedByName || '—'}</td>
                  <td>{new Date(item.updatedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td><div className="table-actions"><button className="button button-quiet button-small" onClick={() => beginEdit(item)}>Edit</button><button className="button button-danger button-small" onClick={() => remove(item)}>Hapus</button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
