import express from "express";
import { v4 as uuidv4 } from "uuid";
import { isDbConnected } from "../config/db.js";
import { Project } from "../models/Project.js";
import { ProjectVersion } from "../models/ProjectVersion.js";
import { writeFilesAndZip } from "../services/extensionService.js";
import { memoryStore } from "../services/inMemoryStore.js";
import { generateExtensionFilesFromPrompt } from "../services/llmService.js";
import { runSecurityAudit, sanitizeFileMap } from "../services/securityService.js";

export function createGenerationRouter({ downloadsDir }) {
  const generationRouter = express.Router();

  generationRouter.post("/", async (req, res, next) => {
    try {
      const { projectId, prompt, advancedFeature = false } = req.body;
      if (!projectId || !prompt) {
        return res.status(400).json({ message: "projectId and prompt are required" });
      }
      if (advancedFeature && req.user.plan !== "pro") {
        return res.status(403).json({ message: "Upgrade required for advanced features" });
      }

      const project = isDbConnected()
        ? await Project.findOne({ _id: projectId, userId: req.user.id })
        : await memoryStore.findProjectByIdAndUser(projectId, req.user.id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      const llmOutput = await generateExtensionFilesFromPrompt(prompt);
      const files = sanitizeFileMap(llmOutput.files);
      const audit = runSecurityAudit(files);
      if (audit.blocked) {
        return res.status(422).json({
          message: "Generated extension failed security audit",
          issues: audit.issues
        });
      }

      const zipUrl = await writeFilesAndZip(files, `ext-${uuidv4().slice(0, 8)}`, downloadsDir);
      if (isDbConnected()) {
        await ProjectVersion.create({
          projectId: project._id,
          userId: req.user.id,
          prompt,
          files,
          zipUrl,
          securityAudit: audit
        });
      } else {
        await memoryStore.createVersion({
          projectId: project._id,
          userId: req.user.id,
          prompt,
          files,
          zipUrl,
          securityAudit: audit
        });
      }
      project.latestPrompt = prompt;
      if (llmOutput.title) project.title = llmOutput.title;
      if (isDbConnected()) {
        await project.save();
      } else {
        await memoryStore.saveProject(project);
      }

      return res.json({ title: project.title, files, zipUrl, securityAudit: audit });
    } catch (err) {
      return next(err);
    }
  });

  return generationRouter;
}
