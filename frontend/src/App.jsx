import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { api } from "./api";

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.16), transparent 30%), radial-gradient(circle at 90% 0%, rgba(99, 102, 241, 0.22), transparent 35%), linear-gradient(180deg, #0b1220 0%, #111827 100%)",
  color: "#e5e7eb",
  fontFamily: "Inter, Segoe UI, Arial, sans-serif",
  padding: "24px",
  position: "relative",
  overflow: "hidden"
};

const container = {
  maxWidth: 1120,
  margin: "0 auto",
  lineHeight: 1.4,
  position: "relative",
  zIndex: 1
};

const glassCard = {
  background: "rgba(17, 24, 39, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  borderRadius: 14,
  padding: 16,
  boxShadow: "0 16px 36px rgba(2, 6, 23, 0.35)",
  backdropFilter: "blur(4px)"
};

const primaryBtn = {
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  padding: "10px 14px",
  cursor: "pointer"
};

const ghostBtn = {
  background: "rgba(31, 41, 55, 0.85)",
  color: "#e5e7eb",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  borderRadius: 10,
  fontWeight: 600,
  padding: "10px 14px",
  cursor: "pointer"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background: "rgba(17, 24, 39, 0.72)",
  color: "#e5e7eb"
};

const muted = {
  color: "#94a3b8"
};

function MouseDotsBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const dots = Array.from({ length: 58 }).map((_, i) => ({
      x: (width / 58) * i + Math.random() * 30,
      y: Math.random() * height,
      z: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;
    let raf = null;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;

        const dx = (mouseX - d.x) / width;
        const dy = (mouseY - d.y) / height;
        const px = d.x + dx * 22 * d.z;
        const py = d.y + dy * 22 * d.z;
        const radius = 1.2 + d.z * 2.2;
        const alpha = 0.28 + d.z * 0.35;

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
        ctx.fill();
      }
      raf = window.requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    render();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.72
      }}
    />
  );
}

