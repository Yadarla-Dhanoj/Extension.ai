import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true },
    latestPrompt: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
