export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
};

export let mahasiswa: Mahasiswa[] = [
  {
    id: 1,
    nim: "0102523060",
    nama: "Wayan Adha Habiburrahman Alghifari",
    prodi: "Informatika",
    angkatan: 2023,
  },
  {
    id: 2,
    nim: "0102523054",
    nama: "Salman Ramzan Shaikh",
    prodi: "Informatika",
    angkatan: 2023,
  },
  {
    id: 3,
    nim: "0102523025",
    nama: "Mentari Gemala",
    prodi: "Informatika",
    angkatan: 2023,
  },
  {
    id: 4,
    nim: "0102523045",
    nama: "Muhammad 'Ubaidillah A",
    prodi: "Informatika",
    angkatan: 2023,
  },
];
