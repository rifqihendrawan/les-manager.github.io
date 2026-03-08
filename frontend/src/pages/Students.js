import React, { useEffect, useState, useCallback } from 'react';
import { studentAPI } from '../hooks/useAPI';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import './Students.css';

const Toast = ({ msg, type, onHide }) => {
  useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t); }, [onHide]);
  return <div className={`toast toast-${type}`}>{type === 'success' ? '✓' : '✕'} {msg}</div>;
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
      <div className="modal-body" style={{ padding: 28 }}>
        <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>🗑️</div>
        <p style={{ textAlign: 'center', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{message}</p>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Tindakan ini tidak bisa dibatalkan.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Batal</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  </div>
);

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({ namaSiswa: '', mataPelajaran: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMapel, setFilterMapel] = useState('all');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await studentAPI.getAll();
      setStudents(res.data.data);
    } catch (err) {
      showToast('Gagal memuat data siswa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  const openAdd = () => {
    setEditStudent(null);
    setForm({ namaSiswa: '', mataPelajaran: '' });
    setShowForm(true);
  };

  const openEdit = (student) => {
    setEditStudent(student);
    setForm({ namaSiswa: student.namaSiswa, mataPelajaran: student.mataPelajaran });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.namaSiswa.trim() || !form.mataPelajaran.trim()) return;
    setSaving(true);
    try {
      if (editStudent) {
        const res = await studentAPI.update(editStudent._id, form);
        setStudents(prev => prev.map(s => s._id === editStudent._id ? res.data.data : s));
        showToast('Data siswa berhasil diperbarui');
      } else {
        const res = await studentAPI.create(form);
        setStudents(prev => [res.data.data, ...prev]);
        showToast('Siswa berhasil ditambahkan');
      }
      setShowForm(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await studentAPI.delete(deleteTarget._id);
      setStudents(prev => prev.filter(s => s._id !== deleteTarget._id));
      showToast('Siswa berhasil dihapus');
    } catch {
      showToast('Gagal menghapus siswa', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (studentId, nomor) => {
    try {
      const res = await studentAPI.togglePertemuan(studentId, nomor);
      setStudents(prev => prev.map(s => s._id === studentId ? res.data.data : s));
    } catch {
      showToast('Gagal memperbarui pertemuan', 'error');
    }
  };

  const allMapels = [...new Set(students.map(s => s.mataPelajaran))];

  const filtered = students.filter(s => {
    const matchSearch = s.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.mataPelajaran.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMapel = filterMapel === 'all' || s.mataPelajaran === filterMapel;
    return matchSearch && matchMapel;
  });

  const totalSelesai = students.reduce((sum, s) => sum + s.pertemuan.filter(p => p.selesai).length, 0);
  const totalAll = students.length * 8;

  return (
    <div className="students-page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Daftar Siswa Les</h1>
          <p className="page-sub">Kelola data dan pertemuan siswa Anda</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Siswa
        </button>
      </div>

      {/* Summary bar */}
      {students.length > 0 && (
        <div className="card summary-bar">
          <div className="summary-stat">
            <div className="summary-val">{students.length}</div>
            <div className="summary-lbl">Total Siswa</div>
          </div>
          <div className="summary-divider" />
          <div className="summary-stat">
            <div className="summary-val" style={{ color: 'var(--success)' }}>{totalSelesai}</div>
            <div className="summary-lbl">Pertemuan Selesai</div>
          </div>
          <div className="summary-divider" />
          <div className="summary-stat">
            <div className="summary-val">{totalAll}</div>
            <div className="summary-lbl">Total Pertemuan</div>
          </div>
          <div className="summary-progress">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Progress Keseluruhan</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{totalAll > 0 ? Math.round((totalSelesai / totalAll) * 100) : 0}%</span>
            </div>
            <div className="progress-bar">
              <div className={`progress-fill ${totalSelesai === totalAll && totalAll > 0 ? 'complete' : ''}`}
                style={{ width: `${totalAll > 0 ? (totalSelesai / totalAll) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-row">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="input" style={{ paddingLeft: 40 }} placeholder="Cari nama siswa atau mapel..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="input" style={{ width: 'auto', minWidth: 180 }} value={filterMapel} onChange={e => setFilterMapel(e.target.value)}>
          <option value="all">Semua Mata Pelajaran</option>
          {allMapels.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Students table */}
      {loading ? (
        <div className="loading-screen" style={{ minHeight: '40vh' }}>
          <div className="spinner" /><span>Memuat data...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📚</div>
          <h3>{students.length === 0 ? 'Belum ada siswa' : 'Tidak ada hasil'}</h3>
          <p>{students.length === 0 ? 'Klik tombol "Tambah Siswa" untuk menambahkan siswa pertama Anda.' : 'Coba ubah kata kunci pencarian atau filter.'}</p>
          {students.length === 0 && <button className="btn btn-primary" onClick={openAdd}>Tambah Siswa Pertama</button>}
        </div>
      ) : (
        <div className="students-list">
          {filtered.map(student => {
            const selesai = student.pertemuan.filter(p => p.selesai).length;
            const persen = Math.round((selesai / 8) * 100);
            const isExpanded = expandedId === student._id;

            return (
              <div key={student._id} className={`student-card card ${isExpanded ? 'expanded' : ''}`}>
                <div className="student-row" onClick={() => setExpandedId(isExpanded ? null : student._id)}>
                  <div className="student-left">
                    <div className="student-avatar">{student.namaSiswa.charAt(0)}</div>
                    <div>
                      <div className="student-name">{student.namaSiswa}</div>
                      <div className="student-mapel">{student.mataPelajaran}</div>
                    </div>
                  </div>

                  <div className="student-center">
                    <div className="pertemuan-dots">
                      {student.pertemuan.map((p, i) => (
                        <div
                          key={i}
                          className={`pertemuan-dot ${p.selesai ? 'done' : ''}`}
                          title={p.selesai && p.tanggal ? `P${p.nomor}: ${format(new Date(p.tanggal), 'dd MMM yyyy', { locale: id })}` : `P${p.nomor}: Belum selesai`}
                          onClick={e => { e.stopPropagation(); handleToggle(student._id, p.nomor); }}
                        >
                          {p.selesai ? '✓' : p.nomor}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="student-right">
                    <div style={{ textAlign: 'right', marginBottom: 4 }}>
                      <span className={`badge ${selesai === 8 ? 'badge-green' : selesai > 0 ? 'badge-blue' : 'badge-gray'}`}>
                        {selesai}/{8} Selesai
                      </span>
                    </div>
                    <div style={{ width: 120 }}>
                      <div className="progress-bar">
                        <div className={`progress-fill ${selesai === 8 ? 'complete' : ''}`} style={{ width: `${persen}%` }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: 3, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{persen}%</div>
                  </div>

                  <div className="student-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-icon btn-secondary" title="Edit" onClick={() => openEdit(student)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="btn btn-icon btn-danger" title="Hapus" onClick={() => setDeleteTarget(student)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/></svg>
                    </button>
                    <button className={`btn btn-icon btn-secondary expand-btn ${isExpanded ? 'rotated' : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9"/></svg>
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="student-detail">
                    <div className="detail-grid">
                      {student.pertemuan.map((p) => (
                        <div key={p.nomor} className={`detail-item ${p.selesai ? 'done' : ''}`}>
                          <div className="detail-header">
                            <div className="detail-num">Pertemuan {p.nomor}</div>
                            <input
                              type="checkbox"
                              checked={p.selesai}
                              onChange={() => handleToggle(student._id, p.nomor)}
                              className="detail-check"
                              title={p.selesai ? 'Tandai belum selesai' : 'Tandai selesai'}
                            />
                          </div>
                          {p.selesai && p.tanggal && (
                            <div className="detail-date">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                              {format(new Date(p.tanggal), 'dd MMM yyyy', { locale: id })}
                            </div>
                          )}
                          {!p.selesai && <div className="detail-date pending">Belum selesai</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nama Siswa</label>
                <input className="input" placeholder="Masukkan nama siswa" value={form.namaSiswa} onChange={e => setForm(f => ({ ...f, namaSiswa: e.target.value }))} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Mata Pelajaran</label>
                <input className="input" placeholder="Contoh: Matematika, Fisika..." value={form.mataPelajaran} onChange={e => setForm(f => ({ ...f, mataPelajaran: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSave()} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Batal</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving || !form.namaSiswa.trim() || !form.mataPelajaran.trim()}>
                  {saving ? 'Menyimpan...' : editStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteTarget && (
        <ConfirmModal
          message={`Hapus data siswa "${deleteTarget.namaSiswa}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onHide={() => setToast(null)} />}
    </div>
  );
}
