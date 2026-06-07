const BASE = import.meta.env.VITE_API_URL || "";

let authToken = localStorage.getItem("auth") || null;

export function setAuth(username, password) {
  authToken = btoa(`${username}:${password}`);
  localStorage.setItem("auth", authToken);
  localStorage.setItem("authUser", username);
}

export function clearAuth() {
  authToken = null;
  localStorage.removeItem("auth");
  localStorage.removeItem("authUser");
}

export function isAuthed() {
  return !!authToken;
}

export function currentUser() {
  return localStorage.getItem("authUser") || "";
}

async function req(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (authToken) headers["Authorization"] = `Basic ${authToken}`;
  const res = await fetch(BASE + path, { ...opts, headers });
  if (res.status === 401) {
    clearAuth();
    // Let the app know the session is gone (ignored during explicit login).
    if (!path.endsWith("/me")) {
      window.dispatchEvent(new Event("auth-expired"));
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res;
}

export const fileUrl = (path) => BASE + path;

// Build a direct, openable URL for a protected file by carrying the auth token
// as a query parameter. This lets a plain <a href> link work everywhere,
// including mobile browsers' native PDF viewer (no popup / blob workarounds).
export function authedFileUrl(path) {
  if (!authToken) return BASE + path;
  const sep = path.includes("?") ? "&" : "?";
  return `${BASE}${path}${sep}auth=${encodeURIComponent(authToken)}`;
}

export const api = {
  // auth
  me: () => req("/api/me"),

  // boats
  listBoats: () => req("/api/boats"),
  getBoat: (id) => req(`/api/boats/${id}`),
  createBoat: (data) =>
    req("/api/boats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateBoat: (id, data) =>
    req(`/api/boats/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteBoat: (id) => req(`/api/boats/${id}`, { method: "DELETE" }),

  // documents
  listDocuments: (id, q) =>
    req(`/api/boats/${id}/documents${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  createDocument: (id, { title, description, file }) => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    if (file) fd.append("file", file);
    return req(`/api/boats/${id}/documents`, { method: "POST", body: fd });
  },
  updateDocument: (docId, { title, description, file }) => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    if (file) fd.append("file", file);
    return req(`/api/documents/${docId}`, { method: "PUT", body: fd });
  },
  deleteDocument: (docId) => req(`/api/documents/${docId}`, { method: "DELETE" }),

  // maintenance
  listMaintenance: (id) => req(`/api/boats/${id}/maintenance`),
  addMaintenance: (id, { title, date, description, receipt }) => {
    const fd = new FormData();
    fd.append("title", title || "");
    fd.append("date", date);
    fd.append("description", description);
    if (receipt) fd.append("receipt", receipt);
    return req(`/api/boats/${id}/maintenance`, { method: "POST", body: fd });
  },
  updateMaintenance: (recId, { title, date, description, receipt }) => {
    const fd = new FormData();
    fd.append("title", title || "");
    fd.append("date", date);
    fd.append("description", description);
    if (receipt) fd.append("receipt", receipt);
    return req(`/api/maintenance/${recId}`, { method: "PUT", body: fd });
  },
  deleteMaintenance: (recId) =>
    req(`/api/maintenance/${recId}`, { method: "DELETE" }),

  // generic list (todos)
  listItems: (kind, id) => req(`/api/boats/${id}/${kind}`),
  addItem: (kind, id, { text, file }) => {
    const fd = new FormData();
    fd.append("text", text);
    if (file) fd.append("file", file);
    return req(`/api/boats/${id}/${kind}`, {
      method: "POST",
      body: fd,
    });
  },
  updateItem: (kind, itemId, { text, done, file }) => {
    const fd = new FormData();
    if (text !== undefined) fd.append("text", text);
    if (done !== undefined) fd.append("done", done);
    if (file) fd.append("file", file);
    return req(`/api/${kind}/${itemId}`, {
      method: "PUT",
      body: fd,
    });
  },
  deleteItem: (kind, itemId) =>
    req(`/api/${kind}/${itemId}`, { method: "DELETE" }),

  // logbook
  listLogbook: (id) => req(`/api/boats/${id}/logbook`),
  addLog: (id, data) =>
    req(`/api/boats/${id}/logbook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateLog: (entryId, data) =>
    req(`/api/logbook/${entryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteLog: (entryId) => req(`/api/logbook/${entryId}`, { method: "DELETE" }),

  // shopping (richer items)
  listShopping: (id) => req(`/api/boats/${id}/shopping`),
  addShopping: (id, { name, description, link, file }) => {
    const fd = new FormData();
    fd.append("name", name);
    if (description !== undefined) fd.append("description", description);
    if (link !== undefined) fd.append("link", link);
    if (file) fd.append("file", file);
    return req(`/api/boats/${id}/shopping`, {
      method: "POST",
      body: fd,
    });
  },
  updateShopping: (itemId, { name, description, link, done, file }) => {
    const fd = new FormData();
    if (name !== undefined) fd.append("name", name);
    if (description !== undefined) fd.append("description", description);
    if (link !== undefined) fd.append("link", link);
    if (done !== undefined) fd.append("done", done);
    if (file) fd.append("file", file);
    return req(`/api/shopping/${itemId}`, {
      method: "PUT",
      body: fd,
    });
  },
  deleteShopping: (itemId) =>
    req(`/api/shopping/${itemId}`, { method: "DELETE" }),
};
