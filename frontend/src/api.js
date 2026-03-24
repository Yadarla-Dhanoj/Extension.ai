const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function getToken() {
  return localStorage.getItem("extensio_token") || "";
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken() ? `Bearer ${getToken()}` : "",
        ...(options.headers || {})
      }
    });
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : { message: await res.text() };
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  } catch (err) {
    if (err?.message === "Failed to fetch") {
      throw new Error("Unable to reach backend. Ensure backend is running on port 5000.");
    }
    throw err;
  }
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  listProjects: () => request("/projects"),
  createProject: (payload) => request("/projects", { method: "POST", body: JSON.stringify(payload) }),
  listVersions: (projectId) => request(`/projects/${projectId}/versions`),
  generate: (payload) => request("/generate", { method: "POST", body: JSON.stringify(payload) }),
  createCheckout: () => request("/billing/checkout", { method: "POST", body: JSON.stringify({}) })
};
