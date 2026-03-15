// API base: uses /api (which Nginx proxies to gateway in production)
const defaultApiBase = '/api';

const API_BASE = (import.meta.env.VITE_API_BASE || defaultApiBase).replace(/\/$/, "");

// Helper to get JWT token from localStorage
function getToken(): string | null {
  return localStorage.getItem('authToken');
}

// Helper for parsing JSON or Text responses
export async function readResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

class ApiService {
  public async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include'
    });
    const data = await readResponse(res);
    if (!res.ok) throw new Error(data.message || 'Error en request GET');
    return data as T;
  }

  public async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    const data = await readResponse(res);
    if (!res.ok) throw new Error(data.message || 'Error en request POST');
    return data as T;
  }

  public async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await readResponse(res);
    if (!res.ok) throw new Error(data.message || 'Error en request PUT');
    return data as T;
  }
  public async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
    const data = await readResponse(res);
    if (!res.ok) throw new Error(data.message || 'Error en request DELETE');
    return data as T;
  }

  // Auth-aware methods that include JWT token in Authorization header
  public async authPost<T>(path: string, body: unknown): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify(body)
    });
    const data = await readResponse(res);
    if (!res.ok) throw new Error(data.message || 'Error en request POST');
    return data as T;
  }

  public async authPut<T>(path: string, body?: unknown): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await readResponse(res);
    if (!res.ok) throw new Error(data.message || 'Error en request PUT');
    return data as T;
  }

  public async authDelete<T>(path: string): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` })
      }
    });
    const data = await readResponse(res);
    if (!res.ok) throw new Error(data.message || 'Error en request DELETE');
    return data as T;
  }
}

export const api = new ApiService();
