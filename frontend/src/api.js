// API_BASE is "/api" during `vite` dev when the proxy is enabled.
// When the proxy is not active (opening `dist/` directly, using preview, etc),
// we fall back to direct backend URLs.
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function candidateApiBases() {
  const bases = [API_BASE, "http://localhost:5000/api", "http://127.0.0.1:5000/api"];
  // Deduplicate while preserving order.
  return [...new Set(bases)];
}

function getToken() {
  return localStorage.getItem("extensio_token") || "";
}

async function request(path, options = {}) {
  const lastErr = { message: "Unknown error" };

  for (const base of candidateApiBases()) {
    const url = `${base}${path}`;
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
      // Only retry on network-level failures (proxy not running, server unreachable).
      if (err?.message === "Failed to fetch") {
        lastErr.message = "Unable to reach backend (network). Ensure backend is running on port 5000.";
        continue;
      }
      throw err;
    }
  }

  throw new Error(lastErr.message);
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  listProjects: () => request("/projects"),
  createProject: (payload) => request("/projects", { method: "POST", body: JSON.stringify(payload) }),
  listVersions: (projectId) => request(`/projects/${projectId}/versions`),
  generate: (payload) => request("/generate", { method: "POST", body: JSON.stringify(payload) }),
  createCheckout: () => request("/billing/checkout", { method: "POST", body: JSON.stringify({}) }),
  health: () => request("/health", { method: "GET" })
};
