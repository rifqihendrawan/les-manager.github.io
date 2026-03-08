import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { dashboardAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const COLORS = ['#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="stat-card" style={{ '--accent-color': color }}>
    <div className="stat-icon" style={{ background: color + '18' }}>{icon}</div>
    <div className="stat-body">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: '60vh' }}>
      <div className="spinner" /><span>Memuat dashboard...</span>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Halo, {user?.name}!</h1>
          <p className="page-sub">Berikut ringkasan pertemuan siswa les Anda</p>
        </div>
        <div className="header-date">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Siswa"
          value={stats.totalSiswa}
          color="#2563EB"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Total Pertemuan Selesai"
          value={stats.totalSelesai}
          sub={`dari ${stats.totalPertemuan} pertemuan`}
          color="#10B981"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>}
        />
        <StatCard
          label="Progress Keseluruhan"
          value={`${stats.overallPersen}%`}
          sub="dari semua siswa"
          color="#F59E0B"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
        />
        <StatCard
          label="Mata Pelajaran"
          value={stats.mataPelajaranStats.length}
          color="#8B5CF6"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
        />
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Bar chart: Pertemuan per siswa */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3>Progress Per Siswa</h3>
            <span className="badge badge-blue">Pertemuan Selesai</span>
          </div>
          {stats.progressData.length === 0 ? (
            <div className="empty-chart">Belum ada data siswa</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.progressData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F4" />
                <XAxis dataKey="namaSiswa" tick={{ fontSize: 12, fill: '#64748B', fontFamily: 'Plus Jakarta Sans' }} />
                <YAxis domain={[0, 8]} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13 }}
                  formatter={(val) => [`${val} / 8 pertemuan`, 'Selesai']}
                />
                <Bar dataKey="selesai" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {stats.progressData.map((entry, i) => (
                    <Cell key={i} fill={entry.selesai === 8 ? '#10B981' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart: By mata pelajaran */}
        <div className="card chart-card sm">
          <div className="chart-header">
            <h3>Per Mata Pelajaran</h3>
            <span className="badge badge-green">Distribusi</span>
          </div>
          {stats.mataPelajaranStats.length === 0 ? (
            <div className="empty-chart">Belum ada data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats.mataPelajaranStats} dataKey="selesai" nameKey="nama" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                    {stats.mataPelajaranStats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} selesai`, n]} contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {stats.mataPelajaranStats.map((mp, i) => (
                  <div key={i} className="pie-legend-item">
                    <div className="pie-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{mp.nama}</span>
                    <strong>{mp.persen}%</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Weekly completion chart */}
      <div className="card chart-card full">
        <div className="chart-header">
          <h3>Jumlah Siswa Selesai per Pertemuan</h3>
          <span className="badge badge-blue">Semua Siswa</span>
        </div>
        {stats.weeklyData.every(d => d.selesai === 0) ? (
          <div className="empty-chart">Belum ada pertemuan yang selesai</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F4" />
              <XAxis dataKey="pertemuan" tick={{ fontSize: 12, fill: '#64748B', fontFamily: 'Space Mono, monospace' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13 }} formatter={(v) => [`${v} siswa`, 'Selesai']} />
              <Bar dataKey="selesai" fill="#0EA5E9" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Progress list */}
      {stats.progressData.length > 0 && (
        <div className="card">
          <div className="chart-header" style={{ padding: '20px 24px 0' }}>
            <h3>Detail Progress Siswa</h3>
          </div>
          <div className="progress-list">
            {stats.progressData.map((s, i) => (
              <div key={i} className="progress-list-item">
                <div className="progress-list-left">
                  <div className="progress-avatar">{s.namaSiswa.charAt(0)}</div>
                  <div>
                    <div className="progress-name">{s.namaSiswa}</div>
                    <div className="progress-mapel">{s.mataPelajaran}</div>
                  </div>
                </div>
                <div className="progress-list-right">
                  <span className={`badge ${s.selesai === 8 ? 'badge-green' : s.selesai > 0 ? 'badge-blue' : 'badge-gray'}`}>
                    {s.selesai}/{s.total}
                  </span>
                  <div style={{ width: 140 }}>
                    <div className="progress-bar">
                      <div className={`progress-fill ${s.selesai === 8 ? 'complete' : ''}`} style={{ width: `${s.persen}%` }} />
                    </div>
                  </div>
                  <span className="progress-pct">{s.persen}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
