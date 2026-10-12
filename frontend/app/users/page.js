'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, getStoredUser } from '../../lib/api';

const departments = ['backend', 'frontend', 'unity', 'sqa', 'ld'];
const positions = ['lead', 'senior', 'staff'];
const blankForm = { name: '', email: '', password: '', position: 'staff', department: 'backend' };

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await apiFetch('/users'));
      setError('');
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    load();
  }, [load]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function beginEdit(user) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: '', position: user.position, department: user.department || 'backend' });
    setError('');
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
    const payload = { ...form };
    if (editingId && !payload.password) delete payload.password;
    try {
      if (editingId) {
        await apiFetch(`/users/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
        setNotice('User berhasil diperbarui.');
      } else {
        await apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) });
        setNotice('User berhasil dibuat.');
      }
      resetForm();
      await load();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(user) {
    if (!window.confirm(`Hapus user ${user.name} (${user.email})?`)) return;
    setError('');
    setNotice('');
    try {
      await apiFetch(`/users/${user.id}`, { method: 'DELETE' });
      setNotice('User berhasil dihapus.');
      await load();
    } catch (reason) {
      setError(reason.message);
    }
  }

  const isLead = currentUser?.position === 'lead';

  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">ADMINISTRATION / PEOPLE</p><h1>Users</h1><p className="muted">Kelola user, posisi, dan department.</p></div>
        <span className="record-count">{items.length} users</span>
      </section>
      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}
      {!isLead && <div className="alert alert-info">Akun dengan posisi <strong>lead</strong> diperlukan untuk membuat, mengubah, atau menghapus user. Kamu masih dapat melihat daftar.</div>}

      {isLead && <section className="panel form-panel">
        <div className="panel-heading"><div><p className="eyebrow">{editingId ? 'EDIT USER' : 'NEW USER'}</p><h2>{editingId ? 'Perbarui user' : 'Tambah user'}</h2></div>{editingId && <button className="button button-quiet" type="button" onClick={resetForm}>Batal edit</button>}</div>
        <form className="form-grid user-form-grid" onSubmit={submit}>
          <label>Nama<input name="name" value={form.name} onChange={updateField} required minLength={2} maxLength={120} /></label>
          <label>Email<input type="email" name="email" value={form.email} onChange={updateField} required maxLength={255} /></label>
          <label>Password<input type="password" name="password" value={form.password} onChange={updateField} required={!editingId} minLength={10} autoComplete="new-password" placeholder={editingId ? 'Kosongkan jika tidak diganti' : 'Min. 10 karakter'} /></label>
          <label>Position<select name="position" value={form.position} onChange={updateField}>{positions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Department<select name="department" value={form.department} onChange={updateField}>{departments.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <div className="form-actions"><button className="button button-primary" disabled={saving}>{saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Buat user'}</button></div>
        </form>
      </section>}

      <section className="panel table-panel">
        <div className="panel-heading"><div><p className="eyebrow">DIRECTORY</p><h2>Daftar users</h2></div></div>
        {loading ? <p className="muted">Memuat user…</p> : items.length === 0 ? <p className="muted">Belum ada data user.</p> : <div className="table-scroll"><table>
          <thead><tr><th>User</th><th>Position</th><th>Department</th><th>Terdaftar</th>{isLead && <th className="align-right">Aksi</th>}</tr></thead>
          <tbody>{items.map((user) => <tr key={user.id}>
            <td><div className="user-identity"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div></td>
            <td><span className={`position-pill position-${user.position}`}>{user.position}</span></td>
            <td><span className="department-tag">{user.department || '—'}</span></td>
            <td>{new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
            {isLead && <td><div className="table-actions"><button className="button button-quiet button-small" onClick={() => beginEdit(user)}>Edit</button><button className="button button-danger button-small" onClick={() => remove(user)}>Hapus</button></div></td>}
          </tr>)}</tbody>
        </table></div>}
      </section>
    </>
  );
}
