const BLOCKED_SNIPPETS = [
  "eval(",
  "new Function(",
  "child_process",
  "fs.rm(",
  "chrome.debugger",
  "chrome.scripting.executeScript({func:"
];

const BLOCKED_PERMISSIONS = ["debugger", "nativeMessaging", "management"];

export function sanitizeFileMap(files) {
  const clean = {};
  for (const [name, content] of Object.entries(files || {})) {
    if (!name || typeof content !== "string") continue;
    if (name.includes("..") || name.startsWith("/") || name.startsWith("\\")) continue;
    const safeName = name.trim();
    if (!safeName) continue;
    clean[safeName] = content;
  }
  if (!clean["manifest.json"]) throw new Error("manifest.json is required");
  return clean;
}

function parseManifest(manifestRaw) {
  try {
    return JSON.parse(manifestRaw);
  } catch {
    throw new Error("manifest.json must be valid JSON");
  }
}

export function runSecurityAudit(files) {
  const issues = [];

  for (const [filename, content] of Object.entries(files)) {
    const lower = content.toLowerCase();
    for (const snippet of BLOCKED_SNIPPETS) {
      if (lower.includes(snippet.toLowerCase())) {
        issues.push(`Blocked snippet "${snippet}" in ${filename}`);
      }
    }
  }

  const manifest = parseManifest(files["manifest.json"]);
  if (manifest.manifest_version !== 3) {
    issues.push("manifest_version must be 3");
  }
  const permissions = Array.isArray(manifest.permissions) ? manifest.permissions : [];
  for (const permission of permissions) {
    if (BLOCKED_PERMISSIONS.includes(permission)) {
      issues.push(`Blocked permission "${permission}" in manifest.json`);
    }
  }

  return {
    blocked: issues.length > 0,
    issues
  };
}
