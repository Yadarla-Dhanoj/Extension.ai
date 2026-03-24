import archiver from "archiver";
import fs from "fs";
import fsp from "fs/promises";
import os from "os";
import path from "path";

export async function ensureDownloadsDir(downloadsDir) {
  await fsp.mkdir(downloadsDir, { recursive: true });
}

export async function writeFilesAndZip(files, baseName, downloadsDir) {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "extensio-"));

  for (const [name, content] of Object.entries(files)) {
    const target = path.join(tempDir, name);
    await fsp.mkdir(path.dirname(target), { recursive: true });
    await fsp.writeFile(target, content, "utf-8");
  }

  const zipName = `${baseName}-${Date.now()}.zip`;
  const zipPath = path.join(downloadsDir, zipName);

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();
  });

  await fsp.rm(tempDir, { recursive: true, force: true });
  return `/downloads/${zipName}`;
}
