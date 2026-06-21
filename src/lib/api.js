const API_BASE = import.meta.env.VITE_API_BASE_URL;

let accessToken = null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  if (res.status === 401 && accessToken && onUnauthorized && path !== '/auth/refresh' && path !== '/auth/login') {
    try {
      const newToken = await onUnauthorized();
      if (newToken) {
        // Retry with new token
        const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
        const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers: retryHeaders });
        if (!retryRes.ok) throw await createError(retryRes);
        if (retryRes.status === 204) return null;
        return retryRes.json();
      }
    } catch (e) {
      throw e;
    }
  }

  if (!res.ok) {
    throw await createError(res);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function createError(res) {
  let payload;
  try { payload = await res.json(); } catch (_) { payload = { error: { message: res.statusText } }; }
  const err = new Error(payload?.error?.message || res.statusText);
  err.status = res.status;
  err.payload = payload;
  return err;
}

export const api = {
  // service
  health: () => request('/health'),
  ready: () => request('/ready'),

  // auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refresh: (body) => request('/auth/refresh', { method: 'POST', body: JSON.stringify(body) }),

  // users
  me: () => request('/users/me'),
  updateMe: (body) => request('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body) => request('/users/password', { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAccount: (password) => request('/users/me', { method: 'DELETE', body: JSON.stringify({ password }) }),

  // tasks
  listTasks: () => request('/tasks'),
  createTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  taskStats: () => request('/tasks/stats'),

  // lessons
  listLessons: () => request('/lessons'),
  createLesson: (body) => request('/lessons', { method: 'POST', body: JSON.stringify(body) }),
  updateLesson: (id, body) => request(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteLesson: (id) => request(`/lessons/${id}`, { method: 'DELETE' }),

  // materials
  listMaterials: () => request('/materials'),
  createMaterial: (body) => request('/materials', { method: 'POST', body: JSON.stringify(body) }),
  deleteMaterial: (id) => request(`/materials/${id}`, { method: 'DELETE' }),
  updateMaterial: (id, body) => request(`/materials/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  // statistics
  stats: (query) => request(`/statistics?${new URLSearchParams(query)}`),
  setUnauthorizedHandler,
};

export default api;
