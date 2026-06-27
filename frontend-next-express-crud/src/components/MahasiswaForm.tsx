"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { Mahasiswa, Prodi } from "@/lib/api";

type Props = {
  selectedMahasiswa: Mahasiswa | null;
  prodiList: Prodi[];
  onSubmit: (formData: FormData) => Promise<void>;
  onCancelEdit: () => void;
};

export default function MahasiswaForm({
  selectedMahasiswa,
  prodiList,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [angkatan, setAngkatan] = useState(new Date().getFullYear());
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedMahasiswa) {
      setNim(selectedMahasiswa.nim);
      setNama(selectedMahasiswa.nama);
      setProdiId(String(selectedMahasiswa.prodi_id));
      setAngkatan(selectedMahasiswa.angkatan);
    } else {
      setNim("");
      setNama("");
      setProdiId(prodiList.length > 0 ? String(prodiList[0].id) : "");
      setAngkatan(new Date().getFullYear());
    }
    setFotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedMahasiswa, prodiList]);

  // Set default prodi selection once list is loaded
  useEffect(() => {
    if (!selectedMahasiswa && prodiList.length > 0 && !prodiId) {
      setProdiId(String(prodiList[0].id));
    }
  }, [prodiList, selectedMahasiswa, prodiId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nim", nim);
      formData.append("nama", nama);
      formData.append("prodi_id", prodiId);
      formData.append("angkatan", String(angkatan));
      
      if (fotoFile) {
        formData.append("foto", fotoFile);
      }

      await onSubmit(formData);
      
      // Reset form if not editing
      if (!selectedMahasiswa) {
        setNim("");
        setNama("");
        setProdiId(prodiList.length > 0 ? String(prodiList[0].id) : "");
        setAngkatan(new Date().getFullYear());
        setFotoFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{selectedMahasiswa ? "Ubah Informasi Mahasiswa" : "Registrasi Mahasiswa Baru"}</h2>
      <div className="grid">
        <div className="form-group">
          <label htmlFor="nim">NIM</label>
          <input
            id="nim"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            placeholder="Contoh: 2201001"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="nama">Nama</label>
          <input
            id="nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama mahasiswa"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="prodi">Program Studi</label>
          <select
            id="prodi"
            value={prodiId}
            onChange={(e) => setProdiId(e.target.value)}
            required
            style={{
              backgroundColor: "var(--bg-app)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              outline: "none"
            }}
          >
            <option value="" disabled>Pilih Program Studi</option>
            {prodiList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_prodi}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="angkatan">Angkatan</label>
          <input
            id="angkatan"
            type="number"
            value={angkatan}
            onChange={(e) => setAngkatan(Number(e.target.value))}
            required
          />
        </div>
        <div className="form-group" style={{ gridColumn: "span 2" }}>
          <label htmlFor="foto">Foto Profil (Maks. 2MB - JPG/PNG/WEBP)</label>
          <input
            id="foto"
            type="file"
            ref={fileInputRef}
            accept="image/jpeg, image/png, image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFotoFile(e.target.files[0]);
              }
            }}
            style={{ padding: "8px 12px" }}
          />
        </div>
      </div>
      <div className="actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : selectedMahasiswa ? "Update" : "Simpan"}
        </button>
        {selectedMahasiswa && (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Batal Edit
          </button>
        )}
      </div>
    </form>
  );
}
