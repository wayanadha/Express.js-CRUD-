"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaForm from "@/components/MahasiswaForm";
import MahasiswaTable from "@/components/MahasiswaTable";
import {
  createMahasiswa,
  deleteMahasiswa,
  getMahasiswa,
  Mahasiswa,
  MahasiswaInput,
  updateMahasiswa,
} from "@/lib/api";

export default function MahasiswaPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State pencarian (Tugas 3)

  const loadMahasiswa = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMahasiswa();
      setMahasiswa(data);
    } catch (err) {
      // Penanganan pesan error ketika API Backend tidak aktif / gagal (Tugas 4)
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data dari server backend. Pastikan server backend Anda sudah berjalan di http://localhost:3000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMahasiswa();
  }, []);

  const handleSubmit = async (payload: MahasiswaInput) => {
    try {
      setMessage("");
      setError("");
      if (selectedMahasiswa) {
        await updateMahasiswa(selectedMahasiswa.id, payload);
        setMessage("Data mahasiswa berhasil diperbarui");
      } else {
        await createMahasiswa(payload);
        setMessage("Data mahasiswa berhasil ditambahkan");
      }
      setSelectedMahasiswa(null);
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Yakin ingin menghapus data ini?");
    if (!confirmed) return;
    try {
      setMessage("");
      setError("");
      await deleteMahasiswa(id);
      setMessage("Data mahasiswa berhasil dihapus");
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data");
    }
  };

  // Filter mahasiswa berdasarkan nama (Tugas 3)
  const filteredMahasiswa = mahasiswa.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="container">
      <div className="header">
        <div>
          <h1 style={{ marginBottom: "4px" }}>Dashboard Data Mahasiswa</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Kelola data profil, program studi, dan angkatan mahasiswa secara real-time.
            </p>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              backgroundColor: error ? "var(--danger-light)" : (loading ? "rgba(245, 158, 11, 0.12)" : "var(--success-light)"),
              color: error ? "var(--danger)" : (loading ? "#d97706" : "var(--success)"),
              fontSize: "0.75rem",
              fontWeight: 700,
              border: "1px solid " + (error ? "rgba(225, 29, 72, 0.15)" : (loading ? "rgba(245, 158, 11, 0.15)" : "rgba(13, 148, 136, 0.15)")),
            }}>
              <span className={`status-dot ${loading ? "pulse" : ""}`} style={{ 
                display: "inline-block", 
                width: "6px", 
                height: "6px", 
                borderRadius: "50%", 
                backgroundColor: error ? "var(--danger)" : (loading ? "#d97706" : "var(--success)"),
              }}></span>
              {error ? "API Terputus" : (loading ? "Menghubungkan" : "API Aktif")}
            </span>
          </div>
        </div>
        <Link href="/">
          <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span>&larr;</span> Kembali
          </button>
        </Link>
      </div>

      {message && <div className="message">{message}</div>}
      {error && (
        <div className="message error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button 
            type="button" 
            onClick={loadMahasiswa} 
            className="btn-danger" 
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      <MahasiswaForm
        selectedMahasiswa={selectedMahasiswa}
        onSubmit={handleSubmit}
        onCancelEdit={() => setSelectedMahasiswa(null)}
      />

      <section className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Daftar Mahasiswa</h2>
          {/* Input Pencarian (Tugas 3) */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label htmlFor="search" style={{ margin: 0, fontWeight: 'bold' }}>Cari Nama:</label>
            <input
              id="search"
              type="text"
              placeholder="Masukkan nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>
        </div>

        {/* Tampilan Loading (Tugas 4) */}
        {loading ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#6b7280' }}>
            <div className="spinner" style={{ margin: '0 auto 10px', width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p>Memuat data mahasiswa...</p>
          </div>
        ) : (
          <MahasiswaTable
            mahasiswa={filteredMahasiswa}
            onEdit={setSelectedMahasiswa}
            onDelete={handleDelete}
          />
        )}
      </section>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
      `}</style>
    </main>
  );
}
