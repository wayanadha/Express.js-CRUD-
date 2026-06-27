import { getToken } from "./auth";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi_id: number;
  nama_prodi: string;
  angkatan: number;
  foto?: string | null;
  created_at?: string;
};

export type Prodi = {
  id: number;
  nama_prodi: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  created_at?: string;
};

export type UserInput = {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "operator" | "viewer";
};

type ApiResponse<T> = {
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Terjadi kesalahan saat mengakses API");
  }

  return result;
}

// Add token to headers helper
function getHeaders(isMultipart = false) {
  const token = getToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
}

// MAHASISWA APIS
export async function getMahasiswa(params: {
  search?: string;
  prodi_id?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Mahasiswa[]; meta: ApiResponse<Mahasiswa[]>["meta"] }> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.prodi_id) query.set("prodi_id", params.prodi_id);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const response = await fetch(`${API_URL}/mahasiswa?${query.toString()}`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  const result = await handleResponse<Mahasiswa[]>(response);
  return {
    data: result.data || [],
    meta: result.meta,
  };
}

export async function createMahasiswa(formData: FormData): Promise<Mahasiswa> {
  const response = await fetch(`${API_URL}/mahasiswa`, {
    method: "POST",
    headers: getHeaders(true), // true means multipart, don't set Content-Type
    body: formData,
  });

  const result = await handleResponse<Mahasiswa>(response);
  return result.data as Mahasiswa;
}

export async function updateMahasiswa(
  id: number,
  formData: FormData
): Promise<void> {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "PUT",
    headers: getHeaders(true), // true means multipart
    body: formData,
  });

  await handleResponse(response);
}

export async function deleteMahasiswa(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  await handleResponse(response);
}

// PRODI APIS
export async function getProdi(): Promise<Prodi[]> {
  const response = await fetch(`${API_URL}/prodi`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  const result = await handleResponse<Prodi[]>(response);
  return result.data || [];
}

// USER APIS (ADMIN ONLY)
export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  const result = await handleResponse<User[]>(response);
  return result.data || [];
}

export async function createUser(payload: UserInput): Promise<void> {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  await handleResponse(response);
}

export async function updateUser(id: number, payload: Omit<UserInput, "password">): Promise<void> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  await handleResponse(response);
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  await handleResponse(response);
}

export async function resetPassword(id: number): Promise<{ temporaryPassword: string }> {
  const response = await fetch(`${API_URL}/users/${id}/reset-password`, {
    method: "PATCH",
    headers: getHeaders(),
  });

  const result = await handleResponse<{ temporaryPassword: string }>(response);
  return result.data || { temporaryPassword: "" };
}
