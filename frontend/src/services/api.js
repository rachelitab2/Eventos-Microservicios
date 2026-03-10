// ==================================================================
//  API Service — Comunicación con el backend
//  Todas las llamadas HTTP pasan por aquí
// ==================================================================

const API_BASE = 'http://localhost:8080/api';

const Api = {

  // ---- Método genérico de fetch ----
  async request(method, endpoint, body = null, requiresAuth = true) {
    const headers = { 'Content-Type': 'application/json' };

    if (requiresAuth) {
      const token = Auth.getToken();
      if (!token) {
        navigate('login');
        return null;
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, config);

      if (res.status === 401) {
        Auth.logout();
        navigate('login');
        showToast('Sesión expirada. Inicia sesión de nuevo.', 'error');
        return null;
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const errorMsg = data?.message || `Error ${res.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
      }
      throw err;
    }
  },

  // ---- AUTH ----
  auth: {
    login: (body) => Api.request('POST', '/auth/login', body, false),
    register: (body) => Api.request('POST', '/auth/register', body, false),
  },

  // ---- EVENTS ----
  events: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return Api.request('GET', `/events${q ? '?' + q : ''}`);
    },
    getById: (id) => Api.request('GET', `/events/${id}`),
    create: (body) => Api.request('POST', '/events', body),
    update: (id, body) => Api.request('PUT', `/events/${id}`, body),
    publish: (id) => Api.request('PATCH', `/events/${id}/publish`),
    cancel: (id) => Api.request('PATCH', `/events/${id}/cancel`),
    delete: (id) => Api.request('DELETE', `/events/${id}`),
    register: (id, body) => Api.request('POST', `/events/${id}/register`, body),
    cancelRegistration: (id) => Api.request('DELETE', `/events/${id}/register`),
    myRegistrations: () => Api.request('GET', '/events/my-registrations'),
    myOrganizerEvents: () => Api.request('GET', '/events/my-events'),
    attendees: (id) => Api.request('GET', `/events/${id}/attendees`),
  },
};
