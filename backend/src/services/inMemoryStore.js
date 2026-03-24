import { v4 as uuidv4 } from "uuid";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dbDir, "localdb.json");

function nowIso() {
  return new Date().toISOString();
}

async function ensureDbFile() {
  await fsp.mkdir(dbDir, { recursive: true });
  try {
    await fsp.access(dbPath);
  } catch {
    await fsp.writeFile(
      dbPath,
      JSON.stringify({ users: [], projects: [], versions: [] }, null, 2),
      "utf-8"
    );
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fsp.readFile(dbPath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return { users: [], projects: [], versions: [] };
  }
}

async function writeDb(db) {
  await ensureDbFile();
  await fsp.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export const memoryStore = {
  async findUserByEmail(email) {
    const db = await readDb();
    return db.users.find((u) => u.email === email) || null;
  },
  async findUserById(id) {
    const db = await readDb();
    return db.users.find((u) => u._id === id) || null;
  },
  async createUser({ name, email, passwordHash }) {
    const db = await readDb();
    const user = {
      _id: uuidv4(),
      name,
      email,
      passwordHash,
      plan: "free",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    db.users.push(user);
    await writeDb(db);
    return user;
  },
  async listProjectsByUser(userId) {
    const db = await readDb();
    return db.projects
      .filter((p) => p.userId === userId)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  },
  async createProject({ userId, title }) {
    const db = await readDb();
    const project = {
      _id: uuidv4(),
      userId,
      title,
      latestPrompt: "",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    db.projects.push(project);
    await writeDb(db);
    return project;
  },
  async findProjectByIdAndUser(projectId, userId) {
    const db = await readDb();
    return db.projects.find((p) => p._id === projectId && p.userId === userId) || null;
  },
  async saveProject(project) {
    const db = await readDb();
    const idx = db.projects.findIndex((p) => p._id === project._id);
    if (idx === -1) return project;
    project.updatedAt = nowIso();
    db.projects[idx] = project;
    await writeDb(db);
    return project;
  },
  async createVersion({ projectId, userId, prompt, files, zipUrl, securityAudit }) {
    const db = await readDb();
    const version = {
      _id: uuidv4(),
      projectId,
      userId,
      prompt,
      files,
      zipUrl,
      securityAudit,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    db.versions.push(version);
    await writeDb(db);
    return version;
  },
  async listVersions(projectId, userId) {
    const db = await readDb();
    return db.versions
      .filter((v) => v.projectId === projectId && v.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
};
