const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const errorMessage = async (res, endpoint) => {
  try {
    const data = await res.json();
    if (data && data.message) return data.message;
  } catch {
    // ignore parse errors
  }
  return `${endpoint} failed: ${res.status} ${res.statusText}`.trim();
};

const api = {
  get: async (endpoint, token = null) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!res.ok) throw new Error(await errorMessage(res, endpoint));
    return res.json();
  },

  post: async (endpoint, body = {}, token = null) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await errorMessage(res, endpoint));
    return res.json();
  },

  put: async (endpoint, body = {}, token = null) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await errorMessage(res, endpoint));
    return res.json();
  },

  delete: async (endpoint, token = null) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!res.ok) throw new Error(await errorMessage(res, endpoint));
    return res.json();
  },
};

export default api;
