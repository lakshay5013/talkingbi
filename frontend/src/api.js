export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const TOKEN_KEY = 'talking_bi_token';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
};

const toJson = async (response) => {
  const raw = await response.text();
  let data = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch (_err) {
      data = null;
    }
  }

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    const message = data?.error || data?.message || raw || fallback;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (data !== null) {
    return data;
  }

  return raw ? { data: raw } : {};
};

const buildHeaders = (extraHeaders = {}) => {
  const headers = { ...extraHeaders };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const withQuery = (path, params) => {
  if (!params || typeof params !== 'object') {
    return path;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};

export const apiGet = (path, params) =>
  fetch(`${API_BASE_URL}${withQuery(path, params)}`, {
    headers: buildHeaders(),
  }).then(toJson);

export const apiPost = (path, body) =>
  fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  }).then(toJson);

export const apiDelete = (path) =>
  fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  }).then(toJson);
