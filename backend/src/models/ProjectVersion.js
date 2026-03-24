import mongoose from "mongoose";

const versionSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    prompt: { type: String, required: true },
    files: { type: Map, of: String, required: true },
    zipUrl: { type: String, required: true },
    securityAudit: {
      blocked: { type: Boolean, default: false },
      issues: { type: [String], default: [] }
    }
  },
  { timestamps: true }
);

export const ProjectVersion = mongoose.model("ProjectVersion", versionSchema);
