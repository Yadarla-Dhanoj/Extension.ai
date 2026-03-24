import express from "express";
import { isDbConnected } from "../config/db.js";
import { Project } from "../models/Project.js";
import { ProjectVersion } from "../models/ProjectVersion.js";
import { memoryStore } from "../services/inMemoryStore.js";

export const projectRouter = express.Router();

projectRouter.get("/", async (req, res, next) => {
  try {
    const projects = isDbConnected()
      ? await Project.find({ userId: req.user.id }).sort({ updatedAt: -1 })
      : await memoryStore.listProjectsByUser(req.user.id);
    return res.json(projects);
  } catch (err) {
    return next(err);
  }
});

projectRouter.post("/", async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });
    const project = isDbConnected()
      ? await Project.create({ userId: req.user.id, title, latestPrompt: "" })
      : await memoryStore.createProject({ userId: req.user.id, title });
    return res.json(project);
  } catch (err) {
    return next(err);
  }
});

projectRouter.get("/:id/versions", async (req, res, next) => {
  try {
    const project = isDbConnected()
      ? await Project.findOne({ _id: req.params.id, userId: req.user.id })
      : await memoryStore.findProjectByIdAndUser(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const versions = isDbConnected()
      ? await ProjectVersion.find({
          projectId: project._id,
          userId: req.user.id
        }).sort({ createdAt: -1 })
      : await memoryStore.listVersions(project._id, req.user.id);
    return res.json(versions);
  } catch (err) {
    return next(err);
  }
});