function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const title = mode === "login" ? "Login" : "Register";

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        const data = await api.login({ email, password });
        localStorage.setItem("extensio_token", data.token);
        localStorage.setItem("extensio_user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        await api.register({ name, email, password });
        setPassword("");
        setName("");
        navigate("/login?registered=1");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={page}>
      <MouseDotsBackground />
      <div
        style={{
          ...container,
          maxWidth: 430,
          minHeight: "calc(100vh - 48px)",
          display: "flex",
          alignItems: "center"
        }}
      >
        <div style={glassCard}>
          <h1 style={{ marginTop: 0, marginBottom: 4 }}>Extensio.ai</h1>
          <p style={{ ...muted, marginTop: 0 }}>No-Code Extension Factory</p>
          <h2 style={{ textAlign: "center", marginBottom: 14 }}>{title}</h2>
          <form
            onSubmit={submit}
            style={{
              display: "grid",
              gap: 10,
              maxWidth: 320,
              margin: "0 auto",
              justifyItems: "center"
            }}
          >
            {mode === "register" && (
              <input
                style={inputStyle}
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              style={inputStyle}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" style={primaryBtn}>
              {title}
            </button>
          </form>
          {error && <p style={{ color: "#fb7185" }}>{error}</p>}
          {mode === "login" && location.search.includes("registered=1") && (
            <p style={{ color: "#34d399" }}>Registration successful. Please login to continue.</p>
          )}
          {mode === "login" ? (
            <p>
              New user? <a href="/register">Create account</a>
            </p>
          ) : (
            <p>
              Already have account? <a href="/login">Login</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [versions, setVersions] = useState([]);
  const [title, setTitle] = useState("My Extension Project");
  const [prompt, setPrompt] = useState(
    "Make a Chrome extension that blocks all images on a website and replaces them with a red square."
  );
  const [advanced, setAdvanced] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [billingMessage, setBillingMessage] = useState("");
  const [previewFile, setPreviewFile] = useState("");
  const [dbMode, setDbMode] = useState("-");
  const defaultRequirement =
    "Make a Chrome extension that blocks all images on a website and replaces them with a red square.";
  const user = useMemo(() => JSON.parse(localStorage.getItem("extensio_user") || "{}"), []);

  async function loadProjects() {
    try {
      const data = await api.listProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadHealth() {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setDbMode(data.databaseMode || "-");
    } catch {
      setDbMode("unreachable");
    }
  }

  useEffect(() => {
    loadProjects();
    loadHealth();
  }, []);

  useEffect(() => {
    if (!selected && projects.length > 0) {
      openProject(projects[0]);
    }
  }, [projects]);

  async function createProject() {
    setError("");
    try {
      const project = await api.createProject({ title });
      setProjects([project, ...projects]);
      setSelected(project);
    } catch (err) {
      setError(err.message);
    }
  }

  async function openProject(project) {
    setSelected(project);
    setResult(null);
    setError("");
    try {
      const data = await api.listVersions(project._id);
      setVersions(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function generate() {
    setError("");
    try {
      let activeProject = selected;
      if (!activeProject?._id) {
        if (projects.length > 0) {
          activeProject = projects[0];
          await openProject(activeProject);
        } else {
          activeProject = await api.createProject({ title: title || "My Extension Project" });
          setProjects([activeProject]);
          await openProject(activeProject);
        }
      }

      const safePrompt = prompt?.trim() ? prompt : defaultRequirement;
      const data = await api.generate({
        projectId: activeProject._id,
        prompt: safePrompt,
        advancedFeature: advanced
      });
      setResult(data);
      const firstFile = Object.keys(data.files || {})[0] || "";
      setPreviewFile(firstFile);
      await openProject(activeProject);
      await loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("extensio_token");
    localStorage.removeItem("extensio_user");
    navigate("/login");
  }

  async function upgradeToPro() {
    setBillingMessage("");
    setError("");
    try {
      const data = await api.createCheckout();
      if (!data.configured) {
        setBillingMessage(data.message || "Billing is not configured.");
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={page}>
      <MouseDotsBackground />
      <div style={container}>
        <div
          style={{
            ...glassCard,
            marginBottom: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap"
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Extensio.ai Dashboard</h1>
            <p style={{ ...muted, marginTop: 6, marginBottom: 0 }}>
              Build and package Chrome extensions with AI-powered workflows
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={logout} style={ghostBtn}>
              Logout
            </button>
            {user.plan !== "pro" && (
              <button onClick={upgradeToPro} style={primaryBtn}>
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
            marginBottom: 14
          }}
        >
          <div style={glassCard}>
            <p style={{ ...muted, marginTop: 0 }}>Current User</p>
            <h3 style={{ margin: 0 }}>{user.email || "-"}</h3>
          </div>
          <div style={glassCard}>
            <p style={{ ...muted, marginTop: 0 }}>Plan</p>
            <h3 style={{ margin: 0 }}>{(user.plan || "free").toUpperCase()}</h3>
          </div>
          <div style={glassCard}>
            <p style={{ ...muted, marginTop: 0 }}>Projects</p>
            <h3 style={{ margin: 0 }}>{projects.length}</h3>
          </div>
          <div style={glassCard}>
            <p style={{ ...muted, marginTop: 0 }}>Versions (selected project)</p>
            <h3 style={{ margin: 0 }}>{versions.length}</h3>
          </div>
          <div style={glassCard}>
            <p style={{ ...muted, marginTop: 0 }}>Database Mode</p>
            <h3 style={{ margin: 0 }}>{dbMode}</h3>
          </div>
        </div>

        {billingMessage && <p style={{ color: "#c4b5fd" }}>{billingMessage}</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: 14,
            alignItems: "start"
          }}
        >
          <div style={glassCard}>
            <h3 style={{ marginTop: 0 }}>Project Workspace</h3>
            <p style={muted}>Create and manage extension projects.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
              <button onClick={createProject} style={primaryBtn}>
                Create
              </button>
            </div>

            <h4 style={{ marginTop: 16, marginBottom: 8 }}>Your Projects</h4>
            <div style={{ display: "grid", gap: 6 }}>
              {projects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => openProject(p)}
                  style={{
                    ...ghostBtn,
                    textAlign: "left",
                    borderColor:
                      selected?._id === p._id ? "rgba(129, 140, 248, 0.9)" : "rgba(148, 163, 184, 0.35)"
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div style={glassCard}>
            <h3 style={{ marginTop: 0 }}>AI Builder Console</h3>
            <p style={muted}>
              Project: <b style={{ color: "#e2e8f0" }}>{selected?.title || "Auto-select enabled"}</b>
            </p>
            <textarea
              rows={8}
              style={{ ...inputStyle, resize: "vertical" }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <label style={{ display: "block", marginTop: 10, color: "#cbd5e1" }}>
              <input type="checkbox" checked={advanced} onChange={(e) => setAdvanced(e.target.checked)} /> Use
              advanced feature gate
            </label>
            <button style={{ ...primaryBtn, marginTop: 10 }} onClick={generate}>
              Generate + Package
            </button>
            {error && <p style={{ color: "#fb7185" }}>{error}</p>}

            {result && (
              <div style={{ ...glassCard, marginTop: 12, background: "rgba(15, 23, 42, 0.72)" }}>
                <h4 style={{ marginTop: 0 }}>Latest Build Ready</h4>
                <p style={{ marginBottom: 4 }}>
                  Download:{" "}
                  <a href={result.zipUrl} target="_blank" rel="noreferrer">
                    {result.zipUrl}
                  </a>
                </p>
                <p style={{ margin: "4px 0" }}>Files generated: {Object.keys(result.files || {}).length}</p>
                <p style={{ margin: "4px 0" }}>Generated files: {Object.keys(result.files || {}).join(", ")}</p>
                <div style={{ marginTop: 10 }}>
                  <p style={{ ...muted, margin: "0 0 6px 0" }}>Practical Output Preview</p>
                  <select
                    style={{ ...inputStyle, marginBottom: 8 }}
                    value={previewFile}
                    onChange={(e) => setPreviewFile(e.target.value)}
                  >
                    {Object.keys(result.files || {}).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    rows={8}
                    readOnly
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "Consolas, monospace" }}
                    value={result.files?.[previewFile] || ""}
                  />
                </div>
              </div>
            )}

            <h3 style={{ marginTop: 18 }}>Version History</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {versions.map((v) => (
                <div
                  key={v._id}
                  style={{
                    background: "rgba(2, 6, 23, 0.5)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                    borderRadius: 10,
                    padding: 10
                  }}
                >
                  <div style={{ color: "#cbd5e1" }}>{new Date(v.createdAt).toLocaleString()}</div>
                  <div style={{ whiteSpace: "pre-wrap", margin: "6px 0", color: "#94a3b8" }}>{v.prompt}</div>
                  <a href={v.zipUrl} target="_blank" rel="noreferrer">
                    Download Zip
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("extensio_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
