// Local dev should talk to the local gateway by default, while production keeps Railway.
const defaultApiBase = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/api'
  : 'https://gateway-production-69b3.up.railway.app';

const API_BASE = (import.meta.env.VITE_API_BASE || defaultApiBase).replace(/\/$/, "");

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
    const res = await fetch(`${API_BASE}${path}`);
    const data = await readResponse(res);
    if (!res.ok) throw new Error(data.message || 'Error en request GET');
    return data as T;
  }

  public async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
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
}

export const api = new ApiService();
