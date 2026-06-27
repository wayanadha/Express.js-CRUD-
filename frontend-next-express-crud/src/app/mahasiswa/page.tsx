"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaForm from "@/components/MahasiswaForm";
import MahasiswaTable from "@/components/MahasiswaTable";
import { getUser, logout } from "@/lib/auth";
import {
  createMahasiswa,
  deleteMahasiswa,
  getMahasiswa,
  getProdi,
  updateMahasiswa,
  Mahasiswa,
  Prodi,
} from "@/lib/api";

export default function MahasiswaPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Search, Filter, Pagination States
  const [search, setSearch] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

  const loadInitialData = async () => {
    try {
      const prodis = await getProdi();
      setProdiList(prodis);
    } catch (err) {
      console.error("Gagal memuat prodi:", err);
    }
  };

  const loadMahasiswa = async (currentPage = page, searchVal = search, prodiVal = prodiId) => {
    try {
      setLoading(true);
      setError("");
      const result = await getMahasiswa({
        search: searchVal,
        prodi_id: prodiVal,
        page: currentPage,
        limit,
      });
      setMahasiswa(result.data);
      setTotalPage(result.meta?.totalPage || 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data dari server backend. Pastikan server backend Anda sudah berjalan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setCurrentUser(user);
    loadInitialData();
    loadMahasiswa(1, "", "");
  }, []);

  const handleSubmit = async (formData: FormData) => {
    try {
      setMessage("");
      setError("");
      if (selectedMahasiswa) {
        await updateMahasiswa(selectedMahasiswa.id, formData);
        setMessage("Data mahasiswa berhasil diperbarui");
      } else {
        await createMahasiswa(formData);
        setMessage("Data mahasiswa berhasil ditambahkan");
      }
      setSelectedMahasiswa(null);
      await loadMahasiswa(page);
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
      
      // If we are on page > 1 and deleted the last item of that page, go back a page
      const newPage = mahasiswa.length === 1 && page > 1 ? page - 1 : page;
      setPage(newPage);
      await loadMahasiswa(newPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMahasiswa(1, search, prodiId);
  };

  const handleProdiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setProdiId(val);
    setPage(1);
    loadMahasiswa(1, search, val);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadMahasiswa(newPage, search, prodiId);
  };

  const canCreateOrEdit = currentUser?.role === "admin" || currentUser?.role === "operator";

  return (
    <main className="container">
      {/* HEADER SECTION */}
      <div className="header">
        <div>
          <h1 style={{ marginBottom: "4px" }}>Dashboard Data Mahasiswa</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Masuk sebagai: <strong>{currentUser?.name}</strong> (
              <span style={{ textTransform: "capitalize", fontWeight: "bold" }}>
                {currentUser?.role}
              </span>
              )
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                backgroundColor: error
                  ? "var(--danger-light)"
                  : loading
                  ? "rgba(245, 158, 11, 0.12)"
                  : "var(--success-light)",
                color: error ? "var(--danger)" : loading ? "#d97706" : "var(--success)",
                fontSize: "0.75rem",
                fontWeight: 700,
                border:
                  "1px solid " +
                  (error
                    ? "rgba(225, 29, 72, 0.15)"
                    : loading
                    ? "rgba(245, 158, 11, 0.15)"
                    : "rgba(13, 148, 136, 0.15)"),
              }}
            >
              <span
                className={`status-dot ${loading ? "pulse" : ""}`}
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: error ? "var(--danger)" : loading ? "#d97706" : "var(--success)",
                }}
              ></span>
              {error ? "API Terputus" : loading ? "Memuat..." : "API Aktif"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {currentUser?.role === "admin" && (
            <Link href="/users">
              <button className="btn-secondary" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)", borderColor: "transparent" }}>
                Kelola User
              </button>
            </Link>
          )}
          <button className="btn-secondary" onClick={logout}>
            Keluar
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}
      {error && (
        <div className="message error" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadMahasiswa(page)}
            className="btn-danger"
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* FORM INPUT (Only visible for admin or operator) */}
      {canCreateOrEdit ? (
        <MahasiswaForm
          selectedMahasiswa={selectedMahasiswa}
          prodiList={prodiList}
          onSubmit={handleSubmit}
          onCancelEdit={() => setSelectedMahasiswa(null)}
        />
      ) : (
        <div className="card" style={{ padding: "20px 32px" }}>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontWeight: 500 }}>
            Mode Viewer Aktif: Anda hanya memiliki izin untuk melihat daftar mahasiswa.
          </p>
        </div>
      )}

      {/* SEARCH, FILTER, AND TABLE SECTION */}
      <section className="card" style={{ marginTop: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: 0 }}>Daftar Mahasiswa</h2>

          {/* Form Pencarian & Penyaringan Server-Side */}
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}
          >
            <input
              type="text"
              placeholder="Cari NIM atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
            />
            
            <select
              value={prodiId}
              onChange={handleProdiChange}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "var(--bg-app)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Semua Program Studi</option>
              {prodiList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_prodi}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-secondary" style={{ padding: "8px 16px" }}>
              Cari
            </button>
          </form>
        </div>

        {/* TABLE LOADING & CONTENT */}
        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#6b7280" }}>
            <div
              className="spinner"
              style={{
                margin: "0 auto 10px",
                width: "30px",
                height: "30px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid var(--primary)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p>Memuat data mahasiswa...</p>
          </div>
        ) : (
          <>
            <MahasiswaTable
              mahasiswa={mahasiswa}
              role={currentUser?.role}
              onEdit={setSelectedMahasiswa}
              onDelete={handleDelete}
            />

            {/* CONTROLLER PAGINATION */}
            {totalPage > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  className="btn-secondary"
                  disabled={page <= 1 || loading}
                  onClick={() => handlePageChange(page - 1)}
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  &larr; Previous
                </button>
                <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                  Halaman {page} dari {totalPage}
                </span>
                <button
                  className="btn-secondary"
                  disabled={page >= totalPage || loading}
                  onClick={() => handlePageChange(page + 1)}
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.4;
          }
        }
        .pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
      `}</style>
    </main>
  );
}
